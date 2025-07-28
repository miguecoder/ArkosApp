const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener todas las ventas
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT v.*, 
                   COALESCE(SUM(dv.cantidad), 0) as total_productos
            FROM ventas v
            LEFT JOIN detalle_venta dv ON v.id = dv.venta_id
            GROUP BY v.id
            ORDER BY v.fecha_venta DESC, v.id DESC
        `);

        // Para cada venta, obtener información de las combinaciones agrupadas por talla
        for (let venta of rows) {
            const [detalles] = await pool.query(`
                SELECT dv.combinacion_id, dv.talla, SUM(dv.cantidad) as cantidad_total, c.nombre as combinacion_nombre,
                       GROUP_CONCAT(DISTINCT ce.imagen_url) as imagenes_estampados,
                       ci.id as imagen_id, ci.imagen_url as imagen_url, ci.es_predeterminada as imagen_es_predeterminada
                FROM detalle_venta dv
                JOIN combinaciones c ON dv.combinacion_id = c.id
                LEFT JOIN combinacion_estampados cce ON c.id = cce.combinacion_id
                LEFT JOIN codigos_estampado ce ON cce.estampado_id = ce.id
                LEFT JOIN combinacion_imagenes ci ON c.id = ci.combinacion_id AND ci.es_predeterminada = TRUE
                WHERE dv.venta_id = ?
                GROUP BY dv.combinacion_id, dv.talla, c.nombre, ci.id, ci.imagen_url, ci.es_predeterminada
            `, [venta.id]);

            venta.combinaciones = detalles.map(detalle => ({
                ...detalle,
                imagenes_estampados: detalle.imagenes_estampados ? detalle.imagenes_estampados.split(',') : [],
                imagen_predeterminada: detalle.imagen_id ? {
                    id: detalle.imagen_id,
                    imagen_url: detalle.imagen_url,
                    es_predeterminada: detalle.imagen_es_predeterminada
                } : null
            }));
        }

        // Convertir total_productos a número para cada venta
        const ventasConNumeros = rows.map(venta => ({
            ...venta,
            total_productos: parseInt(venta.total_productos) || 0
        }));

        res.json(ventasConNumeros);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener una venta por ID con detalles
router.get('/:id', async (req, res) => {
    try {
        const [ventas] = await pool.query('SELECT * FROM ventas WHERE id = ?', [req.params.id]);
        if (ventas.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const [detalles] = await pool.query(`
            SELECT dv.*, c.nombre as combinacion_nombre,
                   ci.id as imagen_id, ci.imagen_url as imagen_url, ci.es_predeterminada as imagen_es_predeterminada
            FROM detalle_venta dv
            JOIN combinaciones c ON dv.combinacion_id = c.id
            LEFT JOIN combinacion_imagenes ci ON c.id = ci.combinacion_id AND ci.es_predeterminada = TRUE
            WHERE dv.venta_id = ?
        `, [req.params.id]);

        const venta = ventas[0];
        venta.detalles = detalles.map(detalle => ({
            ...detalle,
            imagen_predeterminada: detalle.imagen_id ? {
                id: detalle.imagen_id,
                imagen_url: detalle.imagen_url,
                es_predeterminada: detalle.imagen_es_predeterminada
            } : null
        }));
        res.json(venta);
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear una nueva venta
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { fecha_venta, cliente, metodo_pago, estado_venta, fecha_pago, observaciones, items } = req.body;

        // Validar que items sea un array y no esté vacío
        if (!items || !Array.isArray(items) || items.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Debe incluir al menos un producto en la venta' });
        }

        // Crear la venta
        const [ventaResult] = await connection.query(
            'INSERT INTO ventas (fecha_venta, cliente, metodo_pago, estado_venta, fecha_pago, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
            [fecha_venta, cliente, metodo_pago || 'efectivo', estado_venta || 'pagado', fecha_pago || fecha_venta, observaciones]
        );

        const ventaId = ventaResult.insertId;
        let totalVenta = 0;
        let costoTotal = 0;

        // Insertar detalles y calcular totales
        for (const item of items) {
            const { combinacion_id, talla, cantidad, precio_unitario } = item;
            const subtotal = cantidad * precio_unitario;

            // Obtener el costo de la combinación
            const [precioResult] = await connection.query(
                'SELECT costo FROM precios_combinaciones WHERE combinacion_id = ? AND activo = TRUE',
                [combinacion_id]
            );

            const costoUnitario = precioResult.length > 0 ? parseFloat(precioResult[0].costo) : 0;
            const costoItem = cantidad * costoUnitario;

            await connection.query(
                'INSERT INTO detalle_venta (venta_id, combinacion_id, talla, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                [ventaId, combinacion_id, talla || 'M', cantidad, precio_unitario, subtotal]
            );

            totalVenta += subtotal;
            costoTotal += costoItem;
        }

        const gananciaTotal = totalVenta - costoTotal;

        // Actualizar totales de la venta
        await connection.query(
            'UPDATE ventas SET total = ?, costo_total = ?, ganancia_total = ? WHERE id = ?',
            [totalVenta, costoTotal, gananciaTotal, ventaId]
        );

        await connection.commit();

        res.status(201).json({
            id: ventaId,
            fecha_venta,
            cliente,
            metodo_pago,
            total: totalVenta,
            costo_total: costoTotal,
            ganancia_total: gananciaTotal
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear venta:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

// Actualizar una venta
router.put('/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { fecha_venta, cliente, metodo_pago, estado_venta, fecha_pago, observaciones, items } = req.body;

        // Validar que items sea un array y no esté vacío
        if (!items || !Array.isArray(items) || items.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Debe incluir al menos un producto en la venta' });
        }

        // Actualizar la venta
        const [ventaResult] = await connection.query(
            'UPDATE ventas SET fecha_venta = ?, cliente = ?, metodo_pago = ?, estado_venta = ?, fecha_pago = ?, observaciones = ? WHERE id = ?',
            [fecha_venta, cliente, metodo_pago || 'efectivo', estado_venta || 'pagado', fecha_pago || fecha_venta, observaciones, req.params.id]
        );

        if (ventaResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        // Eliminar detalles existentes
        await connection.query('DELETE FROM detalle_venta WHERE venta_id = ?', [req.params.id]);

        let totalVenta = 0;
        let costoTotal = 0;

        // Insertar nuevos detalles
        for (const item of items) {
            const { combinacion_id, talla, cantidad, precio_unitario } = item;
            const subtotal = cantidad * precio_unitario;

            // Obtener el costo de la combinación
            const [precioResult] = await connection.query(
                'SELECT costo FROM precios_combinaciones WHERE combinacion_id = ? AND activo = TRUE',
                [combinacion_id]
            );

            const costoUnitario = precioResult.length > 0 ? parseFloat(precioResult[0].costo) : 0;
            const costoItem = cantidad * costoUnitario;

            await connection.query(
                'INSERT INTO detalle_venta (venta_id, combinacion_id, talla, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                [req.params.id, combinacion_id, talla || 'M', cantidad, precio_unitario, subtotal]
            );

            totalVenta += subtotal;
            costoTotal += costoItem;
        }

        const gananciaTotal = totalVenta - costoTotal;

        // Actualizar totales de la venta
        await connection.query(
            'UPDATE ventas SET total = ?, costo_total = ?, ganancia_total = ? WHERE id = ?',
            [totalVenta, costoTotal, gananciaTotal, req.params.id]
        );

        await connection.commit();

        res.json({
            id: req.params.id,
            fecha_venta,
            cliente,
            metodo_pago,
            total: totalVenta,
            costo_total: costoTotal,
            ganancia_total: gananciaTotal
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar venta:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

// Eliminar una venta
router.delete('/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Eliminar detalles de la venta
        await connection.query('DELETE FROM detalle_venta WHERE venta_id = ?', [req.params.id]);

        // Eliminar la venta
        const [result] = await connection.query('DELETE FROM ventas WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        await connection.commit();
        res.json({ message: 'Venta eliminada correctamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

module.exports = router; 
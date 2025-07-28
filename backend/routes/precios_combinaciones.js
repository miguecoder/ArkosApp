const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Endpoint para métricas del dashboard (DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS)
router.get('/dashboard', async (req, res) => {
    try {
        // Obtener total de ventas
        const [ventasResult] = await pool.query(`
            SELECT
                COALESCE(SUM(total), 0) as ingresos_totales,
                COALESCE(SUM(costo_total), 0) as costos_totales,
                COALESCE(SUM(ganancia_total), 0) as ganancias_totales,
                COUNT(*) as total_ventas
            FROM ventas
        `);

        // Obtener métricas de combinaciones
        const [combinacionesResult] = await pool.query(`
            SELECT
                COUNT(DISTINCT pc.combinacion_id) as total_combinaciones,
                AVG(pc.porcentaje_ganancia) as promedio_margen_ganancia
            FROM precios_combinaciones pc
            WHERE pc.activo = TRUE
        `);

        // Obtener ventas del mes actual
        const [ventasMesResult] = await pool.query(`
            SELECT
                COALESCE(SUM(total), 0) as ingresos_mes,
                COALESCE(SUM(costo_total), 0) as costos_mes,
                COALESCE(SUM(ganancia_total), 0) as ganancias_mes,
                COUNT(*) as ventas_mes
            FROM ventas
            WHERE MONTH(fecha_venta) = MONTH(CURRENT_DATE())
            AND YEAR(fecha_venta) = YEAR(CURRENT_DATE())
        `);

        // Convertir todos los valores a números
        const dashboardData = {
            ingresos_totales: parseFloat(ventasResult[0].ingresos_totales) || 0,
            costos_totales: parseFloat(ventasResult[0].costos_totales) || 0,
            ganancias_totales: parseFloat(ventasResult[0].ganancias_totales) || 0,
            total_ventas: parseInt(ventasResult[0].total_ventas) || 0,
            total_combinaciones: parseInt(combinacionesResult[0].total_combinaciones) || 0,
            promedio_margen_ganancia: parseFloat(combinacionesResult[0].promedio_margen_ganancia) || 0,
            ingresos_mes: parseFloat(ventasMesResult[0].ingresos_mes) || 0,
            costos_mes: parseFloat(ventasMesResult[0].costos_mes) || 0,
            ganancias_mes: parseFloat(ventasMesResult[0].ganancias_mes) || 0,
            ventas_mes: parseInt(ventasMesResult[0].ventas_mes) || 0
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Error al obtener métricas del dashboard:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener todos los precios de combinaciones
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT pc.*, c.nombre as combinacion_nombre
            FROM precios_combinaciones pc
            JOIN combinaciones c ON pc.combinacion_id = c.id
            WHERE pc.activo = TRUE AND c.activo = TRUE
            ORDER BY c.nombre
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener precios de combinaciones:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener un precio por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT pc.*, c.nombre as combinacion_nombre
            FROM precios_combinaciones pc
            JOIN combinaciones c ON pc.combinacion_id = c.id
            WHERE pc.id = ? AND pc.activo = TRUE
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Precio no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener precio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener precio por combinación
router.get('/combinacion/:combinacionId', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT pc.*, c.nombre as combinacion_nombre
            FROM precios_combinaciones pc
            JOIN combinaciones c ON pc.combinacion_id = c.id
            WHERE pc.combinacion_id = ? AND pc.activo = TRUE AND c.activo = TRUE
        `, [req.params.combinacionId]);
        
        if (rows.length === 0) {
            return res.json(null);
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener precio por combinación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear un nuevo precio
router.post('/', async (req, res) => {
    try {
        const { combinacion_id, costo, precio_venta } = req.body;
        
        // Verificar si ya existe un precio para esta combinación
        const [existing] = await pool.query(
            'SELECT id FROM precios_combinaciones WHERE combinacion_id = ? AND activo = TRUE',
            [combinacion_id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Ya existe un precio para esta combinación' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO precios_combinaciones (combinacion_id, costo, precio_venta) VALUES (?, ?, ?)',
            [combinacion_id, costo, precio_venta]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            combinacion_id, 
            costo, 
            precio_venta 
        });
    } catch (error) {
        console.error('Error al crear precio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar un precio
router.put('/:id', async (req, res) => {
    try {
        const { costo, precio_venta } = req.body;
        const [result] = await pool.query(
            'UPDATE precios_combinaciones SET costo = ?, precio_venta = ? WHERE id = ? AND activo = TRUE',
            [costo, precio_venta, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Precio no encontrado' });
        }
        
        res.json({ id: req.params.id, costo, precio_venta });
    } catch (error) {
        console.error('Error al actualizar precio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Eliminar un precio (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE precios_combinaciones SET activo = FALSE WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Precio no encontrado' });
        }
        
        res.json({ message: 'Precio eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar precio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router; 
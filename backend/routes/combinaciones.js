const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/combinaciones');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'combinacion-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// Obtener todas las combinaciones con sus relaciones
router.get('/', async (req, res) => {
    try {
        const [combinaciones] = await pool.query(`
            SELECT c.*, 
                   GROUP_CONCAT(DISTINCT col.nombre) as colores,
                   GROUP_CONCAT(DISTINCT tt.nombre) as telas,
                   GROUP_CONCAT(DISTINCT p.nombre) as proveedores
            FROM combinaciones c
            LEFT JOIN combinacion_colores cc ON c.id = cc.combinacion_id
            LEFT JOIN colores col ON cc.color_id = col.id
            LEFT JOIN combinacion_telas ct ON c.id = ct.combinacion_id
            LEFT JOIN tipos_tela tt ON ct.tipo_tela_id = tt.id
            LEFT JOIN combinacion_proveedores cp ON c.id = cp.combinacion_id
            LEFT JOIN proveedores p ON cp.proveedor_id = p.id
            WHERE c.activo = TRUE
            GROUP BY c.id
            ORDER BY c.nombre
        `);

        // Obtener IDs de colores, telas y proveedores para cada combinación
        for (let combinacion of combinaciones) {
            // Obtener IDs de colores
            const [colorIds] = await pool.query(`
                SELECT color_id FROM combinacion_colores 
                WHERE combinacion_id = ?
            `, [combinacion.id]);
            combinacion.color_ids = colorIds.map(row => row.color_id);

            // Obtener IDs de telas
            const [telaIds] = await pool.query(`
                SELECT tipo_tela_id FROM combinacion_telas 
                WHERE combinacion_id = ?
            `, [combinacion.id]);
            combinacion.tela_ids = telaIds.map(row => row.tipo_tela_id);

            // Obtener IDs de proveedores
            const [proveedorIds] = await pool.query(`
                SELECT proveedor_id FROM combinacion_proveedores 
                WHERE combinacion_id = ?
            `, [combinacion.id]);
            combinacion.proveedor_ids = proveedorIds.map(row => row.proveedor_id);
        }

        // Obtener estampados, precios e imágenes para cada combinación
        for (let combinacion of combinaciones) {
            // Obtener estampados
            const [estampados] = await pool.query(`
                SELECT ce.*, cod.codigo, cod.descripcion, cod.imagen_url
                FROM combinacion_estampados ce
                JOIN codigos_estampado cod ON ce.estampado_id = cod.id
                WHERE ce.combinacion_id = ? AND cod.activo = TRUE
            `, [combinacion.id]);
            combinacion.estampados = estampados;

            // Obtener precio
            const [precios] = await pool.query(`
                SELECT id, costo, precio_venta, margen_ganancia, porcentaje_ganancia
                FROM precios_combinaciones
                WHERE combinacion_id = ? AND activo = TRUE
                LIMIT 1
            `, [combinacion.id]);
            combinacion.precio = precios.length > 0 ? precios[0] : null;

            // Obtener imágenes
            const [imagenes] = await pool.query(`
                SELECT id, imagen_url, es_predeterminada
                FROM combinacion_imagenes
                WHERE combinacion_id = ?
                ORDER BY es_predeterminada DESC, id ASC
            `, [combinacion.id]);
            combinacion.imagenes = imagenes;
            combinacion.imagen_predeterminada = imagenes.find(img => img.es_predeterminada) || imagenes[0];
        }

        res.json(combinaciones);
    } catch (error) {
        console.error('Error al obtener combinaciones:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener una combinación por ID
router.get('/:id', async (req, res) => {
    try {
        const [combinaciones] = await pool.query(`
            SELECT c.*, 
                   GROUP_CONCAT(DISTINCT col.nombre) as colores,
                   GROUP_CONCAT(DISTINCT tt.nombre) as telas,
                   GROUP_CONCAT(DISTINCT p.nombre) as proveedores
            FROM combinaciones c
            LEFT JOIN combinacion_colores cc ON c.id = cc.combinacion_id
            LEFT JOIN colores col ON cc.color_id = col.id
            LEFT JOIN combinacion_telas ct ON c.id = ct.combinacion_id
            LEFT JOIN tipos_tela tt ON ct.tipo_tela_id = tt.id
            LEFT JOIN combinacion_proveedores cp ON c.id = cp.combinacion_id
            LEFT JOIN proveedores p ON cp.proveedor_id = p.id
            WHERE c.id = ? AND c.activo = TRUE
            GROUP BY c.id
        `, [req.params.id]);

        if (combinaciones.length === 0) {
            return res.status(404).json({ message: 'Combinación no encontrada' });
        }

        const combinacion = combinaciones[0];

        // Obtener IDs de colores, telas y proveedores
        const [colorIds] = await pool.query(`
            SELECT color_id FROM combinacion_colores 
            WHERE combinacion_id = ?
        `, [req.params.id]);
        combinacion.color_ids = colorIds.map(row => row.color_id);

        const [telaIds] = await pool.query(`
            SELECT tipo_tela_id FROM combinacion_telas 
            WHERE combinacion_id = ?
        `, [req.params.id]);
        combinacion.tela_ids = telaIds.map(row => row.tipo_tela_id);

        const [proveedorIds] = await pool.query(`
            SELECT proveedor_id FROM combinacion_proveedores 
            WHERE combinacion_id = ?
        `, [req.params.id]);
        combinacion.proveedor_ids = proveedorIds.map(row => row.proveedor_id);

        // Obtener estampados
        const [estampados] = await pool.query(`
            SELECT ce.*, cod.codigo, cod.descripcion, cod.imagen_url
            FROM combinacion_estampados ce
            JOIN codigos_estampado cod ON ce.estampado_id = cod.id
            WHERE ce.combinacion_id = ? AND cod.activo = TRUE
        `, [req.params.id]);

        combinacion.estampados = estampados;

        // Obtener precio
        const [precios] = await pool.query(`
            SELECT id, costo, precio_venta, margen_ganancia, porcentaje_ganancia
            FROM precios_combinaciones
            WHERE combinacion_id = ? AND activo = TRUE
            LIMIT 1
        `, [req.params.id]);
        console.log("precios", precios);
        combinacion.precio = precios.length > 0 ? precios[0] : null;

        // Obtener imágenes
        const [imagenes] = await pool.query(`
            SELECT id, imagen_url, es_predeterminada
            FROM combinacion_imagenes
            WHERE combinacion_id = ?
            ORDER BY es_predeterminada DESC, id ASC
        `, [req.params.id]);
        combinacion.imagenes = imagenes;
        combinacion.imagen_predeterminada = imagenes.find(img => img.es_predeterminada) || imagenes[0];

        res.json(combinacion);
    } catch (error) {
        console.error('Error al obtener combinación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear una nueva combinación
router.post('/', upload.array('imagenes', 10), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { nombre, descripcion, color_ids, tela_ids, proveedor_ids, estampados, imagen_predeterminada_index } = req.body;
        
        // Parsear los arrays JSON
        const colores = color_ids ? JSON.parse(color_ids) : [];
        const telas = tela_ids ? JSON.parse(tela_ids) : [];
        const proveedores = proveedor_ids ? JSON.parse(proveedor_ids) : [];
        const estampadosData = estampados ? JSON.parse(estampados) : [];

        // Crear la combinación
        const [result] = await connection.query(
            'INSERT INTO combinaciones (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion]
        );

        const combinacionId = result.insertId;

        // Insertar colores
        if (colores && colores.length > 0) {
            for (const colorId of colores) {
                await connection.query(
                    'INSERT INTO combinacion_colores (combinacion_id, color_id) VALUES (?, ?)',
                    [combinacionId, colorId]
                );
            }
        }

        // Insertar telas
        if (telas && telas.length > 0) {
            for (const telaId of telas) {
                await connection.query(
                    'INSERT INTO combinacion_telas (combinacion_id, tipo_tela_id) VALUES (?, ?)',
                    [combinacionId, telaId]
                );
            }
        }

        // Insertar proveedores
        if (proveedores && proveedores.length > 0) {
            for (const proveedorId of proveedores) {
                await connection.query(
                    'INSERT INTO combinacion_proveedores (combinacion_id, proveedor_id) VALUES (?, ?)',
                    [combinacionId, proveedorId]
                );
            }
        }

        // Insertar estampados
        if (estampadosData && estampadosData.length > 0) {
            for (const estampado of estampadosData) {
                await connection.query(
                    'INSERT INTO combinacion_estampados (combinacion_id, estampado_id, medida, ubicacion) VALUES (?, ?, ?, ?)',
                    [combinacionId, estampado.estampado_id, estampado.medida, estampado.ubicacion]
                );
            }
        }

        // Insertar imágenes
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const isDefault = parseInt(imagen_predeterminada_index) === i;
                
                await connection.query(
                    'INSERT INTO combinacion_imagenes (combinacion_id, imagen_url, es_predeterminada) VALUES (?, ?, ?)',
                    [combinacionId, `/uploads/combinaciones/${file.filename}`, isDefault]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ id: combinacionId, nombre, descripcion });
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear combinación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

// Actualizar una combinación
router.put('/:id', upload.array('imagenes', 10), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { nombre, descripcion, color_ids, tela_ids, proveedor_ids, estampados, imagen_predeterminada_index } = req.body;
        
        // Parsear los arrays JSON
        const colores = color_ids ? JSON.parse(color_ids) : [];
        const telas = tela_ids ? JSON.parse(tela_ids) : [];
        const proveedores = proveedor_ids ? JSON.parse(proveedor_ids) : [];
        const estampadosData = estampados ? JSON.parse(estampados) : [];

        // Actualizar la combinación
        const [result] = await connection.query(
            'UPDATE combinaciones SET nombre = ?, descripcion = ? WHERE id = ? AND activo = TRUE',
            [nombre, descripcion, req.params.id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Combinación no encontrada' });
        }

        // Eliminar relaciones existentes
        await connection.query('DELETE FROM combinacion_colores WHERE combinacion_id = ?', [req.params.id]);
        await connection.query('DELETE FROM combinacion_telas WHERE combinacion_id = ?', [req.params.id]);
        await connection.query('DELETE FROM combinacion_proveedores WHERE combinacion_id = ?', [req.params.id]);
        await connection.query('DELETE FROM combinacion_estampados WHERE combinacion_id = ?', [req.params.id]);

        // Insertar nuevas relaciones
        if (colores && colores.length > 0) {
            for (const colorId of colores) {
                await connection.query(
                    'INSERT INTO combinacion_colores (combinacion_id, color_id) VALUES (?, ?)',
                    [req.params.id, colorId]
                );
            }
        }

        if (telas && telas.length > 0) {
            for (const telaId of telas) {
                await connection.query(
                    'INSERT INTO combinacion_telas (combinacion_id, tipo_tela_id) VALUES (?, ?)',
                    [req.params.id, telaId]
                );
            }
        }

        if (proveedores && proveedores.length > 0) {
            for (const proveedorId of proveedores) {
                await connection.query(
                    'INSERT INTO combinacion_proveedores (combinacion_id, proveedor_id) VALUES (?, ?)',
                    [req.params.id, proveedorId]
                );
            }
        }

        if (estampadosData && estampadosData.length > 0) {
            for (const estampado of estampadosData) {
                await connection.query(
                    'INSERT INTO combinacion_estampados (combinacion_id, estampado_id, medida, ubicacion) VALUES (?, ?, ?, ?)',
                    [req.params.id, estampado.estampado_id, estampado.medida, estampado.ubicacion]
                );
            }
        }

        // Manejar imágenes
        const { imagenes_existentes, imagen_predeterminada_existente_id, imagen_predeterminada_nueva_index } = req.body;
        
        // Eliminar todas las imágenes existentes
        await connection.query('DELETE FROM combinacion_imagenes WHERE combinacion_id = ?', [req.params.id]);

        // Reinsertar imágenes existentes que se mantienen
        if (imagenes_existentes) {
            const imagenesExistentesData = JSON.parse(imagenes_existentes);
            for (const imagen of imagenesExistentesData) {
                const isDefault = imagen.id == imagen_predeterminada_existente_id;
                await connection.query(
                    'INSERT INTO combinacion_imagenes (combinacion_id, imagen_url, es_predeterminada) VALUES (?, ?, ?)',
                    [req.params.id, imagen.imagen_url, isDefault]
                );
            }
        }

        // Insertar nuevas imágenes
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const isDefault = parseInt(imagen_predeterminada_nueva_index) === i;
                
                await connection.query(
                    'INSERT INTO combinacion_imagenes (combinacion_id, imagen_url, es_predeterminada) VALUES (?, ?, ?)',
                    [req.params.id, `/uploads/combinaciones/${file.filename}`, isDefault]
                );
            }
        }

        await connection.commit();
        res.json({ id: req.params.id, nombre, descripcion });
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar combinación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

// Eliminar una combinación (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE combinaciones SET activo = FALSE WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Combinación no encontrada' });
        }
        res.json({ message: 'Combinación eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar combinación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router; 
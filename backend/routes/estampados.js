const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { upload, handleUploadError } = require('../middleware/upload');

// Obtener todos los estampados
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM codigos_estampado WHERE activo = TRUE ORDER BY codigo');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener códigos de estampado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener un estampado por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM codigos_estampado WHERE id = ? AND activo = TRUE', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Estampado no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener estampado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear un nuevo estampado
router.post('/', upload.single('imagen'), handleUploadError, async (req, res) => {
    try {
        console.log('Creando nuevo estampado...');
        console.log('Body:', req.body);
        console.log('File:', req.file);
        
        const { codigo, descripcion } = req.body;
        const imagen_url = req.file ? `/uploads/estampados/${req.file.filename}` : null;
        
        console.log('Imagen URL:', imagen_url);
        
        const [result] = await pool.query(
            'INSERT INTO codigos_estampado (codigo, descripcion, imagen_url) VALUES (?, ?, ?)',
            [codigo, descripcion, imagen_url]
        );
        
        console.log('Estampado creado con ID:', result.insertId);
        
        res.status(201).json({ 
            id: result.insertId, 
            codigo, 
            descripcion, 
            imagen_url 
        });
    } catch (error) {
        console.error('Error al crear estampado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar un estampado
router.put('/:id', upload.single('imagen'), handleUploadError, async (req, res) => {
    try {
        console.log('Actualizando estampado ID:', req.params.id);
        console.log('Body:', req.body);
        console.log('File:', req.file);
        
        const { codigo, descripcion } = req.body;
        let imagen_url = null;
        
        if (req.file) {
            imagen_url = `/uploads/estampados/${req.file.filename}`;
        }
        
        console.log('Imagen URL:', imagen_url);
        
        let query = 'UPDATE codigos_estampado SET codigo = ?, descripcion = ?';
        let params = [codigo, descripcion];
        
        if (imagen_url) {
            query += ', imagen_url = ?';
            params.push(imagen_url);
        }
        
        query += ' WHERE id = ? AND activo = TRUE';
        params.push(req.params.id);
        
        console.log('Query:', query);
        console.log('Params:', params);
        
        const [result] = await pool.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Estampado no encontrado' });
        }
        
        console.log('Estampado actualizado correctamente');
        
        res.json({ id: req.params.id, codigo, descripcion, imagen_url });
    } catch (error) {
        console.error('Error al actualizar estampado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Eliminar un estampado (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE codigos_estampado SET activo = FALSE WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Estampado no encontrado' });
        }
        res.json({ message: 'Estampado eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar estampado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router; 
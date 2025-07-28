const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener todos los tipos de tela
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tipos_tela WHERE activo = TRUE ORDER BY nombre');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener tipos de tela:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener un tipo de tela por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tipos_tela WHERE id = ? AND activo = TRUE', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Tipo de tela no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener tipo de tela:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear un nuevo tipo de tela
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const [result] = await pool.query(
            'INSERT INTO tipos_tela (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion]
        );
        res.status(201).json({ id: result.insertId, nombre, descripcion });
    } catch (error) {
        console.error('Error al crear tipo de tela:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar un tipo de tela
router.put('/:id', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const [result] = await pool.query(
            'UPDATE tipos_tela SET nombre = ?, descripcion = ? WHERE id = ? AND activo = TRUE',
            [nombre, descripcion, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tipo de tela no encontrado' });
        }
        res.json({ id: req.params.id, nombre, descripcion });
    } catch (error) {
        console.error('Error al actualizar tipo de tela:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Eliminar un tipo de tela (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE tipos_tela SET activo = FALSE WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tipo de tela no encontrado' });
        }
        res.json({ message: 'Tipo de tela eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar tipo de tela:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router; 
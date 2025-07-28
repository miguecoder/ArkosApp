const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener todos los colores
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM colores WHERE activo = TRUE ORDER BY nombre');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener colores:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener un color por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM colores WHERE id = ? AND activo = TRUE', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener color:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear un nuevo color
router.post('/', async (req, res) => {
    try {
        const { nombre, codigo_hex } = req.body;
        const [result] = await pool.query(
            'INSERT INTO colores (nombre, codigo_hex) VALUES (?, ?)',
            [nombre, codigo_hex]
        );
        res.status(201).json({ id: result.insertId, nombre, codigo_hex });
    } catch (error) {
        console.error('Error al crear color:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar un color
router.put('/:id', async (req, res) => {
    try {
        const { nombre, codigo_hex } = req.body;
        const [result] = await pool.query(
            'UPDATE colores SET nombre = ?, codigo_hex = ? WHERE id = ? AND activo = TRUE',
            [nombre, codigo_hex, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }
        res.json({ id: req.params.id, nombre, codigo_hex });
    } catch (error) {
        console.error('Error al actualizar color:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Eliminar un color (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE colores SET activo = FALSE WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }
        res.json({ message: 'Color eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar color:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM proveedores WHERE activo = TRUE ORDER BY nombre');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener un proveedor por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM proveedores WHERE id = ? AND activo = TRUE', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener proveedor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Crear un nuevo proveedor
router.post('/', async (req, res) => {
    try {
        const { nombre, direccion, telefono, email, ruc } = req.body;
        const [result] = await pool.query(
            'INSERT INTO proveedores (nombre, direccion, telefono, email, ruc) VALUES (?, ?, ?, ?, ?)',
            [nombre, direccion, telefono, email, ruc]
        );
        res.status(201).json({ id: result.insertId, nombre, direccion, telefono, email, ruc });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Actualizar un proveedor
router.put('/:id', async (req, res) => {
    try {
        const { nombre, direccion, telefono, email, ruc } = req.body;
        const [result] = await pool.query(
            'UPDATE proveedores SET nombre = ?, direccion = ?, telefono = ?, email = ?, ruc = ? WHERE id = ? AND activo = TRUE',
            [nombre, direccion, telefono, email, ruc, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.json({ id: req.params.id, nombre, direccion, telefono, email, ruc });
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Eliminar un proveedor (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE proveedores SET activo = FALSE WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router; 
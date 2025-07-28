-- Script para agregar columnas faltantes a la tabla ventas
-- Ejecutar este script para corregir la estructura de la tabla ventas

-- Agregar columnas faltantes a la tabla ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin') DEFAULT 'efectivo' AFTER cliente;

ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS estado_venta ENUM('pendiente', 'pagado', 'cancelado') NOT NULL DEFAULT 'pagado' AFTER metodo_pago;

ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS fecha_pago DATE NULL AFTER estado_venta;

ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS costo_total DECIMAL(10,2) DEFAULT 0.00 AFTER total;

ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS ganancia_total DECIMAL(10,2) DEFAULT 0.00 AFTER costo_total;

ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS observaciones TEXT AFTER ganancia_total;

-- Verificar que las columnas se agregaron correctamente
DESCRIBE ventas; 
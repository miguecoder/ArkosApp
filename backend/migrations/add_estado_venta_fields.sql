-- Script para agregar campos de estado y fecha de pago a la tabla ventas
USE camisetas_db;

-- Agregar el campo estado_venta a la tabla ventas
ALTER TABLE ventas 
ADD COLUMN estado_venta ENUM('pendiente', 'pagado', 'cancelado') NOT NULL DEFAULT 'pagado' 
AFTER metodo_pago;

-- Agregar el campo fecha_pago a la tabla ventas
ALTER TABLE ventas 
ADD COLUMN fecha_pago DATE NULL 
AFTER estado_venta;

-- Actualizar registros existentes para que fecha_pago sea igual a fecha_venta
UPDATE ventas SET fecha_pago = fecha_venta WHERE fecha_pago IS NULL;

-- Comentario sobre el cambio
-- El campo estado_venta se establece como 'pagado' por defecto para mantener compatibilidad con registros existentes
-- El campo fecha_pago se inicializa con la fecha_venta para registros existentes 
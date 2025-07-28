-- Script para agregar el campo talla a la tabla detalle_venta
USE camisetas_db;

-- Agregar el campo talla a la tabla detalle_venta
ALTER TABLE detalle_venta 
ADD COLUMN talla ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NOT NULL DEFAULT 'M' 
AFTER combinacion_id;

-- Comentario sobre el cambio
-- El campo talla se agrega después de combinacion_id para mantener un orden lógico
-- Se establece como NOT NULL con valor por defecto 'M' para mantener compatibilidad con registros existentes 
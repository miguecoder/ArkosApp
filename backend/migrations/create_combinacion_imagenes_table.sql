-- Crear tabla para imágenes de combinaciones
CREATE TABLE IF NOT EXISTS combinacion_imagenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE
);

-- Crear índice para mejorar el rendimiento
CREATE INDEX idx_combinacion_imagenes_combinacion_id ON combinacion_imagenes(combinacion_id);
CREATE INDEX idx_combinacion_imagenes_predeterminada ON combinacion_imagenes(es_predeterminada); 
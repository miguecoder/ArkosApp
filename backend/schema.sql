-- Esquema completo de la base de datos para Camisetas App
-- Ejecutar este archivo para crear todas las tablas necesarias
-- Versión: 2.0 - Esquema completo con tablas intermedias

-- Tabla de colores
CREATE TABLE IF NOT EXISTS colores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_hex VARCHAR(7) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    contacto VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    ruc VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de tipos de tela
CREATE TABLE IF NOT EXISTS tipos_tela (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de códigos de estampado
CREATE TABLE IF NOT EXISTS codigos_estampado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de combinaciones (sin FK directas)
CREATE TABLE IF NOT EXISTS combinaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla intermedia para combinaciones y colores
CREATE TABLE IF NOT EXISTS combinacion_colores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT NOT NULL,
    color_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES colores(id) ON DELETE CASCADE
);

-- Tabla intermedia para combinaciones y telas
CREATE TABLE IF NOT EXISTS combinacion_telas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT NOT NULL,
    tipo_tela_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_tela_id) REFERENCES tipos_tela(id) ON DELETE CASCADE
);

-- Tabla intermedia para combinaciones y proveedores
CREATE TABLE IF NOT EXISTS combinacion_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

-- Tabla intermedia para combinaciones y estampados
CREATE TABLE IF NOT EXISTS combinacion_estampados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT NOT NULL,
    estampado_id INT NOT NULL,
    medida VARCHAR(50),
    ubicacion VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (estampado_id) REFERENCES codigos_estampado(id) ON DELETE CASCADE
);

-- Tabla de precios para combinaciones
CREATE TABLE IF NOT EXISTS precios_combinaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE
);

-- Tabla de imágenes de combinaciones
CREATE TABLE IF NOT EXISTS combinacion_imagenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT NOT NULL,
    imagen_url VARCHAR(500) NOT NULL,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_venta DATE NOT NULL,
    cliente_nombre VARCHAR(200),
    cliente_telefono VARCHAR(20),
    cliente_email VARCHAR(100),
    total DECIMAL(10,2) DEFAULT 0.00,
    estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'pendiente',
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de detalles de venta
CREATE TABLE IF NOT EXISTS detalles_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    combinacion_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id)
);

-- Insertar datos de ejemplo (opcional)
INSERT IGNORE INTO colores (nombre, codigo_hex, descripcion) VALUES
('Blanco', '#FFFFFF', 'Color blanco puro'),
('Negro', '#000000', 'Color negro puro'),
('Azul', '#0000FF', 'Color azul'),
('Rojo', '#FF0000', 'Color rojo'),
('Verde', '#00FF00', 'Color verde');

INSERT IGNORE INTO tipos_tela (nombre, descripcion) VALUES
('Algodón', 'Tela de algodón 100%'),
('Poliéster', 'Tela de poliéster'),
('Mezcla', 'Mezcla de algodón y poliéster');

INSERT IGNORE INTO proveedores (nombre, contacto, telefono, email) VALUES
('Proveedor A', 'Juan Pérez', '123-456-7890', 'juan@proveedor.com'),
('Proveedor B', 'María García', '098-765-4321', 'maria@proveedor.com');

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_combinacion_colores_combinacion ON combinacion_colores(combinacion_id);
CREATE INDEX idx_combinacion_colores_color ON combinacion_colores(color_id);
CREATE INDEX idx_combinacion_telas_combinacion ON combinacion_telas(combinacion_id);
CREATE INDEX idx_combinacion_telas_tela ON combinacion_telas(tipo_tela_id);
CREATE INDEX idx_combinacion_proveedores_combinacion ON combinacion_proveedores(combinacion_id);
CREATE INDEX idx_combinacion_proveedores_proveedor ON combinacion_proveedores(proveedor_id);
CREATE INDEX idx_combinacion_estampados_combinacion ON combinacion_estampados(combinacion_id);
CREATE INDEX idx_combinacion_estampados_estampado ON combinacion_estampados(estampado_id);
CREATE INDEX idx_precios_combinaciones_combinacion ON precios_combinaciones(combinacion_id);
CREATE INDEX idx_precios_combinaciones_activo ON precios_combinaciones(activo);
CREATE INDEX idx_combinacion_imagenes_combinacion ON combinacion_imagenes(combinacion_id);
CREATE INDEX idx_combinacion_imagenes_predeterminada ON combinacion_imagenes(es_predeterminada);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_detalles_venta_venta ON detalles_venta(venta_id);
CREATE INDEX idx_detalles_venta_combinacion ON detalles_venta(combinacion_id); 
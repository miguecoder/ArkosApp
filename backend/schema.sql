-- Esquema completo de la base de datos para Camisetas App
-- Ejecutar este archivo para crear todas las tablas necesarias
-- Versión: 3.0 - Esquema completo con todas las funcionalidades

-- Tabla de colores
CREATE TABLE IF NOT EXISTS colores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_hex VARCHAR(7),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
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
    descripcion TEXT,
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de combinaciones
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
    combinacion_id INT,
    color_id INT,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id),
    FOREIGN KEY (color_id) REFERENCES colores(id)
);

-- Tabla intermedia para combinaciones y telas
CREATE TABLE IF NOT EXISTS combinacion_telas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT,
    tipo_tela_id INT,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id),
    FOREIGN KEY (tipo_tela_id) REFERENCES tipos_tela(id)
);

-- Tabla intermedia para combinaciones y proveedores
CREATE TABLE IF NOT EXISTS combinacion_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT,
    proveedor_id INT,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- Tabla intermedia para combinaciones y estampados
CREATE TABLE IF NOT EXISTS combinacion_estampados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT,
    estampado_id INT,
    medida VARCHAR(50),
    ubicacion VARCHAR(100),
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id),
    FOREIGN KEY (estampado_id) REFERENCES codigos_estampado(id)
);

-- Tabla de precios para combinaciones
CREATE TABLE IF NOT EXISTS precios_combinaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT,
    costo DECIMAL(10,2) DEFAULT 0.00,
    precio_venta DECIMAL(10,2) DEFAULT 0.00,
    margen_ganancia DECIMAL(10,2) GENERATED ALWAYS AS (precio_venta - costo) STORED,
    porcentaje_ganancia DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN costo > 0 THEN ((precio_venta - costo) / costo) * 100 ELSE 0 END) STORED,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id)
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
    cliente VARCHAR(200),
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin') DEFAULT 'efectivo',
    estado_venta ENUM('pendiente', 'pagado', 'cancelado') NOT NULL DEFAULT 'pagado',
    fecha_pago DATE NULL,
    total DECIMAL(10,2) DEFAULT 0.00,
    costo_total DECIMAL(10,2) DEFAULT 0.00,
    ganancia_total DECIMAL(10,2) DEFAULT 0.00,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS detalle_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT,
    combinacion_id INT,
    talla ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NOT NULL DEFAULT 'M',
    cantidad INT DEFAULT 1,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id)
);

-- Insertar datos de ejemplo
INSERT IGNORE INTO colores (nombre, codigo_hex) VALUES 
('Blanco', '#FFFFFF'),
('Negro', '#000000'),
('Azul', '#0000FF'),
('Rojo', '#FF0000'),
('Verde', '#00FF00');

INSERT IGNORE INTO tipos_tela (nombre, descripcion) VALUES 
('Algodón 100%', 'Tela de algodón puro'),
('Algodón-Polyester', 'Mezcla de algodón y polyester'),
('Jersey', 'Tela jersey suave'),
('Pique', 'Tela pique para polos');

INSERT IGNORE INTO proveedores (nombre, direccion, telefono, email) VALUES 
('Proveedor A', 'Av. Principal 123, Lima', '999888777', 'proveedorA@email.com'),
('Proveedor B', 'Jr. Comercial 456, Lima', '999777666', 'proveedorB@email.com');

INSERT IGNORE INTO codigos_estampado (codigo, descripcion) VALUES 
('EST001', 'Logo de la empresa'),
('EST002', 'Diseño personalizado'),
('EST003', 'Texto simple');

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
CREATE INDEX idx_ventas_estado ON ventas(estado_venta);
CREATE INDEX idx_detalle_venta_venta ON detalle_venta(venta_id);
CREATE INDEX idx_detalle_venta_combinacion ON detalle_venta(combinacion_id); 
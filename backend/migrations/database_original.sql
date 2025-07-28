-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS camisetas_db;
USE camisetas_db;

-- Tabla de colores
CREATE TABLE colores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_hex VARCHAR(7),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    ruc VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de códigos de estampado
CREATE TABLE codigos_estampado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de tipos de tela
CREATE TABLE tipos_tela (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de combinaciones
CREATE TABLE combinaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla intermedia para combinaciones y colores
CREATE TABLE combinacion_colores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT,
    color_id INT,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id),
    FOREIGN KEY (color_id) REFERENCES colores(id)
);

-- Tabla intermedia para combinaciones y telas
CREATE TABLE combinacion_telas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT,
    tipo_tela_id INT,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id),
    FOREIGN KEY (tipo_tela_id) REFERENCES tipos_tela(id)
);

-- Tabla intermedia para combinaciones y proveedores
CREATE TABLE combinacion_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT,
    proveedor_id INT,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- Tabla intermedia para combinaciones y estampados
CREATE TABLE combinacion_estampados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT,
    estampado_id INT,
    medida VARCHAR(50),
    ubicacion VARCHAR(100),
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id),
    FOREIGN KEY (estampado_id) REFERENCES codigos_estampado(id)
);

-- Tabla de precios para combinaciones
CREATE TABLE precios_combinaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    combinacion_id INT,
    costo DECIMAL(10,2) DEFAULT 0.00,
    precio_venta DECIMAL(10,2) DEFAULT 0.00,
    margen_ganancia DECIMAL(10,2) GENERATED ALWAYS AS (precio_venta - costo) STORED,
    porcentaje_ganancia DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN costo > 0 THEN ((precio_venta - costo) / costo) * 100 ELSE 0 END) STORED,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id)
);

-- Tabla de ventas
CREATE TABLE ventas (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de detalle de ventas
CREATE TABLE detalle_venta (
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

-- Insertar algunos datos de ejemplo
INSERT INTO colores (nombre, codigo_hex) VALUES 
('Blanco', '#FFFFFF'),
('Negro', '#000000'),
('Azul', '#0000FF'),
('Rojo', '#FF0000'),
('Verde', '#00FF00');

INSERT INTO tipos_tela (nombre, descripcion) VALUES 
('Algodón 100%', 'Tela de algodón puro'),
('Algodón-Polyester', 'Mezcla de algodón y polyester'),
('Jersey', 'Tela jersey suave'),
('Pique', 'Tela pique para polos');

INSERT INTO proveedores (nombre, direccion, telefono, email) VALUES 
('Proveedor A', 'Av. Principal 123, Lima', '999888777', 'proveedorA@email.com'),
('Proveedor B', 'Jr. Comercial 456, Lima', '999777666', 'proveedorB@email.com');

INSERT INTO codigos_estampado (codigo, descripcion) VALUES 
('EST001', 'Logo de la empresa'),
('EST002', 'Diseño personalizado'),
('EST003', 'Texto simple'); 
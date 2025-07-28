-- Script para resetear completamente la base de datos
-- ADVERTENCIA: Esto eliminará todos los datos existentes

-- Eliminar tablas en orden correcto (por las foreign keys)
DROP TABLE IF EXISTS detalle_venta;
DROP TABLE IF EXISTS precios_combinaciones;
DROP TABLE IF EXISTS combinacion_imagenes;
DROP TABLE IF EXISTS combinacion_estampados;
DROP TABLE IF EXISTS combinacion_proveedores;
DROP TABLE IF EXISTS combinacion_telas;
DROP TABLE IF EXISTS combinacion_colores;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS combinaciones;
DROP TABLE IF EXISTS codigos_estampado;
DROP TABLE IF EXISTS tipos_tela;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS colores;

-- Crear tablas con la estructura correcta
CREATE TABLE `colores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `codigo_hex` varchar(7) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `direccion` text DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipos_tela` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `codigos_estampado` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `combinaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `combinacion_colores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `combinacion_id` int(11) DEFAULT NULL,
  `color_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `combinacion_id` (`combinacion_id`),
  KEY `color_id` (`color_id`),
  CONSTRAINT `combinacion_colores_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`),
  CONSTRAINT `combinacion_colores_ibfk_2` FOREIGN KEY (`color_id`) REFERENCES `colores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `combinacion_telas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `combinacion_id` int(11) DEFAULT NULL,
  `tipo_tela_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `combinacion_id` (`combinacion_id`),
  KEY `tipo_tela_id` (`tipo_tela_id`),
  CONSTRAINT `combinacion_telas_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`),
  CONSTRAINT `combinacion_telas_ibfk_2` FOREIGN KEY (`tipo_tela_id`) REFERENCES `tipos_tela` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `combinacion_proveedores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `combinacion_id` int(11) DEFAULT NULL,
  `proveedor_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `combinacion_id` (`combinacion_id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `combinacion_proveedores_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`),
  CONSTRAINT `combinacion_proveedores_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `combinacion_estampados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `combinacion_id` int(11) DEFAULT NULL,
  `estampado_id` int(11) DEFAULT NULL,
  `medida` varchar(50) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `combinacion_id` (`combinacion_id`),
  KEY `estampado_id` (`estampado_id`),
  CONSTRAINT `combinacion_estampados_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`),
  CONSTRAINT `combinacion_estampados_ibfk_2` FOREIGN KEY (`estampado_id`) REFERENCES `codigos_estampado` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `precios_combinaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `combinacion_id` int(11) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT 0.00,
  `precio_venta` decimal(10,2) DEFAULT 0.00,
  `margen_ganancia` decimal(10,2) GENERATED ALWAYS AS (`precio_venta` - `costo`) STORED,
  `porcentaje_ganancia` decimal(5,2) GENERATED ALWAYS AS (case when `costo` > 0 then (`precio_venta` - `costo`) / `costo` * 100 else 0 end) STORED,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `combinacion_id` (`combinacion_id`),
  CONSTRAINT `precios_combinaciones_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `combinacion_imagenes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `combinacion_id` int(11) NOT NULL,
  `imagen_url` varchar(500) NOT NULL,
  `es_predeterminada` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_combinacion_imagenes_combinacion_id` (`combinacion_id`),
  KEY `idx_combinacion_imagenes_predeterminada` (`es_predeterminada`),
  CONSTRAINT `combinacion_imagenes_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_venta` date NOT NULL,
  `cliente` varchar(200) DEFAULT NULL,
  `metodo_pago` enum('efectivo','tarjeta','transferencia','yape','plin') DEFAULT 'efectivo',
  `estado_venta` enum('pendiente','pagado','cancelado') NOT NULL DEFAULT 'pagado',
  `fecha_pago` date DEFAULT NULL,
  `total` decimal(10,2) DEFAULT 0.00,
  `costo_total` decimal(10,2) DEFAULT 0.00,
  `ganancia_total` decimal(10,2) DEFAULT 0.00,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `detalle_venta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `venta_id` int(11) DEFAULT NULL,
  `combinacion_id` int(11) DEFAULT NULL,
  `talla` enum('XS','S','M','L','XL','XXL','XXXL') NOT NULL DEFAULT 'M',
  `cantidad` int(11) DEFAULT 1,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  KEY `combinacion_id` (`combinacion_id`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`),
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar datos de ejemplo
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
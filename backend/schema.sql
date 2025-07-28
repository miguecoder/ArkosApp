-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-07-2025 a las 06:15:00
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `camisetas_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `codigos_estampado`
--

CREATE TABLE `codigos_estampado` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colores`
--

CREATE TABLE `colores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `codigo_hex` varchar(7) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combinaciones`
--

CREATE TABLE `combinaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combinacion_colores`
--

CREATE TABLE `combinacion_colores` (
  `id` int(11) NOT NULL,
  `combinacion_id` int(11) DEFAULT NULL,
  `color_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combinacion_estampados`
--

CREATE TABLE `combinacion_estampados` (
  `id` int(11) NOT NULL,
  `combinacion_id` int(11) DEFAULT NULL,
  `estampado_id` int(11) DEFAULT NULL,
  `medida` varchar(50) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combinacion_imagenes`
--

CREATE TABLE `combinacion_imagenes` (
  `id` int(11) NOT NULL,
  `combinacion_id` int(11) NOT NULL,
  `imagen_url` varchar(500) NOT NULL,
  `es_predeterminada` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combinacion_proveedores`
--

CREATE TABLE `combinacion_proveedores` (
  `id` int(11) NOT NULL,
  `combinacion_id` int(11) DEFAULT NULL,
  `proveedor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combinacion_telas`
--

CREATE TABLE `combinacion_telas` (
  `id` int(11) NOT NULL,
  `combinacion_id` int(11) DEFAULT NULL,
  `tipo_tela_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id` int(11) NOT NULL,
  `venta_id` int(11) DEFAULT NULL,
  `combinacion_id` int(11) DEFAULT NULL,
  `talla` enum('XS','S','M','L','XL','XXL','XXXL') NOT NULL DEFAULT 'M',
  `cantidad` int(11) DEFAULT 1,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `precios_combinaciones`
--

CREATE TABLE `precios_combinaciones` (
  `id` int(11) NOT NULL,
  `combinacion_id` int(11) DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT 0.00,
  `precio_venta` decimal(10,2) DEFAULT 0.00,
  `margen_ganancia` decimal(10,2) GENERATED ALWAYS AS (`precio_venta` - `costo`) STORED,
  `porcentaje_ganancia` decimal(5,2) GENERATED ALWAYS AS (case when `costo` > 0 then (`precio_venta` - `costo`) / `costo` * 100 else 0 end) STORED,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `direccion` text DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_tela`
--

CREATE TABLE `tipos_tela` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `codigos_estampado`
--
ALTER TABLE `codigos_estampado`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `colores`
--
ALTER TABLE `colores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `combinaciones`
--
ALTER TABLE `combinaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `combinacion_colores`
--
ALTER TABLE `combinacion_colores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `combinacion_id` (`combinacion_id`),
  ADD KEY `color_id` (`color_id`);

--
-- Indices de la tabla `combinacion_estampados`
--
ALTER TABLE `combinacion_estampados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `combinacion_id` (`combinacion_id`),
  ADD KEY `estampado_id` (`estampado_id`);

--
-- Indices de la tabla `combinacion_imagenes`
--
ALTER TABLE `combinacion_imagenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_combinacion_imagenes_combinacion_id` (`combinacion_id`),
  ADD KEY `idx_combinacion_imagenes_predeterminada` (`es_predeterminada`);

--
-- Indices de la tabla `combinacion_proveedores`
--
ALTER TABLE `combinacion_proveedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `combinacion_id` (`combinacion_id`),
  ADD KEY `proveedor_id` (`proveedor_id`);

--
-- Indices de la tabla `combinacion_telas`
--
ALTER TABLE `combinacion_telas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `combinacion_id` (`combinacion_id`),
  ADD KEY `tipo_tela_id` (`tipo_tela_id`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venta_id` (`venta_id`),
  ADD KEY `combinacion_id` (`combinacion_id`);

--
-- Indices de la tabla `precios_combinaciones`
--
ALTER TABLE `precios_combinaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `combinacion_id` (`combinacion_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tipos_tela`
--
ALTER TABLE `tipos_tela`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `codigos_estampado`
--
ALTER TABLE `codigos_estampado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `colores`
--
ALTER TABLE `colores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `combinaciones`
--
ALTER TABLE `combinaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `combinacion_colores`
--
ALTER TABLE `combinacion_colores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `combinacion_estampados`
--
ALTER TABLE `combinacion_estampados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `combinacion_imagenes`
--
ALTER TABLE `combinacion_imagenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `combinacion_proveedores`
--
ALTER TABLE `combinacion_proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `combinacion_telas`
--
ALTER TABLE `combinacion_telas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `precios_combinaciones`
--
ALTER TABLE `precios_combinaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipos_tela`
--
ALTER TABLE `tipos_tela`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `combinacion_colores`
--
ALTER TABLE `combinacion_colores`
  ADD CONSTRAINT `combinacion_colores_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`),
  ADD CONSTRAINT `combinacion_colores_ibfk_2` FOREIGN KEY (`color_id`) REFERENCES `colores` (`id`);

--
-- Filtros para la tabla `combinacion_estampados`
--
ALTER TABLE `combinacion_estampados`
  ADD CONSTRAINT `combinacion_estampados_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`),
  ADD CONSTRAINT `combinacion_estampados_ibfk_2` FOREIGN KEY (`estampado_id`) REFERENCES `codigos_estampado` (`id`);

--
-- Filtros para la tabla `combinacion_imagenes`
--
ALTER TABLE `combinacion_imagenes`
  ADD CONSTRAINT `combinacion_imagenes_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `combinacion_proveedores`
--
ALTER TABLE `combinacion_proveedores`
  ADD CONSTRAINT `combinacion_proveedores_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`),
  ADD CONSTRAINT `combinacion_proveedores_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`);

--
-- Filtros para la tabla `combinacion_telas`
--
ALTER TABLE `combinacion_telas`
  ADD CONSTRAINT `combinacion_telas_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`),
  ADD CONSTRAINT `combinacion_telas_ibfk_2` FOREIGN KEY (`tipo_tela_id`) REFERENCES `tipos_tela` (`id`);

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`),
  ADD CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`);

--
-- Filtros para la tabla `precios_combinaciones`
--
ALTER TABLE `precios_combinaciones`
  ADD CONSTRAINT `precios_combinaciones_ibfk_1` FOREIGN KEY (`combinacion_id`) REFERENCES `combinaciones` (`id`);

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

COMMIT; 
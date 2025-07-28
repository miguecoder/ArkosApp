# 📊 Migraciones de Base de Datos - Camisetas App

Este directorio contiene las migraciones y scripts de base de datos.

## 📁 Estructura

- `schema.sql` (en backend/) - Esquema completo actual (usar este para nuevas instalaciones)
- `migrations/` - Scripts de migración específicos (histórico)

## 🚀 Instalación Nueva

Para una nueva instalación, usar:

```bash
npm run init-db
```

Esto ejecutará `schema.sql` que contiene todas las tablas necesarias.

## 📝 Historial de Cambios

### Versión 1.0 (Actual)
- Esquema simplificado y optimizado
- Incluye todas las modificaciones del desarrollo
- Tablas: colores, proveedores, tipos_tela, codigos_estampado, combinaciones, combinacion_imagenes, ventas, detalles_venta

### Cambios Incluidos
- ✅ Tabla `combinacion_imagenes` para gestión de imágenes
- ✅ Campos de estado en ventas
- ✅ Estructura optimizada para el frontend actual

## 📋 Archivos en Migraciones

### Archivos Históricos (NO usar para nuevas instalaciones)
- `database_original.sql` - Esquema original más complejo
- `create_combinacion_imagenes_table.sql` - Migración específica para imágenes
- `add_estado_venta_fields.sql` - Migración para campos de estado
- `add_talla_field.sql` - Migración para campo talla

### Nota Importante
Estos archivos son **históricos** y están incluidos en `schema.sql`. **NO** ejecutar individualmente.

## 🔧 Scripts Disponibles

- `npm run init-db` - Inicializar base de datos completa
- `npm run migrate` - Ejecutar migraciones pendientes (futuro)

## 📋 Notas Importantes

- **NO** ejecutar archivos SQL individuales de la carpeta migrations
- Usar siempre `npm run init-db` para nuevas instalaciones
- El esquema actual incluye todos los cambios necesarios
- Los archivos en migrations/ son solo para referencia histórica 
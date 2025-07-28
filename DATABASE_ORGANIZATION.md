# 🗄️ Organización de Base de Datos - Camisetas App

## ✅ **PROBLEMA RESUELTO**

Durante el desarrollo se crearon múltiples archivos SQL que representaban diferentes versiones y modificaciones de la base de datos. Esto ha sido **organizado y limpiado**.

## 📁 **ESTRUCTURA FINAL**

```
backend/
├── schema.sql                    # ✅ ESQUEMA PRINCIPAL (usar este)
├── init-db.js                    # ✅ Script de inicialización
├── migrations/                   # 📚 Archivos históricos
│   ├── README.md                # Documentación de migraciones
│   ├── database_original.sql    # Esquema original (histórico)
│   ├── create_combinacion_imagenes_table.sql
│   ├── add_estado_venta_fields.sql
│   └── add_talla_field.sql
└── config/
    └── database.js              # Configuración de conexión
```

## 🚀 **PARA NUEVAS INSTALACIONES**

### **Siempre usar:**
```bash
npm run init-db
```

### **Esto ejecuta:**
- `schema.sql` - Esquema completo y actualizado
- Incluye todas las modificaciones del desarrollo
- Crea todas las tablas necesarias
- Inserta datos de ejemplo

## 📋 **TABLAS INCLUIDAS EN SCHEMA.SQL**

### **Tablas Principales:**
- `colores` - Colores disponibles
- `proveedores` - Proveedores de telas
- `tipos_tela` - Tipos de tela
- `codigos_estampado` - Estampados disponibles
- `combinaciones` - Combinaciones de productos
- `combinacion_imagenes` - Imágenes de combinaciones
- `ventas` - Registro de ventas
- `detalles_venta` - Detalles de cada venta

### **Características Incluidas:**
- ✅ Gestión de imágenes de combinaciones
- ✅ Campos de estado en ventas
- ✅ Índices para optimización
- ✅ Datos de ejemplo
- ✅ Estructura optimizada para el frontend

## 🔧 **ARCHIVOS ELIMINADOS**

### **Archivos de prueba eliminados:**
- `test-db-simple.js`
- `test-api.js`
- `test-db.js`
- `start-server.js`
- `config.env`

### **Archivos SQL reorganizados:**
- `database.sql` → `migrations/database_original.sql`
- `create_combinacion_imagenes_table.sql` → `migrations/`
- `add_estado_venta_fields.sql` → `migrations/`
- `add_talla_field.sql` → `migrations/`

## 📝 **HISTORIAL DE CAMBIOS**

### **Versión 1.0 (Actual)**
- Esquema simplificado y optimizado
- Todas las modificaciones del desarrollo incluidas
- Estructura limpia y organizada

### **Cambios Incluidos:**
- Tabla `combinacion_imagenes` para gestión de imágenes
- Campos de estado en ventas
- Estructura optimizada para el frontend actual
- Índices para mejor rendimiento

## ⚠️ **IMPORTANTE**

### **Para despliegue:**
1. **NO** ejecutar archivos SQL individuales
2. **Siempre** usar `npm run init-db`
3. El esquema actual incluye todo lo necesario
4. Los archivos en `migrations/` son solo históricos

### **Para desarrollo:**
- Modificar `schema.sql` para cambios futuros
- Documentar cambios en `migrations/README.md`
- Mantener compatibilidad con datos existentes

## 🎯 **RESULTADO**

✅ **Base de datos organizada y limpia**
✅ **Un solo archivo principal para nuevas instalaciones**
✅ **Historial preservado para referencia**
✅ **Listo para despliegue en Railway/Render**

---

**Nota:** Esta organización es perfecta para despliegue en Railway, Render, o cualquier otra plataforma. El archivo `schema.sql` contiene todo lo necesario para una instalación limpia. 
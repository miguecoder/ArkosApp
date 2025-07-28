# Instrucciones Rápidas de Instalación

## Configuración Inicial

### 1. Base de Datos
1. Instala MySQL en tu sistema
2. Crea una base de datos llamada `camisetas_db`
3. Ejecuta el script SQL: `backend/database.sql`

### 2. Backend
```bash
cd backend
npm install
```

Edita `config.env` con tus datos de MySQL:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=camisetas_db
DB_PORT=3306
PORT=5000
JWT_SECRET=mi_secreto_super_seguro
```

### 3. Frontend
```bash
cd frontend
npm install
```

## Ejecutar la Aplicación

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

## Acceso
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Flujo de Trabajo Recomendado

1. **Colores**: Crear los colores disponibles
2. **Proveedores**: Registrar los proveedores
3. **Estampados**: Crear los códigos de estampado
4. **Tipos de Tela**: Registrar los tipos de tela
5. **Combinaciones**: Crear combinaciones asociando colores, telas, proveedores y estampados
6. **Precios**: Asignar precios a las combinaciones
7. **Ventas**: Crear ventas usando las combinaciones y precios

## Características Principales

- ✅ Gestión completa de colores con códigos HEX
- ✅ Proveedores con información detallada
- ✅ Códigos de estampado categorizados
- ✅ Tipos de tela con composición y gramaje
- ✅ Combinaciones flexibles (múltiples elementos)
- ✅ Sistema de precios por combinación
- ✅ Ventas con múltiples items y cálculos automáticos
- ✅ Dashboard con estadísticas
- ✅ Interfaz moderna y responsive

## Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté corriendo
- Revisa las credenciales en `config.env`
- Asegúrate de que la base de datos `camisetas_db` existe

### Error de puerto ocupado
- Cambia el puerto en `config.env` (backend)
- O mata el proceso que está usando el puerto

### Error de dependencias
- Ejecuta `npm install` en ambas carpetas (backend y frontend)
- Verifica que tienes Node.js versión 16 o superior 
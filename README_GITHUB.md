# 🎽 Camisetas App

Aplicación web para gestión de ventas de camisetas con gestión de colores, proveedores, estampados, telas y combinaciones.

## 🚀 Despliegue Rápido

### Opción 1: Railway (Recomendado - Gratis)
1. Ve a [railway.app](https://railway.app)
2. Conecta tu cuenta de GitHub
3. Selecciona este repositorio
4. Agrega una base de datos MySQL
5. Configura las variables de entorno
6. ¡Listo! Tu app estará funcionando

### Opción 2: Render (Gratis)
1. Ve a [render.com](https://render.com)
2. Conecta tu cuenta de GitHub
3. Crea un nuevo Web Service
4. Selecciona este repositorio
5. Configura las variables de entorno

### Opción 3: Vercel + Railway
- Frontend en Vercel
- Backend en Railway
- Base de datos en Railway

## 📋 Características

- ✅ Gestión de colores con códigos hexadecimales
- ✅ Gestión de proveedores
- ✅ Gestión de estampados con imágenes
- ✅ Gestión de tipos de tela
- ✅ Combinaciones de productos
- ✅ Gestión de imágenes de combinaciones
- ✅ Sistema de ventas
- ✅ Interfaz responsive
- ✅ API REST completa

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos
- **Multer** - Manejo de archivos
- **JWT** - Autenticación
- **CORS** - Cross-origin requests

### Frontend
- **React** - Framework de UI
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```
camisetas-app/
├── backend/                 # API Node.js
│   ├── config/             # Configuración de BD
│   ├── routes/             # Rutas de la API
│   ├── uploads/            # Archivos subidos
│   ├── server.js           # Servidor principal
│   └── package.json        # Dependencias backend
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la app
│   │   ├── services/       # Servicios API
│   │   └── App.js          # Componente principal
│   └── package.json        # Dependencias frontend
└── README.md               # Este archivo
```

## 🔧 Instalación Local

### Prerrequisitos
- Node.js 16+ 
- MySQL 8.0+
- Git

### Backend
```bash
cd backend
npm install
cp env.example .env
# Editar .env con tus credenciales de BD
npm run init-db
npm start
```

### Frontend
```bash
cd frontend
npm install
cp env.example .env
# Editar .env con la URL de tu API
npm start
```

## 🌐 Variables de Entorno

### Backend (.env)
```env
# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=camisetas_db
DB_PORT=3306

# Servidor
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Seguridad
JWT_SECRET=tu_jwt_secret
SESSION_SECRET=tu_session_secret
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Camisetas App
REACT_APP_VERSION=1.0.0
```

## 📊 Base de Datos

El proyecto incluye un esquema completo con las siguientes tablas:

- `colores` - Colores disponibles
- `proveedores` - Proveedores de telas
- `codigos_estampado` - Estampados disponibles
- `tipos_tela` - Tipos de tela
- `combinaciones` - Combinaciones de productos
- `combinacion_imagenes` - Imágenes de combinaciones
- `ventas` - Registro de ventas
- `detalles_venta` - Detalles de cada venta

## 🔌 API Endpoints

### Colores
- `GET /api/colores` - Obtener todos los colores
- `POST /api/colores` - Crear nuevo color
- `PUT /api/colores/:id` - Actualizar color
- `DELETE /api/colores/:id` - Eliminar color

### Combinaciones
- `GET /api/combinaciones` - Obtener todas las combinaciones
- `POST /api/combinaciones` - Crear nueva combinación
- `PUT /api/combinaciones/:id` - Actualizar combinación
- `DELETE /api/combinaciones/:id` - Eliminar combinación

### Ventas
- `GET /api/ventas` - Obtener todas las ventas
- `POST /api/ventas` - Crear nueva venta
- `GET /api/ventas/:id` - Obtener venta específica

## 🚀 Scripts Disponibles

### Backend
```bash
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo con nodemon
npm run init-db    # Inicializar base de datos
```

### Frontend
```bash
npm start          # Iniciar servidor de desarrollo
npm run build      # Construir para producción
npm run build:prod # Construir optimizado
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs del servidor
2. Verifica la configuración de la base de datos
3. Asegúrate de que todas las variables de entorno estén configuradas
4. Abre un issue en GitHub

## 🔗 Enlaces Útiles

- [Railway](https://railway.app) - Despliegue fácil
- [Render](https://render.com) - Alternativa gratuita
- [Vercel](https://vercel.com) - Para el frontend
- [MySQL](https://mysql.com) - Base de datos
- [React](https://reactjs.org) - Framework frontend
- [Express](https://expressjs.com) - Framework backend 
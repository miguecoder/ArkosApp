# 🚀 Despliegue en Railway - Camisetas App

## 📋 Requisitos Previos

1. **Cuenta en GitHub** con tu código subido
2. **Cuenta en Railway** (gratis)
3. **Base de datos MySQL** (Railway te la proporciona)

---

## 🎯 Paso a Paso: Despliegue en Railway

### **Paso 1: Crear cuenta en Railway**

1. Ve a [railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub
3. Autoriza Railway para acceder a tus repositorios

### **Paso 2: Crear nuevo proyecto**

1. Click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona tu repositorio `camisetas-app`
4. Click en **"Deploy Now"**

### **Paso 3: Agregar base de datos MySQL**

1. En tu proyecto, click en **"New"**
2. Selecciona **"Database"** → **"MySQL"**
3. Railway creará automáticamente una base de datos
4. **IMPORTANTE:** Anota la URL de conexión que te da Railway

### **Paso 4: Configurar variables de entorno**

1. Ve a la pestaña **"Variables"**
2. Agrega estas variables:

```env
# Base de datos (Railway te da esta URL)
DATABASE_URL=mysql://usuario:password@host:puerto/nombre_db

# Configuración del servidor
PORT=5000
NODE_ENV=production

# Configuración de CORS (cambiar por tu dominio de Railway)
FRONTEND_URL=https://tu-app.railway.app

# Configuración de archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Configuración de seguridad (generar nuevos)
JWT_SECRET=tu_jwt_secret_super_seguro_y_largo
SESSION_SECRET=tu_session_secret_super_seguro_y_largo

# Configuración de logs
LOG_LEVEL=info
```

### **Paso 5: Configurar el dominio**

1. Ve a la pestaña **"Settings"**
2. En **"Domains"**, Railway te dará una URL como:
   `https://tu-app-production.up.railway.app`
3. Copia esta URL

### **Paso 6: Actualizar variables de entorno**

Actualiza `FRONTEND_URL` con tu dominio de Railway:
```env
FRONTEND_URL=https://tu-app-production.up.railway.app
```

### **Paso 7: Inicializar la base de datos**

1. Ve a la pestaña **"Deployments"**
2. Click en **"View Logs"**
3. Ve a la pestaña **"Shell"**
4. Ejecuta:
```bash
npm run init-db
```

### **Paso 8: Verificar el despliegue**

1. Ve a tu URL de Railway
2. Deberías ver tu aplicación funcionando
3. Verifica que la API responda en `/api/health`

---

## 🔧 Configuración del Frontend

### **Opción A: Desplegar Frontend en Railway también**

1. Crea otro proyecto en Railway
2. Conecta el mismo repositorio
3. Configura las variables:
```env
REACT_APP_API_URL=https://tu-backend.railway.app/api
```

### **Opción B: Desplegar Frontend en Vercel (Recomendado)**

1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Agrega variable de entorno:
```env
REACT_APP_API_URL=https://tu-backend.railway.app/api
```

---

## 🗄️ Estructura de la Base de Datos

Railway creará automáticamente estas tablas cuando ejecutes `npm run init-db`:

- `colores` - Colores disponibles
- `proveedores` - Proveedores de telas
- `codigos_estampado` - Estampados disponibles
- `tipos_tela` - Tipos de tela
- `combinaciones` - Combinaciones de productos
- `combinacion_imagenes` - Imágenes de combinaciones
- `ventas` - Registro de ventas
- `detalles_venta` - Detalles de cada venta

---

## 🔍 Verificación del Despliegue

### **Endpoints para probar:**

1. **Health Check:** `https://tu-app.railway.app/health`
2. **API Colores:** `https://tu-app.railway.app/api/colores`
3. **API Combinaciones:** `https://tu-app.railway.app/api/combinaciones`

### **Logs y Monitoreo:**

1. Ve a **"Deployments"** → **"View Logs"**
2. Monitorea errores y rendimiento
3. Railway te da métricas automáticas

---

## 🚨 Solución de Problemas

### **Error: "Cannot connect to database"**
- Verifica que `DATABASE_URL` esté correcta
- Asegúrate de que la base de datos esté creada

### **Error: "Table doesn't exist"**
- Ejecuta `npm run init-db` en el shell de Railway

### **Error: "CORS error"**
- Verifica que `FRONTEND_URL` esté correcta
- Asegúrate de que incluya `https://`

### **Error: "Port already in use"**
- Railway maneja esto automáticamente
- Usa `process.env.PORT` en tu código

---

## 💰 Costos

- **Railway:** $5 crédito mensual (gratis)
- **Base de datos:** Incluida en el plan gratuito
- **Dominio:** Incluido (subdominio de Railway)

---

## 🔄 Actualizaciones

Para actualizar tu aplicación:

1. Haz cambios en tu código
2. Haz `git push` a GitHub
3. Railway detectará automáticamente los cambios
4. Desplegará automáticamente la nueva versión

---

## 📞 Soporte

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Discord de Railway:** [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues:** Para problemas específicos de tu código 
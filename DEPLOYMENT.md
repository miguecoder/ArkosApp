# 🚀 Guía de Despliegue - Camisetas App

## 📋 Requisitos Previos

- **Node.js** 18+ 
- **MySQL** 8.0+
- **Docker** y **Docker Compose** (opcional)
- **Git**

## 🎯 Opciones de Despliegue

### 1. Despliegue Manual (Recomendado para desarrollo)

#### Configuración de la Base de Datos

1. **Crear base de datos MySQL:**
```sql
CREATE DATABASE camisetas_db;
CREATE USER 'camisetas_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON camisetas_db.* TO 'camisetas_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Ejecutar scripts de inicialización:**
```bash
mysql -u camisetas_user -p camisetas_db < backend/create_combinacion_imagenes_table.sql
```

#### Configuración del Backend

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp env.example .env
# Editar .env con tus valores reales
```

3. **Iniciar el servidor:**
```bash
npm start
```

#### Configuración del Frontend

1. **Instalar dependencias:**
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp env.example .env
# Editar .env con la URL de tu API
```

3. **Construir para producción:**
```bash
npm run build:prod
```

4. **Servir archivos estáticos:**
```bash
# Opción 1: Usar serve
npx serve -s build -l 3000

# Opción 2: Usar nginx
# Copiar contenido de build/ a tu servidor web
```

### 2. Despliegue con Docker (Recomendado para producción)

#### Despliegue Rápido

1. **Configurar variables de entorno:**
```bash
cp backend/env.example .env
# Editar .env con tus valores
```

2. **Construir frontend:**
```bash
cd frontend
npm install
npm run build:prod
cd ..
```

3. **Iniciar con Docker Compose:**
```bash
docker-compose up -d
```

#### Despliegue Personalizado

1. **Construir imágenes:**
```bash
docker build -t camisetas-backend .
```

2. **Ejecutar contenedores:**
```bash
# Base de datos
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=camisetas_db \
  -e MYSQL_USER=camisetas_user \
  -e MYSQL_PASSWORD=camisetas_password \
  -p 3306:3306 \
  mysql:8.0

# Backend
docker run -d --name backend \
  -p 5000:5000 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=camisetas_user \
  -e DB_PASSWORD=camisetas_password \
  -e DB_NAME=camisetas_db \
  camisetas-backend
```

### 3. Despliegue en Servicios Cloud

#### Heroku

1. **Crear aplicación Heroku:**
```bash
heroku create tu-app-camisetas
```

2. **Configurar variables de entorno:**
```bash
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=tu-host-mysql
heroku config:set DB_USER=tu-usuario
heroku config:set DB_PASSWORD=tu-password
heroku config:set DB_NAME=tu-database
```

3. **Desplegar:**
```bash
git push heroku main
```

#### DigitalOcean App Platform

1. **Conectar repositorio**
2. **Configurar variables de entorno**
3. **Especificar comando de inicio:**
   - Backend: `npm start`
   - Frontend: `npm run build && npx serve -s build`

#### AWS EC2

1. **Configurar instancia EC2**
2. **Instalar Node.js y MySQL**
3. **Clonar repositorio**
4. **Configurar PM2 para el backend:**
```bash
npm install -g pm2
pm2 start server.js --name "camisetas-backend"
pm2 startup
pm2 save
```

## 🔧 Configuración de Variables de Entorno

### Backend (.env)
```env
# Base de datos
DB_HOST=localhost
DB_USER=camisetas_user
DB_PASSWORD=tu_password_seguro
DB_NAME=camisetas_db
DB_PORT=3306

# Servidor
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://tu-dominio.com

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Seguridad
JWT_SECRET=tu_jwt_secret_super_seguro
SESSION_SECRET=tu_session_secret_super_seguro
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://tu-api.com/api
REACT_APP_NAME=Camisetas App
REACT_APP_VERSION=1.0.0
```

## 🔒 Configuración de Seguridad

### SSL/HTTPS
```bash
# Generar certificado SSL (Let's Encrypt)
sudo certbot --nginx -d tu-dominio.com

# Configurar redirección HTTP a HTTPS en nginx
```

### Firewall
```bash
# Abrir solo puertos necesarios
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Base de Datos
```sql
-- Crear usuario con permisos limitados
CREATE USER 'camisetas_app'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT SELECT, INSERT, UPDATE, DELETE ON camisetas_db.* TO 'camisetas_app'@'localhost';
REVOKE ALL PRIVILEGES ON *.* FROM 'camisetas_app'@'localhost';
FLUSH PRIVILEGES;
```

## 📊 Monitoreo y Logs

### Logs del Backend
```bash
# Ver logs en tiempo real
pm2 logs camisetas-backend

# Ver logs de nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks
```bash
# Verificar estado de la API
curl https://tu-api.com/health

# Verificar base de datos
mysql -u usuario -p -e "SELECT 1;"
```

## 🔄 Actualizaciones

### Despliegue Automático
```bash
# Usar el script de despliegue
chmod +x deploy.sh
./deploy.sh production
```

### Rollback
```bash
# Revertir a versión anterior
git checkout HEAD~1
./deploy.sh production
```

## 🆘 Troubleshooting

### Problemas Comunes

1. **Error de conexión a la base de datos:**
   - Verificar credenciales en .env
   - Verificar que MySQL esté corriendo
   - Verificar firewall

2. **Error de CORS:**
   - Verificar FRONTEND_URL en .env
   - Verificar configuración de nginx

3. **Archivos no se suben:**
   - Verificar permisos del directorio uploads/
   - Verificar MAX_FILE_SIZE

4. **Frontend no carga:**
   - Verificar que el build se generó correctamente
   - Verificar configuración de nginx
   - Verificar REACT_APP_API_URL

### Comandos de Diagnóstico
```bash
# Verificar estado de servicios
systemctl status mysql
systemctl status nginx
pm2 status

# Verificar puertos
netstat -tulpn | grep :5000
netstat -tulpn | grep :80

# Verificar logs
journalctl -u mysql -f
journalctl -u nginx -f
```

## 📞 Soporte

Para problemas específicos, revisar:
- Logs del sistema
- Logs de la aplicación
- Configuración de variables de entorno
- Estado de servicios 
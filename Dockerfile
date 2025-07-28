# Usar Node.js 18 Alpine como base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json de la raíz
COPY package*.json ./

# Copiar package.json del backend
COPY backend/package*.json ./backend/

# Instalar dependencias del backend
WORKDIR /app/backend
RUN npm ci --only=production

# Volver al directorio raíz
WORKDIR /app

# Copiar todo el código del backend
COPY backend/ ./backend/

# Crear directorio de uploads
RUN mkdir -p backend/uploads

# Establecer directorio de trabajo al backend
WORKDIR /app/backend

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["npm", "start"] 
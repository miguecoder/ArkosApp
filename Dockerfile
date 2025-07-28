# Dockerfile para el backend de Camisetas App
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY backend/package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY backend/ ./

# Crear directorio para uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Comando para iniciar la aplicación
CMD ["node", "server.js"] 
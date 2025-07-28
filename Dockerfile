# Usar Node.js 18 Alpine como base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar todo el código del backend
COPY backend/ ./backend/

# Ir al directorio del backend
WORKDIR /app/backend

# Instalar dependencias
RUN npm install --production

# Crear directorio de uploads
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["npm", "start"] 
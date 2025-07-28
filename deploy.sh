#!/bin/bash

# Script de despliegue para Camisetas App
# Uso: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Iniciando despliegue en ambiente: $ENVIRONMENT"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    error "Este script debe ejecutarse desde el directorio raíz del proyecto"
fi

log "📦 Instalando dependencias del backend..."
cd backend
npm install --production
cd ..

log "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

log "🔨 Construyendo frontend..."
cd frontend
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build:prod
else
    npm run build
fi
cd ..

log "✅ Despliegue completado exitosamente!"
log "📁 Archivos de build generados en: frontend/build/"
log "🚀 Para iniciar el servidor: cd backend && npm start" 
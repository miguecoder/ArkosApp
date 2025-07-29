#!/bin/bash

echo "🚀 Iniciando despliegue de la aplicación..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

echo "📦 Instalando dependencias del backend..."
cd backend
npm install

echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install

echo "🔧 Construyendo aplicación frontend..."
npm run build

echo "🐳 Construyendo imagen Docker..."
cd ..
docker build -t camisetas-app .

echo "✅ Despliegue completado localmente"
echo ""
echo "🌐 Para desplegar en Railway, ejecuta:"
echo "   railway up"
echo ""
echo "🔧 Para verificar y crear tablas faltantes después del despliegue:"
echo "   curl https://arkosapp-production.up.railway.app/check-tables"
echo ""
echo "📝 Cambios implementados para solucionar error 429:"
echo "   ✅ Rate limiting aumentado de 100 a 500 requests por 15 minutos"
echo "   ✅ Sistema de caché implementado en el frontend"
echo "   ✅ Endpoint optimizado para obtener todos los datos en una petición"
echo "   ✅ Manejo mejorado de errores de rate limiting"
echo "   ✅ Botón de recarga manual agregado"
echo "   ✅ Endpoint robusto que maneja tablas faltantes"
echo "   ✅ Script de verificación de tablas agregado" 
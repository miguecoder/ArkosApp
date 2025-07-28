const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rutas con manejo de errores
try {
    console.log('Cargando rutas...');
    app.use('/api/colores', require('./routes/colores'));
    console.log('✅ Ruta /api/colores cargada');
    
    app.use('/api/proveedores', require('./routes/proveedores'));
    console.log('✅ Ruta /api/proveedores cargada');
    
    app.use('/api/estampados', require('./routes/estampados'));
    console.log('✅ Ruta /api/estampados cargada');
    
    app.use('/api/telas', require('./routes/telas'));
    console.log('✅ Ruta /api/telas cargada');
    
    app.use('/api/combinaciones', require('./routes/combinaciones'));
    console.log('✅ Ruta /api/combinaciones cargada');
    
    app.use('/api/precios-combinaciones', require('./routes/precios_combinaciones'));
    console.log('✅ Ruta /api/precios-combinaciones cargada');
    
    app.use('/api/ventas', require('./routes/ventas'));
    console.log('✅ Ruta /api/ventas cargada');
} catch (error) {
    console.error('❌ Error al cargar rutas:', error);
    process.exit(1);
}

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Camisetas funcionando correctamente' });
});

// Middleware para manejar errores
app.use((error, req, res, next) => {
    console.error('Error en el servidor:', error);
    res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/precios-combinaciones/dashboard`);
    console.log(`🎨 Colores: http://localhost:${PORT}/api/colores`);
    console.log(`👥 Proveedores: http://localhost:${PORT}/api/proveedores`);
    console.log(`🖼️ Estampados: http://localhost:${PORT}/api/estampados`);
    console.log(`🧵 Telas: http://localhost:${PORT}/api/telas`);
    console.log(`📦 Combinaciones: http://localhost:${PORT}/api/combinaciones`);
    console.log(`💰 Ventas: http://localhost:${PORT}/api/ventas`);
}).on('error', (error) => {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
}); 
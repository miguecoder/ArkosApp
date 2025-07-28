const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configurar trust proxy para Railway
app.set('trust proxy', 1);

// Configuración de seguridad
app.use(helmet({
    contentSecurityPolicy: false, // Deshabilitado para desarrollo
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false // Permitir recursos desde cualquier origen
}));

// Compresión gzip
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// Configuración de CORS
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL] 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/colores', require('./routes/colores'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/estampados', require('./routes/estampados'));
app.use('/api/telas', require('./routes/telas'));
app.use('/api/combinaciones', require('./routes/combinaciones'));
app.use('/api/precios-combinaciones', require('./routes/precios_combinaciones'));
app.use('/api/ventas', require('./routes/ventas'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Camisetas funcionando correctamente',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Ruta de health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: NODE_ENV === 'production' ? 'Error interno del servidor' : err.message
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌍 Ambiente: ${NODE_ENV}`);
    console.log(`📅 Iniciado: ${new Date().toISOString()}`);
}); 
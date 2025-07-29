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
    max: 500, // máximo 500 requests por ventana (aumentado de 100)
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests
    skipFailedRequests: false, // Count failed requests
});
app.use('/api/', limiter);

// Configuración de CORS
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? [
            process.env.FRONTEND_URL,
            'https://arkos-app-frontend.vercel.app',
            'https://arkos-app-frontend.vercel.app/',
            'https://arkosapp-production.up.railway.app',
            '*' // Permitir todos los orígenes en producción (temporal)
          ] 
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para obtener todos los datos necesarios en una sola petición
app.get('/api/dashboard-data', async (req, res) => {
    try {
        const pool = require('./config/database');
        
        // Obtener todas las métricas en paralelo
        const [
            combinacionesResult,
            coloresResult,
            telasResult,
            proveedoresResult,
            estampadosResult,
            dashboardResult
        ] = await Promise.all([
            pool.query(`
                SELECT c.*, 
                       GROUP_CONCAT(DISTINCT co.nombre) as colores,
                       GROUP_CONCAT(DISTINCT t.nombre) as telas,
                       GROUP_CONCAT(DISTINCT p.nombre) as proveedores,
                       COUNT(DISTINCT ce.id) as estampados_count,
                       ci.imagen_url as imagen_predeterminada_url
                FROM combinaciones c
                LEFT JOIN combinacion_colores cc ON c.id = cc.combinacion_id
                LEFT JOIN colores co ON cc.color_id = co.id
                LEFT JOIN combinacion_telas ct ON c.id = ct.combinacion_id
                LEFT JOIN tipos_tela t ON ct.tela_id = t.id
                LEFT JOIN combinacion_proveedores cp ON c.id = cp.combinacion_id
                LEFT JOIN proveedores p ON cp.proveedor_id = p.id
                LEFT JOIN combinacion_estampados ce ON c.id = ce.combinacion_id
                LEFT JOIN combinacion_imagenes ci ON c.id = ci.combinacion_id AND ci.es_predeterminada = 1
                WHERE c.activo = 1
                GROUP BY c.id
                ORDER BY c.created_at DESC
            `),
            pool.query('SELECT * FROM colores WHERE activo = 1 ORDER BY nombre'),
            pool.query('SELECT * FROM tipos_tela WHERE activo = 1 ORDER BY nombre'),
            pool.query('SELECT * FROM proveedores WHERE activo = 1 ORDER BY nombre'),
            pool.query('SELECT * FROM codigos_estampado WHERE activo = 1 ORDER BY codigo'),
            pool.query(`
                SELECT 
                    COUNT(*) as total_combinaciones,
                    SUM(COALESCE(pc.precio_venta, 0)) as ingresos_totales,
                    SUM(COALESCE(pc.costo, 0)) as costos_totales,
                    SUM(COALESCE(pc.precio_venta - pc.costo, 0)) as ganancias_totales,
                    AVG(CASE WHEN pc.precio_venta > 0 THEN ((pc.precio_venta - pc.costo) / pc.precio_venta) * 100 ELSE 0 END) as promedio_margen_ganancia
                FROM combinaciones c
                LEFT JOIN precios_combinaciones pc ON c.id = pc.combinacion_id
                WHERE c.activo = 1
            `)
        ]);

        res.json({
            combinaciones: combinacionesResult[0],
            colores: coloresResult[0],
            telas: telasResult[0],
            proveedores: proveedoresResult[0],
            estampados: estampadosResult[0],
            dashboard: dashboardResult[0][0]
        });
    } catch (error) {
        console.error('Error obteniendo datos del dashboard:', error);
        res.status(500).json({ 
            error: 'Error obteniendo datos del dashboard',
            details: error.message
        });
    }
});

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

// Ruta temporal para inicializar base de datos con nuevo schema
app.get('/init-db', async (req, res) => {
    try {
        const initializeDatabase = require('./init-db');
        await initializeDatabase();
        res.json({ 
            message: 'Base de datos inicializada correctamente con esquema completo',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error inicializando BD:', error);
        res.status(500).json({ 
            error: 'Error inicializando base de datos',
            details: error.message
        });
    }
});

// Ruta temporal para crear las tablas faltantes
app.get('/fix-missing-tables', async (req, res) => {
    try {
        const pool = require('./config/database');
        
        console.log('🔧 Creando tablas faltantes...');
        
        // Crear tabla colores
        await pool.query(`
            CREATE TABLE IF NOT EXISTS colores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                codigo_hex VARCHAR(7),
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('✅ Tabla colores creada');
        
        // Crear tabla combinacion_colores
        await pool.query(`
            CREATE TABLE IF NOT EXISTS combinacion_colores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                combinacion_id INT,
                color_id INT,
                KEY combinacion_id (combinacion_id),
                KEY color_id (color_id),
                CONSTRAINT combinacion_colores_ibfk_1 FOREIGN KEY (combinacion_id) REFERENCES combinaciones (id),
                CONSTRAINT combinacion_colores_ibfk_2 FOREIGN KEY (color_id) REFERENCES colores (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        console.log('✅ Tabla combinacion_colores creada');
        
        // Insertar datos de ejemplo en colores
        await pool.query(`
            INSERT IGNORE INTO colores (nombre, codigo_hex) VALUES 
            ('Blanco', '#FFFFFF'),
            ('Negro', '#000000'),
            ('Azul', '#0000FF'),
            ('Rojo', '#FF0000'),
            ('Verde', '#00FF00')
        `);
        console.log('✅ Datos de ejemplo insertados en colores');
        
        console.log('✅ Todas las tablas faltantes creadas');
        
        res.json({ 
            message: 'Tablas faltantes creadas correctamente',
            tablas_creadas: ['colores', 'combinacion_colores'],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creando tablas faltantes:', error);
        res.status(500).json({ 
            error: 'Error creando tablas faltantes',
            details: error.message
        });
    }
});

// Ruta temporal para crear solo la tabla colores
app.get('/fix-colores', async (req, res) => {
    try {
        const pool = require('./config/database');
        
        console.log('🔧 Creando tabla colores...');
        
        // Crear tabla colores
        await pool.query(`
            CREATE TABLE IF NOT EXISTS colores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                codigo_hex VARCHAR(7),
                activo BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
        
        // Insertar datos de ejemplo
        await pool.query(`
            INSERT IGNORE INTO colores (nombre, codigo_hex) VALUES 
            ('Blanco', '#FFFFFF'),
            ('Negro', '#000000'),
            ('Azul', '#0000FF'),
            ('Rojo', '#FF0000'),
            ('Verde', '#00FF00')
        `);
        
        console.log('✅ Tabla colores creada y datos insertados');
        
        res.json({ 
            message: 'Tabla colores creada correctamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creando tabla colores:', error);
        res.status(500).json({ 
            error: 'Error creando tabla colores',
            details: error.message
        });
    }
});

// Ruta temporal para resetear completamente la base de datos
app.get('/reset-db', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const pool = require('./config/database');
        
        console.log('🔄 Iniciando reset completo de la base de datos...');
        
        // Deshabilitar foreign key checks
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('✅ Foreign key checks deshabilitados');
        
        // Eliminar todas las tablas
        const tablesToDrop = [
            'detalle_venta',
            'detalles_venta', 
            'precios_combinaciones',
            'combinacion_imagenes',
            'combinacion_estampados',
            'combinacion_proveedores',
            'combinacion_telas',
            'combinacion_colores',
            'ventas',
            'combinaciones',
            'codigos_estampado',
            'tipos_tela',
            'proveedores',
            'colores'
        ];
        
        for (const table of tablesToDrop) {
            try {
                await pool.query(`DROP TABLE IF EXISTS ${table}`);
                console.log(`✅ Tabla ${table} eliminada`);
            } catch (error) {
                console.log(`⚠️ Error eliminando ${table}: ${error.message}`);
            }
        }
        
        // Habilitar foreign key checks
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Foreign key checks habilitados');
        
        // Leer y ejecutar el script de creación
        const scriptPath = path.join(__dirname, 'reset-db.sql');
        if (fs.existsSync(scriptPath)) {
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Remover las líneas de SET FOREIGN_KEY_CHECKS del script
            const cleanScript = scriptContent
                .replace(/SET FOREIGN_KEY_CHECKS = 0;?\s*/g, '')
                .replace(/SET FOREIGN_KEY_CHECKS = 1;?\s*/g, '')
                .replace(/-- Deshabilitar verificación de foreign keys temporalmente\s*/g, '')
                .replace(/-- Eliminar TODAS las tablas sin importar las foreign keys\s*/g, '')
                .replace(/-- Habilitar verificación de foreign keys\s*/g, '');
            
            const queries = cleanScript.split(';').filter(query => query.trim());
            
            for (const query of queries) {
                if (query.trim() && !query.trim().startsWith('--')) {
                    try {
                        await pool.query(query);
                        console.log('✅ Query ejecutada:', query.trim().substring(0, 50) + '...');
                    } catch (error) {
                        console.error(`❌ Error ejecutando query: ${error.message}`);
                    }
                }
            }
        }
        
        console.log('✅ Reset de base de datos completado');
        
        res.json({ 
            message: 'Base de datos reseteada completamente con estructura correcta',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error reseteando BD:', error);
        res.status(500).json({ 
            error: 'Error reseteando base de datos',
            details: error.message
        });
    }
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
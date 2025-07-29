const pool = require('./config/database');

async function checkAndFixTables() {
    try {
        console.log('🔍 Verificando estructura de la base de datos...');
        
        // Verificar si existe la tabla combinacion_imagenes
        const [tables] = await pool.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'combinacion_imagenes'
        `);
        
        if (tables.length === 0) {
            console.log('📋 Creando tabla combinacion_imagenes...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS combinacion_imagenes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    combinacion_id INT NOT NULL,
                    imagen_url VARCHAR(500) NOT NULL,
                    es_predeterminada BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
            `);
            
            // Crear índices
            await pool.query(`
                CREATE INDEX idx_combinacion_imagenes_combinacion_id ON combinacion_imagenes(combinacion_id)
            `);
            await pool.query(`
                CREATE INDEX idx_combinacion_imagenes_predeterminada ON combinacion_imagenes(es_predeterminada)
            `);
            
            console.log('✅ Tabla combinacion_imagenes creada exitosamente');
        } else {
            console.log('✅ Tabla combinacion_imagenes ya existe');
        }
        
        // Verificar estructura de otras tablas importantes
        const requiredTables = [
            'combinacion_colores',
            'combinacion_telas', 
            'combinacion_proveedores',
            'combinacion_estampados',
            'precios_combinaciones'
        ];
        
        for (const tableName of requiredTables) {
            const [tableExists] = await pool.query(`
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = '${tableName}'
            `);
            
            if (tableExists.length === 0) {
                console.log(`⚠️ Tabla ${tableName} no encontrada`);
            } else {
                console.log(`✅ Tabla ${tableName} existe`);
            }
        }
        
        console.log('🎉 Verificación completada');
        
    } catch (error) {
        console.error('❌ Error verificando tablas:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    checkAndFixTables()
        .then(() => {
            console.log('✅ Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en el script:', error);
            process.exit(1);
        });
}

module.exports = checkAndFixTables;
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando base de datos...');

    // Leer y ejecutar el esquema completo de la base de datos
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      // Dividir el contenido en consultas individuales
      const queries = schemaContent.split(';').filter(query => query.trim());
      
      for (const query of queries) {
        if (query.trim()) {
          try {
            await pool.query(query);
          } catch (error) {
            // Ignorar errores de tablas que ya existen
            if (!error.message.includes('already exists')) {
              console.error(`Error ejecutando query: ${error.message}`);
            }
          }
        }
      }
      console.log('✅ Esquema de base de datos creado/verificado');
    }

    // Verificar que las tablas principales existan
    const tables = [
      'colores',
      'proveedores', 
      'codigos_estampado',
      'tipos_tela',
      'combinaciones',
      'combinacion_imagenes',
      'ventas',
      'detalles_venta'
    ];

    for (const table of tables) {
      try {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Tabla ${table} existe`);
      } catch (error) {
        console.log(`⚠️  Tabla ${table} no existe - necesitarás crearla manualmente`);
      }
    }

    console.log('✅ Base de datos inicializada correctamente');
    await pool.end();

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    await pool.end();
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase; 
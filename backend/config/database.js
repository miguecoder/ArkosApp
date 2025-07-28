require('dotenv').config();

const mysql = require('mysql2/promise');

// Configuración para Railway (MySQL URL) o local
const getDatabaseConfig = () => {
  // Si tenemos DATABASE_URL (Railway), la usamos
  if (process.env.DATABASE_URL) {
    return {
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    };
  }

  // Configuración local
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'camisetas_db',
    port: process.env.DB_PORT || 3306,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  };
};

const config = getDatabaseConfig();

// Crear pool de conexiones
const pool = mysql.createPool(config);

// Verificar conexión
pool.getConnection()
  .then(connection => {
    console.log('✅ Base de datos conectada exitosamente');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos:', err.message);
  });

module.exports = pool; 
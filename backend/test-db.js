const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testDatabase() {
    let connection;
    try {
        console.log('Probando conexión a la base de datos...');
        console.log('Configuración:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '(vacío)',
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        // Primero conectar sin especificar base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });

        console.log('✅ Conexión a MySQL exitosa');

        // Verificar si la base de datos existe
        const [databases] = await connection.execute(`SHOW DATABASES LIKE '${process.env.DB_NAME}'`);
        
        if (databases.length === 0) {
            console.log('❌ La base de datos no existe. Creándola...');
            await connection.execute(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log('✅ Base de datos creada exitosamente');
        } else {
            console.log('✅ La base de datos ya existe');
        }

        // Cerrar conexión y reconectar especificando la base de datos
        await connection.end();
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        // Verificar si las tablas existen
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tablas existentes:', tables.map(t => Object.values(t)[0]));

        if (tables.length === 0) {
            console.log('❌ No hay tablas. Necesitas ejecutar el script database.sql');
        } else {
            console.log('✅ Las tablas existen');
            
            // Verificar algunas tablas específicas
            const requiredTables = ['colores', 'proveedores', 'codigos_estampado', 'tipos_tela', 'combinaciones', 'precios_combinaciones', 'ventas'];
            for (const table of requiredTables) {
                const [tableExists] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
                if (tableExists.length > 0) {
                    console.log(`✅ Tabla ${table} existe`);
                } else {
                    console.log(`❌ Tabla ${table} NO existe`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        console.error('Detalles:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testDatabase(); 
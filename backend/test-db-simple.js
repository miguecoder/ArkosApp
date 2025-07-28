const mysql = require('mysql2/promise');

async function testDB() {
    let connection;
    try {
        console.log('Conectando a la base de datos...');
        
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'camisetas_db'
        });

        console.log('Conectado exitosamente');

        // Probar la consulta de ventas
        console.log('\nProbando consulta de ventas...');
        const [rows] = await connection.execute(`
            SELECT v.*, 
                   COALESCE(SUM(dv.cantidad), 0) as total_productos
            FROM ventas v
            LEFT JOIN detalle_venta dv ON v.id = dv.venta_id
            GROUP BY v.id
            ORDER BY v.fecha_venta DESC, v.id DESC
        `);

        console.log('Consulta exitosa');
        console.log('Total de ventas:', rows.length);
        
        if (rows.length > 0) {
            console.log('\nPrimera venta:');
            console.log('ID:', rows[0].id);
            console.log('Cliente:', rows[0].cliente);
            console.log('Total productos:', rows[0].total_productos);
            console.log('Tipo de total_productos:', typeof rows[0].total_productos);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testDB(); 
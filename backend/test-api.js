const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
    console.log('Probando rutas del API...\n');

    const routes = [
        { name: 'Dashboard', url: '/precios-combinaciones/dashboard' },
        { name: 'Combinaciones', url: '/combinaciones' },
        { name: 'Ventas', url: '/ventas' },
        { name: 'Colores', url: '/colores' },
        { name: 'Proveedores', url: '/proveedores' },
        { name: 'Estampados', url: '/estampados' },
        { name: 'Telas', url: '/telas' }
    ];

    for (const route of routes) {
        try {
            console.log(`Probando ${route.name}...`);
            const response = await axios.get(`${API_BASE_URL}${route.url}`);
            console.log(`✅ ${route.name}: OK (${response.status})`);
            if (response.data && Array.isArray(response.data)) {
                console.log(`   - ${response.data.length} elementos encontrados`);
            } else if (response.data && typeof response.data === 'object') {
                console.log(`   - Datos recibidos: ${Object.keys(response.data).join(', ')}`);
            }
        } catch (error) {
            console.log(`❌ ${route.name}: ERROR`);
            if (error.response) {
                console.log(`   - Status: ${error.response.status}`);
                console.log(`   - Message: ${error.response.data.message || 'Sin mensaje'}`);
            } else if (error.request) {
                console.log(`   - Error de conexión: ${error.message}`);
            } else {
                console.log(`   - Error: ${error.message}`);
            }
        }
        console.log('');
    }
}

testAPI().catch(console.error); 
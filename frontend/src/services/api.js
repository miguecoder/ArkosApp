import axios from 'axios';

// Configuración de la URL base según el ambiente
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Sistema de caché simple
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

const setCachedData = (key, data) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

const clearCache = () => {
    cache.clear();
};

// Configurar axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para manejar errores de rate limiting
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 429) {
            console.warn('Rate limit alcanzado. Limpiando caché y reintentando...');
            clearCache();
            // Opcional: mostrar mensaje al usuario
            if (typeof window !== 'undefined') {
                alert('Demasiadas peticiones. Por favor, espera un momento antes de continuar.');
            }
        }
        return Promise.reject(error);
    }
);

// APIs para cada entidad
export const coloresAPI = {
    getAll: async () => {
        const cacheKey = 'colores_all';
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
        
        const response = await api.get('/colores');
        setCachedData(cacheKey, response);
        return response;
    },
    getById: (id) => api.get(`/colores/${id}`),
    create: (data) => {
        clearCache(); // Limpiar caché al crear
        return api.post('/colores', data);
    },
    update: (id, data) => {
        clearCache(); // Limpiar caché al actualizar
        return api.put(`/colores/${id}`, data);
    },
    delete: (id) => {
        clearCache(); // Limpiar caché al eliminar
        return api.delete(`/colores/${id}`);
    },
};

export const proveedoresAPI = {
    getAll: async () => {
        const cacheKey = 'proveedores_all';
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
        
        const response = await api.get('/proveedores');
        setCachedData(cacheKey, response);
        return response;
    },
    getById: (id) => api.get(`/proveedores/${id}`),
    create: (data) => {
        clearCache();
        return api.post('/proveedores', data);
    },
    update: (id, data) => {
        clearCache();
        return api.put(`/proveedores/${id}`, data);
    },
    delete: (id) => {
        clearCache();
        return api.delete(`/proveedores/${id}`);
    },
};

export const estampadosAPI = {
    getAll: async () => {
        const cacheKey = 'estampados_all';
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
        
        const response = await api.get('/estampados');
        setCachedData(cacheKey, response);
        return response;
    },
    getById: (id) => api.get(`/estampados/${id}`),
    create: (data) => {
        clearCache();
        // Si data es FormData, no establecer Content-Type para que axios lo maneje automáticamente
        if (data instanceof FormData) {
            return api.post('/estampados', data, {
                headers: {
                    'Content-Type': undefined
                }
            });
        }
        return api.post('/estampados', data);
    },
    update: (id, data) => {
        clearCache();
        // Si data es FormData, no establecer Content-Type para que axios lo maneje automáticamente
        if (data instanceof FormData) {
            return api.put(`/estampados/${id}`, data, {
                headers: {
                    'Content-Type': undefined
                }
            });
        }
        return api.put(`/estampados/${id}`, data);
    },
    delete: (id) => {
        clearCache();
        return api.delete(`/estampados/${id}`);
    },
};

export const telasAPI = {
    getAll: async () => {
        const cacheKey = 'telas_all';
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
        
        const response = await api.get('/telas');
        setCachedData(cacheKey, response);
        return response;
    },
    getById: (id) => api.get(`/telas/${id}`),
    create: (data) => {
        clearCache();
        return api.post('/telas', data);
    },
    update: (id, data) => {
        clearCache();
        return api.put(`/telas/${id}`, data);
    },
    delete: (id) => {
        clearCache();
        return api.delete(`/telas/${id}`);
    },
};

export const combinacionesAPI = {
    getAll: async () => {
        const cacheKey = 'combinaciones_all';
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
        
        const response = await api.get('/combinaciones');
        setCachedData(cacheKey, response);
        return response;
    },
    getById: (id) => api.get(`/combinaciones/${id}`),
    create: (data) => {
        clearCache();
        // Si data es FormData, no establecer Content-Type para que axios lo maneje automáticamente
        if (data instanceof FormData) {
            return api.post('/combinaciones', data, {
                headers: {
                    'Content-Type': undefined
                }
            });
        }
        return api.post('/combinaciones', data);
    },
    update: (id, data) => {
        clearCache();
        // Si data es FormData, no establecer Content-Type para que axios lo maneje automáticamente
        if (data instanceof FormData) {
            return api.put(`/combinaciones/${id}`, data, {
                headers: {
                    'Content-Type': undefined
                }
            });
        }
        return api.put(`/combinaciones/${id}`, data);
    },
    delete: (id) => {
        clearCache();
        return api.delete(`/combinaciones/${id}`);
    },
};

export const preciosCombinacionesAPI = {
    getAll: () => api.get('/precios-combinaciones'),
    getById: (id) => api.get(`/precios-combinaciones/${id}`),
    getByCombinacion: (combinacionId) => api.get(`/precios-combinaciones/combinacion/${combinacionId}`),
    create: (data) => {
        clearCache();
        return api.post('/precios-combinaciones', data);
    },
    update: (id, data) => {
        clearCache();
        return api.put(`/precios-combinaciones/${id}`, data);
    },
    delete: (id) => {
        clearCache();
        return api.delete(`/precios-combinaciones/${id}`);
    },
    getDashboard: async () => {
        const cacheKey = 'dashboard_data';
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
        
        const response = await api.get('/precios-combinaciones/dashboard');
        setCachedData(cacheKey, response);
        return response;
    },
};

export const ventasAPI = {
    getAll: () => api.get('/ventas'),
    getById: (id) => api.get(`/ventas/${id}`),
    create: (data) => {
        clearCache();
        return api.post('/ventas', data);
    },
    update: (id, data) => {
        clearCache();
        return api.put(`/ventas/${id}`, data);
    },
    delete: (id) => {
        clearCache();
        return api.delete(`/ventas/${id}`);
    },
};

// API para obtener todos los datos del dashboard en una sola petición
export const dashboardAPI = {
    getAllData: async () => {
        const cacheKey = 'dashboard_all_data';
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
        
        const response = await api.get('/dashboard-data');
        setCachedData(cacheKey, response);
        return response;
    },
};

// Exportar función para limpiar caché manualmente
export const clearAPICache = clearCache;

export default api; 
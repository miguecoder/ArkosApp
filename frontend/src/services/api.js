import axios from 'axios';

// Configuración de la URL base según el ambiente
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configurar axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// APIs para cada entidad
export const coloresAPI = {
    getAll: () => api.get('/colores'),
    getById: (id) => api.get(`/colores/${id}`),
    create: (data) => api.post('/colores', data),
    update: (id, data) => api.put(`/colores/${id}`, data),
    delete: (id) => api.delete(`/colores/${id}`),
};

export const proveedoresAPI = {
    getAll: () => api.get('/proveedores'),
    getById: (id) => api.get(`/proveedores/${id}`),
    create: (data) => api.post('/proveedores', data),
    update: (id, data) => api.put(`/proveedores/${id}`, data),
    delete: (id) => api.delete(`/proveedores/${id}`),
};

export const estampadosAPI = {
    getAll: () => api.get('/estampados'),
    getById: (id) => api.get(`/estampados/${id}`),
    create: (data) => {
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
    delete: (id) => api.delete(`/estampados/${id}`),
};

export const telasAPI = {
    getAll: () => api.get('/telas'),
    getById: (id) => api.get(`/telas/${id}`),
    create: (data) => api.post('/telas', data),
    update: (id, data) => api.put(`/telas/${id}`, data),
    delete: (id) => api.delete(`/telas/${id}`),
};

export const combinacionesAPI = {
    getAll: () => api.get('/combinaciones'),
    getById: (id) => api.get(`/combinaciones/${id}`),
    create: (data) => {
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
    delete: (id) => api.delete(`/combinaciones/${id}`),
};

export const preciosCombinacionesAPI = {
    getAll: () => api.get('/precios-combinaciones'),
    getById: (id) => api.get(`/precios-combinaciones/${id}`),
    getByCombinacion: (combinacionId) => api.get(`/precios-combinaciones/combinacion/${combinacionId}`),
    create: (data) => api.post('/precios-combinaciones', data),
    update: (id, data) => api.put(`/precios-combinaciones/${id}`, data),
    delete: (id) => api.delete(`/precios-combinaciones/${id}`),
    getDashboard: () => api.get('/precios-combinaciones/dashboard'),
};

export const ventasAPI = {
    getAll: () => api.get('/ventas'),
    getById: (id) => api.get(`/ventas/${id}`),
    create: (data) => api.post('/ventas', data),
    update: (id, data) => api.put(`/ventas/${id}`, data),
    delete: (id) => api.delete(`/ventas/${id}`),
};

export default api; 
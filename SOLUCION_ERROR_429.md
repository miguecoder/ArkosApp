# Solución para Error 429 - Too Many Requests

## Problema Identificado

La aplicación estaba experimentando errores 429 (Too Many Requests) debido a:

1. **Rate Limiting muy restrictivo**: 100 requests por 15 minutos
2. **Múltiples peticiones simultáneas**: 5 peticiones al cargar la página de combinaciones
3. **Falta de caché**: Peticiones repetidas innecesarias
4. **Posible bucle de re-renderizado**: Componentes haciendo peticiones innecesarias

## Soluciones Implementadas

### 1. Ajuste del Rate Limiting (Backend)

**Archivo**: `backend/server.js`

- Aumentado el límite de 100 a 500 requests por 15 minutos
- Agregados headers informativos para el rate limiting
- Configuración más flexible para entornos de producción

```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // máximo 500 requests por ventana (aumentado de 100)
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});
```

### 2. Sistema de Caché (Frontend)

**Archivo**: `frontend/src/services/api.js`

- Implementado caché con duración de 5 minutos
- Limpieza automática de caché en operaciones de escritura
- Interceptor para manejar errores 429 automáticamente

```javascript
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};
```

### 3. Endpoint Optimizado (Backend)

**Archivo**: `backend/server.js`

- Nuevo endpoint `/api/dashboard-data` que obtiene todos los datos en una sola petición
- Reduce de 5 peticiones a 1 petición al cargar la página
- Consultas optimizadas con JOINs

```javascript
app.get('/api/dashboard-data', async (req, res) => {
    // Obtiene combinaciones, colores, telas, proveedores, estampados y métricas
    // en una sola petición
});
```

### 4. Optimización de Componentes (Frontend)

**Archivo**: `frontend/src/pages/Combinaciones.js`

- Control de estado para evitar recargas innecesarias
- Botón de recarga manual
- Manejo mejorado de errores 429
- Fallback a endpoints individuales si el optimizado falla

```javascript
const [dataLoaded, setDataLoaded] = useState(false);

useEffect(() => {
    if (!dataLoaded) {
        loadData();
    }
}, [dataLoaded]);
```

### 5. Manejo de Errores Mejorado

- Mensajes específicos para errores 429
- Limpieza automática de caché cuando se alcanza el rate limit
- Alertas informativas para el usuario

## Beneficios de las Soluciones

1. **Reducción de peticiones**: De 5 a 1 petición al cargar datos
2. **Mejor experiencia de usuario**: Caché evita peticiones repetidas
3. **Mayor tolerancia**: Rate limiting más permisivo
4. **Recuperación automática**: Manejo inteligente de errores 429
5. **Flexibilidad**: Fallback a métodos anteriores si es necesario

## Cómo Desplegar los Cambios

1. **Localmente**:
   ```bash
   ./deploy.sh
   ```

2. **En Railway**:
   ```bash
   railway up
   ```

## Monitoreo

Para verificar que las soluciones funcionan:

1. Revisar los logs del servidor para confirmar que el rate limiting está configurado
2. Verificar en las herramientas de desarrollador que se hacen menos peticiones
3. Comprobar que el caché funciona revisando las peticiones en la pestaña Network

## Próximos Pasos Recomendados

1. **Monitoreo continuo**: Implementar métricas para trackear el uso de la API
2. **Optimización de consultas**: Revisar y optimizar las consultas SQL
3. **Implementar Redis**: Para un sistema de caché más robusto en producción
4. **Rate limiting dinámico**: Ajustar límites basado en el uso real
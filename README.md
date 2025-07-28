# Aplicación de Gestión de Ventas de Camisetas

Una aplicación completa para gestionar ventas de camisetas con React, Node.js y MySQL.

## Características

- **Gestión de Colores**: Crear y administrar colores de camisetas con códigos HEX
- **Gestión de Proveedores**: Administrar proveedores con información completa
- **Gestión de Estampados**: Crear códigos de estampado con categorías
- **Gestión de Tipos de Tela**: Administrar diferentes tipos de tela con composición y gramaje
- **Combinaciones**: Asociar colores, telas, proveedores y estampados en combinaciones
- **Gestión de Precios**: Asignar precios a las combinaciones
- **Gestión de Ventas**: Crear y administrar ventas con múltiples items
- **Dashboard**: Vista general con estadísticas y ventas recientes

## Tecnologías Utilizadas

### Backend
- **Node.js** con Express
- **MySQL** como base de datos
- **CORS** para comunicación entre frontend y backend
- **Dotenv** para variables de entorno

### Frontend
- **React** 18
- **React Router** para navegación
- **React Hook Form** para formularios
- **Axios** para peticiones HTTP
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **React Hot Toast** para notificaciones

## Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- MySQL (versión 8.0 o superior)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd camisetas-app
```

### 2. Configurar la base de datos
1. Crear una base de datos MySQL llamada `camisetas_db`
2. Ejecutar el script SQL ubicado en `backend/database.sql`

### 3. Configurar el backend
```bash
cd backend
npm install
```

Editar el archivo `config.env` con tus credenciales de base de datos:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=camisetas_db
DB_PORT=3306
PORT=5000
JWT_SECRET=tu_secreto_jwt_super_seguro
```

### 4. Configurar el frontend
```bash
cd ../frontend
npm install
```

### 5. Ejecutar la aplicación

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Estructura del Proyecto

```
camisetas-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── colores.js
│   │   ├── proveedores.js
│   │   ├── estampados.js
│   │   ├── telas.js
│   │   ├── combinaciones.js
│   │   ├── precios.js
│   │   └── ventas.js
│   ├── uploads/
│   ├── config.env
│   ├── database.sql
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Colores.js
│   │   │   ├── Proveedores.js
│   │   │   ├── Estampados.js
│   │   │   ├── Telas.js
│   │   │   ├── Combinaciones.js
│   │   │   ├── Precios.js
│   │   │   └── Ventas.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Uso de la Aplicación

### 1. Dashboard
- Vista general con estadísticas de todas las secciones
- Ventas recientes
- Enlaces rápidos a todas las secciones

### 2. Gestión de Colores
- Crear colores con nombre, código HEX y descripción
- Editar y eliminar colores existentes
- Vista previa del color con el código HEX

### 3. Gestión de Proveedores
- Crear proveedores con información completa:
  - Nombre, dirección, teléfono, email
  - RUC
  - Contacto principal y sus datos
  - Notas adicionales

### 4. Gestión de Estampados
- Crear códigos de estampado únicos
- Categorizar estampados
- Agregar descripciones

### 5. Gestión de Tipos de Tela
- Crear tipos de tela con:
  - Nombre y descripción
  - Composición
  - Gramaje

### 6. Combinaciones
- Crear combinaciones asociando:
  - Múltiples colores
  - Múltiples tipos de tela
  - Múltiples proveedores
  - Múltiples estampados

### 7. Gestión de Precios
- Asignar precios a las combinaciones
- Especificar moneda y fecha de vigencia
- Vista en tabla con información completa

### 8. Gestión de Ventas
- Crear ventas con información del cliente
- Agregar múltiples items (combinaciones)
- Cálculo automático de subtotales y total
- Estados de venta (Pendiente, Completada, Cancelada)
- Métodos de pago
- Ver detalles completos de cada venta

## API Endpoints

### Colores
- `GET /api/colores` - Obtener todos los colores
- `GET /api/colores/:id` - Obtener un color específico
- `POST /api/colores` - Crear un nuevo color
- `PUT /api/colores/:id` - Actualizar un color
- `DELETE /api/colores/:id` - Eliminar un color

### Proveedores
- `GET /api/proveedores` - Obtener todos los proveedores
- `GET /api/proveedores/:id` - Obtener un proveedor específico
- `POST /api/proveedores` - Crear un nuevo proveedor
- `PUT /api/proveedores/:id` - Actualizar un proveedor
- `DELETE /api/proveedores/:id` - Eliminar un proveedor

### Estampados
- `GET /api/estampados` - Obtener todos los estampados
- `GET /api/estampados/:id` - Obtener un estampado específico
- `POST /api/estampados` - Crear un nuevo estampado
- `PUT /api/estampados/:id` - Actualizar un estampado
- `DELETE /api/estampados/:id` - Eliminar un estampado

### Telas
- `GET /api/telas` - Obtener todos los tipos de tela
- `GET /api/telas/:id` - Obtener un tipo de tela específico
- `POST /api/telas` - Crear un nuevo tipo de tela
- `PUT /api/telas/:id` - Actualizar un tipo de tela
- `DELETE /api/telas/:id` - Eliminar un tipo de tela

### Combinaciones
- `GET /api/combinaciones` - Obtener todas las combinaciones
- `GET /api/combinaciones/:id` - Obtener una combinación específica
- `POST /api/combinaciones` - Crear una nueva combinación
- `PUT /api/combinaciones/:id` - Actualizar una combinación
- `DELETE /api/combinaciones/:id` - Eliminar una combinación

### Precios
- `GET /api/precios` - Obtener todos los precios
- `GET /api/precios/:id` - Obtener un precio específico
- `GET /api/precios/combinacion/:combinacionId` - Obtener precios por combinación
- `POST /api/precios` - Crear un nuevo precio
- `PUT /api/precios/:id` - Actualizar un precio
- `DELETE /api/precios/:id` - Eliminar un precio

### Ventas
- `GET /api/ventas` - Obtener todas las ventas
- `GET /api/ventas/:id` - Obtener una venta específica con detalles
- `POST /api/ventas` - Crear una nueva venta
- `PUT /api/ventas/:id` - Actualizar una venta
- `DELETE /api/ventas/:id` - Eliminar una venta

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio. 
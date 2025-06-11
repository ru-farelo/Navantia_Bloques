# Backend - API de Bloques Navantia

**Autor:** Ruben Fernandez Farelo

## Descripción
El backend de la aplicación está desarrollado con Node.js y SQL Server, proporcionando una API REST para la gestión de bloques de construcción naval.

## Estructura del Proyecto

### Arquitectura MVC
La API está estructurada siguiendo el patrón Modelo-Vista-Controlador:

#### Rutas y Controladores
- `src/routes/bloques.js`: 
  - Define los endpoints de la API REST
  - Implementa la lógica de validación de requests
  - Maneja la autenticación y autorización
  - Coordina las operaciones con los servicios

#### Modelos y Servicios
- `src/models/bloque.js`: 
  - Define el esquema de datos para los bloques
  - Implementa validaciones a nivel de modelo
  - Define relaciones con otros modelos
  - Maneja la serialización/deserialización

- `src/services/bloqueService.js`: 
  - Implementa la lógica de negocio principal
  - Gestiona las operaciones CRUD en la base de datos
  - Maneja la lógica de validación compleja
  - Implementa la lógica de negocio específica

## Tecnologías Utilizadas
- Node.js
- Express
- SQL Server
- Sequelize
- JWT (para autenticación)

## Instalación
```bash
npm install
```

## Configuración
Crear un archivo `.env` con:
```
PORT=3000

DB_SERVER=localhost\SQLEXPRESS
DB_USER=
DB_PASSWORD=
DB_NAME=Api_Bloques
DB_PORT=1433
```

## Ejecución
```bash
npm run dev
```

## Endpoints de la API

### Bloques
- `GET /api/bloques`: Obtener todos los bloques
- `GET /api/bloques/:id`: Obtener un bloque específico
- `POST /api/bloques`: Crear un nuevo bloque
- `PUT /api/bloques/:id`: Actualizar un bloque existente
- `DELETE /api/bloques/:id`: Eliminar un bloque

### Tipos de Bloque
- `GET /api/tipos-bloque`: Obtener todos los tipos de bloque
- `POST /api/tipos-bloque`: Crear un nuevo tipo de bloque
- `DELETE /api/tipos-bloque/:id`: Eliminar un tipo de bloque

## Características Principales
- API RESTful completa
- Validación de datos
- Manejo de errores robusto
- Integración con SQL Server
- Sistema de logging
- Documentación de endpoints 
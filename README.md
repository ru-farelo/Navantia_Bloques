# Sistema Web de Gestión de Bloques de Construcción Naval – Navantia

**Autor:** Rubén Fernández Farelo

Este proyecto consiste en una aplicación web para la gestión y visualización de bloques de construcción naval, desarrollada con React en el frontend y Node.js en el backend.

## Descripción General

La aplicación permite:
- Visualizar bloques en un mapa interactivo
- Crear y editar bloques con diferentes propiedades
- Gestionar tipos de bloques y sus características
- Filtrar bloques por fechas
- Previsualizar cambios antes de guardar
- Detectar colisiones entre bloques

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

### Frontend
La interfaz de usuario está desarrollada con React y OpenLayers.
Para más detalles sobre la estructura y componentes del frontend, consulta el [README del Frontend](frontend/README.md).

### Backend
La API REST está desarrollada con Node.js y SQL Server.
Para más detalles sobre la estructura y endpoints del backend, consulta el [README del Backend](backend/README.md).

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)
- SQL Server Management 2019 (para la base de datos)

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Instalar dependencias del backend:
```bash
cd backend
npm install
```

3. Instalar dependencias del frontend:
```bash
cd frontend
npm install
```

## Configuración

1. En el directorio `backend`, crear un archivo `.env` con las siguientes variables:
```
PORT=3000

DB_SERVER=localhost\SQLEXPRESS
DB_USER=
DB_PASSWORD=
DB_NAME=Api_Bloques
DB_PORT=1433
```

2. En el directorio `frontend`, crear un archivo `.env` con:
```
VITE_API_URL=http://localhost:3000
```

## Ejecución

1. Iniciar el backend:
```bash
cd backend
npm run dev
```

2. En otra terminal, iniciar el frontend:
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Tecnologías Utilizadas

- Frontend:
  - React
  - OpenLayers
  - Vite
  - Material-UI

- Backend:
  - Node.js
  - Express
  - SQL Server
  - Sequelize

## Contribución

Para contribuir al proyecto:
1. Crear una rama nueva para cada feature
2. Seguir las convenciones de código existentes
3. Realizar pruebas antes de hacer commit
4. Crear un pull request con una descripción clara de los cambios

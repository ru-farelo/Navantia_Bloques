# Frontend - API de Bloques Navantia

**Autor:** Ruben Fernandez Farelo

## Descripción
El frontend de la aplicación está desarrollado con React y OpenLayers, proporcionando una interfaz interactiva para la gestión de bloques de construcción naval.

## Estructura de Componentes

### Componentes Principales
- `src/App.jsx`: Componente raíz que maneja:
  - Gestión del estado global de la aplicación (bloques, fechas, modales)
  - Comunicación con el backend para operaciones CRUD
  - Control de fechas para filtrado de bloques
  - Gestión de tipos de bloques y sus colores
  - Manejo de modos de interacción (creación, edición)
  - Sistema de instrucciones para nuevos usuarios

### Componentes del Mapa
- `src/components/Mapa.jsx`: 
  - Implementa la visualización del mapa usando OpenLayers
  - Gestiona la interacción con bloques (selección, movimiento, edición)
  - Maneja la previsualización de bloques antes de su creación
  - Controla los modos de interacción (creación, edición, movimiento)
  - Implementa la detección de colisiones entre bloques
  - Gestiona la información de talleres y su visualización

- `src/components/MapaUtils.js`: 
  - Contiene funciones auxiliares para la manipulación de geometrías
  - Define los estilos visuales de los bloques
  - Implementa la lógica de creación de rectángulos y rotaciones
  - Proporciona utilidades para la detección de solapamientos
  - Define los bloques predefinidos con sus propiedades

- `src/components/MapaModals.jsx`: 
  - Implementa los modales de edición y eliminación de bloques
  - Gestiona los formularios de edición de propiedades
  - Maneja la confirmación de eliminación de bloques
  - Proporciona la interfaz para modificar tipos de bloques

- `src/components/MapaEffects.js`: 
  - Gestiona los efectos visuales del mapa
  - Implementa la previsualización de bloques en tiempo real
  - Maneja los efectos de hover y selección
  - Controla la actualización de la capa de bloques
  - Implementa la lógica de eventos del mapa

## Tecnologías Utilizadas
- React
- OpenLayers
- Vite
- Material-UI
- React-Bootstrap
- React-Select

## Instalación
```bash dentro de /frontend
npm install
```

## Configuración dentro de /frontend
Crear un archivo `.env` con:
```
VITE_API_URL=http://localhost:3000
```

## Ejecución dentro de frontend
```bash
npm run dev
```

## Características Principales
- Visualización interactiva de bloques en el mapa
- Sistema de previsualización en tiempo real
- Gestión de tipos de bloques con colores personalizados
- Filtrado por fechas
- Detección de colisiones
- Interfaz intuitiva para la gestión de bloques 
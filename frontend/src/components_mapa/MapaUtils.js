/**
 * Utilidades para el manejo del mapa y bloques
 * 
 * Este archivo contiene:
 * - Definición de bloques predefinidos con sus propiedades
 * - Funciones para el estilo y visualización de bloques
 * - Funciones para la creación y manipulación de geometrías
 * - Funciones para el cálculo de rotaciones y detección de solapamientos
 */

import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { intersects as intersectsExtent } from 'ol/extent';

/**
 * Lista de bloques predefinidos con sus propiedades
 * Cada bloque tiene:
 * - nombre: Identificador del tipo de bloque
 * - color: Color hexadecimal para la visualización
 * - ancho: Ancho del bloque en unidades del mapa
 * - alto: Alto del bloque en unidades del mapa
 */
export const bloquesPredefinidos = [
  { nombre: 'F-111 (Bloque)', color: '#f4a460', ancho: 30, alto: 20 },
  { nombre: 'F-111 Elemento', color: '#ff9900', ancho: 20, alto: 15 },
  { nombre: 'F-111 (Cama) (Previas)', color: '#4682b4', ancho: 25, alto: 18 },
  { nombre: 'F-111 (Bloque)', color: '#2e8b57', ancho: 30, alto: 20 },
  { nombre: 'BLQ. PINTADO F-111', color: '#6a0dad', ancho: 28, alto: 18 },
  { nombre: 'F-112 Elemento', color: '#4b0082', ancho: 20, alto: 15 },
  { nombre: 'F-112 Paneles', color: '#00bfff', ancho: 22, alto: 15 },
  { nombre: 'F-112 (Cama) (Previas)', color: '#ffa500', ancho: 25, alto: 18 },
  { nombre: 'F-112 (Bloque)', color: '#ff0000', ancho: 30, alto: 20 }
];

/**
 * Crea el estilo visual para un bloque
 * @param {string} color - Color del bloque
 * @param {string} text - Texto a mostrar en el bloque
 * @param {boolean} isPreview - Si es true, el bloque se muestra semitransparente
 * @returns {Style} Estilo de OpenLayers para el bloque
 */
export function getBlockStyle(color, text, isPreview = false) {
  return new Style({
    fill: new Fill({ color: isPreview ? color + '80' : '#ffffff00' }),
    stroke: new Stroke({ color, width: 4 }),
    text: isPreview ? null : new Text({
      text: text,
      font: 'bold 13px Arial',
      fill: new Fill({ color: '#fff' }),
      stroke: new Stroke({ color: '#000', width: 3 }),
      textAlign: 'center',
      textBaseline: 'middle',
      offsetY: 0
    })
  });
}

/**
 * Crea las coordenadas para un rectángulo
 * @param {Array} center - Coordenadas del centro [x, y]
 * @param {number} ancho - Ancho del rectángulo
 * @param {number} alto - Alto del rectángulo
 * @param {number} rotation - Rotación en radianes
 * @returns {Array|null} Array de coordenadas para el polígono o null si hay error
 */
export function createRectangle(center, ancho, alto, rotation = 0) {
  if (!center || !Array.isArray(center) || center.length < 2) return null;
  const [x, y] = center;
  const halfW = ancho / 2;
  const halfH = alto / 2;
  let coords = [
    [x - halfW, y - halfH],
    [x + halfW, y - halfH],
    [x + halfW, y + halfH],
    [x - halfW, y + halfH],
    [x - halfW, y - halfH]
  ];
  if (rotation !== 0) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    coords = coords.map(([px, py]) => [
      x + (px - x) * cos - (py - y) * sin,
      y + (px - x) * sin + (py - y) * cos
    ]);
  }
  return [coords];
}

/**
 * Calcula la rotación automática basada en la geometría del taller
 * @param {Feature} taller - Feature de OpenLayers que representa el taller
 * @returns {number} Rotación en grados
 */
export function calcularRotacionAutomatica(taller = null) {
  if (!taller) return 0;
  try {
    const geometria = taller.getGeometry();
    if (!geometria) return 0;
    const coords = geometria.getCoordinates()[0];
    if (!coords || coords.length < 4) return 0;
    let maxDist = 0;
    let anguloLadoLargo = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) {
        maxDist = dist;
        anguloLadoLargo = Math.atan2(dy, dx);
      }
    }
    const grados = ((anguloLadoLargo * 180 / Math.PI) % 360 + 360) % 360;
    return Math.round(grados);
  } catch (error) {
    console.error('Error al calcular rotación automática:', error);
    return 0;
  }
}

/**
 * Verifica si hay solapamiento entre un nuevo bloque y los existentes
 * @param {Array} coords - Coordenadas del nuevo bloque
 * @param {VectorSource} source - Fuente de datos de OpenLayers con los bloques existentes
 * @param {Array} bloquesLocales - Array de bloques locales para verificar
 * @returns {boolean} true si hay solapamiento, false en caso contrario
 */
export function haySolapamiento(coords, source, bloquesLocales) {
  if (!source || !coords) return false;
  
  try {
    const nuevoPoligono = new Polygon(coords);
    const nuevoExtent = nuevoPoligono.getExtent();
    
    // Verificar solapamiento con bloques existentes
    const features = source.getFeatures();
    for (const feature of features) {
      if (feature.get('tipo')) {
        const geometria = feature.getGeometry();
        if (geometria && typeof geometria.intersectsGeometry === 'function') {
          if (geometria.intersectsGeometry(nuevoPoligono)) {
            return true;
          }
        }
      }
    }

    // Verificar solapamiento con bloques locales
    if (bloquesLocales && bloquesLocales.length > 0) {
      for (const bloque of bloquesLocales) {
        if (bloque.optimista) {
          const coordsBloque = createRectangle(
            [bloque.Longitud, bloque.Latitud],
            bloque.Ancho,
            bloque.Alto,
            bloque.Rotacion * Math.PI / 180
          );
          if (coordsBloque) {
            const poligonoBloque = new Polygon(coordsBloque);
            const poligonoBloqueExtent = poligonoBloque.getExtent();
            if (intersectsExtent(poligonoBloqueExtent, nuevoExtent)) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar solapamiento:', error);
    return false;
  }
} 

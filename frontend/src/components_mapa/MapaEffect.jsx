/**
 * Componente de efectos visuales para el mapa
 * 
 * Este componente maneja:
 * - Efectos de hover sobre bloques
 * - Efectos de selección
 * - Efectos de previsualización
 * - Animaciones y transiciones
 */

import React, { useEffect, useRef } from 'react';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { getBlockStyle } from './MapaUtils';

/**
 * Hook personalizado para manejar efectos visuales en el mapa
 * @param {Object} map - Instancia del mapa de OpenLayers
 * @param {Array} bloques - Lista de bloques actuales
 * @param {Array} tiposBloque - Tipos de bloque disponibles
 * @param {Object} selectedBlock - Bloque seleccionado actualmente
 * @param {boolean} modoCreacionActivo - Indica si está activo el modo de creación
 */
export function useMapaEffect(map, bloques, tiposBloque, selectedBlock, modoCreacionActivo) {
  const hoveredFeature = useRef(null);

  useEffect(() => {
    if (!map) return;

    const handlePointerMove = (event) => {
      const pixel = map.getEventPixel(event.originalEvent);
      const feature = map.forEachFeatureAtPixel(pixel, feature => feature);

      // Restaurar estilo del feature anteriormente hover
      if (hoveredFeature.current && hoveredFeature.current !== feature) {
        const tipo = tiposBloque.find(t => String(t.Id) === String(hoveredFeature.current.get('properties').TipoBloqueId));
        if (tipo) {
          hoveredFeature.current.setStyle(getBlockStyle(tipo.Color, hoveredFeature.current.get('properties').Bloque));
        }
      }

      // Aplicar estilo de hover al nuevo feature
      if (feature && feature !== selectedBlock) {
        const tipo = tiposBloque.find(t => String(t.Id) === String(feature.get('properties').TipoBloqueId));
        if (tipo) {
          feature.setStyle(new Style({
            fill: new Fill({
              color: tipo.Color + '80' // Añade transparencia
            }),
            stroke: new Stroke({
              color: '#000',
              width: 2
            }),
            text: new Text({
              text: feature.get('properties').Bloque,
              fill: new Fill({
                color: '#000'
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 3
              })
            })
          }));
        }
        hoveredFeature.current = feature;
      } else {
        hoveredFeature.current = null;
      }
    };

    // Aplicar estilos iniciales
    bloques.forEach(bloque => {
      const feature = map.getFeatures().find(f => f.get('properties').Id === bloque.Id);
      if (feature) {
        const tipo = tiposBloque.find(t => String(t.Id) === String(bloque.TipoBloqueId));
        if (tipo) {
          feature.setStyle(getBlockStyle(tipo.Color, bloque.Bloque));
        }
      }
    });

    // Aplicar estilo al bloque seleccionado
    if (selectedBlock) {
      const feature = map.getFeatures().find(f => f.get('properties').Id === selectedBlock.Id);
      if (feature) {
        const tipo = tiposBloque.find(t => String(t.Id) === String(selectedBlock.TipoBloqueId));
        if (tipo) {
          feature.setStyle(new Style({
            fill: new Fill({
              color: tipo.Color
            }),
            stroke: new Stroke({
              color: '#000',
              width: 3
            }),
            text: new Text({
              text: selectedBlock.Bloque,
              fill: new Fill({
                color: '#000'
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 3
              })
            })
          }));
        }
      }
    }

    map.on('pointermove', handlePointerMove);

    return () => {
      map.un('pointermove', handlePointerMove);
    };
  }, [map, bloques, tiposBloque, selectedBlock, modoCreacionActivo]);
} 
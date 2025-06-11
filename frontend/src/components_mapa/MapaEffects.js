import { useEffect } from 'react';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import * as olSource from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { FullScreen, defaults as defaultControls } from 'ol/control.js';
import { DragRotate, defaults as defaultInteractions } from 'ol/interaction';
import { getBlockStyle, createRectangle, calcularRotacionAutomatica, haySolapamiento } from './MapaUtils';

export function useMapInitialization(mapRef, mapObj) {
  useEffect(() => {
    if (!mapRef.current) return;

    const canvas = mapRef.current.querySelector('canvas');
    if (canvas) {
      canvas.willReadFrequently = true;
    }

    const source = new VectorSource();
    const vector = new VectorLayer({
      source,
      className: 'vectorLayer',
      style: (feature) => {
        const tipo = feature.get('tipo') || '';
        const color = feature.get('TipoColor') || '#000000';
        return getBlockStyle(color, tipo);
      },
      zIndex: 50
    });

    const talleresSource = new olSource.Vector({
      url: '/geojson/talleres.geojson',
      format: new GeoJSON()
    });

    const mapaTalleres = new VectorLayer({
      source: talleresSource,
      visible: true,
      title: 'Talleres',
      zIndex: 10,
      declutter: true
    });

    const previewSource = new VectorSource();
    const previewLayer = new VectorLayer({ 
      source: previewSource, 
      zIndex: 100,
      style: (feature) => {
        const tipo = feature.get('tipo') || '';
        const color = feature.get('color') || '#000';
        return getBlockStyle(color, tipo, true);
      }
    });

    const map = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      interactions: defaultInteractions().extend([new DragRotate()]),
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), mapaTalleres, vector, previewLayer],
      view: new View({ center: fromLonLat([-8.22689, 43.47821]), zoom: 16 })
    });

    mapObj.current = { map, source, talleresSource, previewSource };

    return () => {
      map.setTarget(undefined);
    };
  }, []);
}

export function useMapEvents(mapObj, {
  modo,
  modoCreacionActivo,
  onBlockPosition,
  setModoCreacionActivo,
  selectedBlock,
  setHoveredBlockInfo,
  setHoveredBlockPixel,
  setModo,
  moveBlock,
  setMoveBlock,
  setMoveMenu,
  setMovePreviewCoord,
  fetchBloques,
  bloques,
  setPreviewCoord,
  setPointerCoord,
  setTallerEnPointer
}) {
  useEffect(() => {
    const { map } = mapObj.current;
    if (!map) return;

    const onPointerMove = (evt) => {
      const coord = evt.coordinate;
      setPointerCoord(coord);
      let taller = null;
      mapObj.current.talleresSource.forEachFeature((feature) => {
        if (feature.getGeometry().intersectsCoordinate(coord)) {
          taller = feature;
        }
      });
      setTallerEnPointer(taller);
      if (modo === 'mover' && taller) {
        setMovePreviewCoord(coord);
      }
    };

    const onSingleClick = (evt) => {
      let tallerClic = null;
      mapObj.current.talleresSource.forEachFeature((feature) => {
        if (feature.getGeometry().intersectsCoordinate(evt.coordinate)) {
          tallerClic = feature;
        }
      });

      if (modoCreacionActivo && tallerClic) {
        if (onBlockPosition) {
          onBlockPosition(evt.coordinate, '', {
            localización: tallerClic.get('localización') || '',
            celda: tallerClic.get('celda') || ''
          }, {
            ancho: 30,
            alto: 20,
            rotacion: calcularRotacionAutomatica(tallerClic),
            tipoBloqueId: '',
            tipoColor: '#bdbdbd'
          });
        }
        setModoCreacionActivo(false);
        return;
      }

      if (modo === 'mover' && tallerClic && moveBlock) {
        const coord = evt.coordinate;
        const ancho = moveBlock.Ancho || 30;
        const alto = moveBlock.Alto || 20;
        const rotacionBloque = calcularRotacionAutomatica(tallerClic);
        const coords = createRectangle(coord, ancho, alto, rotacionBloque * Math.PI / 180);
        if (!coords) return;
        if (haySolapamiento(coords, mapObj.current.source, [])) {
          alert('No se puede colocar el bloque aquí');
          return;
        }
        const localizacion = tallerClic.get('localización') || '';
        const celda = tallerClic.get('celda') || '';
        const bloqueActualizado = {
          ...moveBlock,
          Latitud: coord[1],
          Longitud: coord[0],
          Localización: localizacion,
          Celda: celda,
          Rotacion: rotacionBloque
        };
        fetch(`${import.meta.env.VITE_API_URL}/api/bloques/${moveBlock.Id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bloqueActualizado)
        })
          .then(response => {
            if (!response.ok) throw new Error('Error al actualizar el bloque');
            return response.json();
          })
          .then(() => {
            setMoveBlock(null);
            setMoveMenu(null);
            setMovePreviewCoord(null);
            setModo(selectedBlock ? 'creacion' : '');
            if (fetchBloques) fetchBloques();
          })
          .catch(error => {
            alert('Error al mover el bloque');
          });
        return;
      }
      else if (modo === 'creacion' && tallerClic && selectedBlock) {
        const coord = evt.coordinate;
        const ancho = 30;
        const alto = 20;
        const rotacionBloque = calcularRotacionAutomatica(tallerClic);

        const coords = createRectangle(coord, ancho, alto, rotacionBloque * Math.PI / 180);
        if (!coords) return;
        if (haySolapamiento(coords, mapObj.current.source, [])) {
          alert('No se puede colocar el bloque aquí');
          return;
        }

        const localizacion = tallerClic.get('localización') || '';
        const celda = tallerClic.get('celda') || '';
        const tipoNombre = selectedBlock.Nombre || selectedBlock.nombre || '';
        const tipoId = selectedBlock.Id || selectedBlock.tipoId;
        const tipoColor = selectedBlock.Color || '#000000';

        if (onBlockPosition) {
          onBlockPosition(
            coord,
            tipoNombre,
            {
              localización: localizacion,
              celda: celda
            },
            {
              ancho,
              alto,
              rotacion: rotacionBloque,
              tipoBloqueId: tipoId,
              tipoColor: tipoColor
            }
          );
        }

        setPreviewCoord(null);
        if (mapObj.current?.previewSource) {
          mapObj.current.previewSource.clear();
        }
        return;
      }
      else {
        let features = [];
        map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          if (feature.get('tipo') && !feature.get('preview') && !mapObj.current.talleresSource.getFeatures().includes(feature)) {
            features.push(feature);
          }
        }, { hitTolerance: 30 });

        if (features.length > 0) {
          let real = features.find(f => !f.get('optimista'));
          let selected = real || features[0];
          
          const blockInfo = {
            Id: selected.get('Id'),
            Bloque: selected.get('Bloque') || '-',
            Tipo: selected.get('TipoNombre') || selected.get('tipo') || '',
            TipoNombre: selected.get('TipoNombre') || selected.get('tipo') || '',
            TipoColor: selected.get('TipoColor') || '#000000',
            Localización: selected.get('Localización') || selected.get('localización') || '',
            Celda: selected.get('Celda') || selected.get('celda') || '',
            Situación: selected.get('Situación') || selected.get('situacion') || '',
            Empresa: selected.get('Empresa') || selected.get('empresa') || '',
            Comentarios: selected.get('Comentarios') || selected.get('comentarios') || '',
            FechaCreacion: selected.get('FechaCreacion') || selected.get('fechaCreacion') || '',
            Latitud: selected.get('Latitud'),
            Longitud: selected.get('Longitud')
          };
          
          setHoveredBlockInfo(blockInfo);
          setHoveredBlockPixel(evt.pixel);
          setModo('info');
        } else {
          setHoveredBlockInfo(null);
          setHoveredBlockPixel(null);
          if (!selectedBlock) {
            setModo('');
          }
        }
      }
    };

    map.on('pointermove', onPointerMove);
    map.on('singleclick', onSingleClick);

    return () => {
      map.un('pointermove', onPointerMove);
      map.un('singleclick', onSingleClick);
    };
  }, [modo, onBlockPosition]);
}

export function usePreviewEffects(mapObj, {
  modo,
  selectedBlock,
  previewCoord,
  tallerEnPointer,
  moveBlock,
  movePreviewCoord,
  customAncho,
  customAlto,
  customRot,
  modoCreacionActivo,
  pointerCoord
}) {
  // Efecto para previsualización de creación (gris)
  useEffect(() => {
    const { previewSource } = mapObj.current;
    if (!previewSource) return;
    
    previewSource.clear();
    
    if (modoCreacionActivo && pointerCoord && tallerEnPointer) {
      const anchoEstatico = 30;
      const altoEstatico = 20;
      const rotacionAuto = calcularRotacionAutomatica(tallerEnPointer);
      
      const coords = createRectangle(
        pointerCoord,
        anchoEstatico,
        altoEstatico,
        rotacionAuto * Math.PI / 180
      );
      
      if (coords) {
        const previewFeature = new Feature({
          geometry: new Polygon(coords),
          tipo: 'preview',
          color: '#bdbdbd',
          preview: true
        });
        previewSource.addFeature(previewFeature);
      }
    }
  }, [modoCreacionActivo, pointerCoord, tallerEnPointer]);

  // Efecto para previsualización de bloque seleccionado
  useEffect(() => {
    const { previewSource } = mapObj.current;
    if (!previewSource) return;
    
    if (!modoCreacionActivo) {
      previewSource.clear();
    }
    
    if (modo === 'creacion' && selectedBlock && previewCoord && tallerEnPointer) {
      const anchoEstatico = 30;
      const altoEstatico = 20;
      const rotacionAuto = calcularRotacionAutomatica(tallerEnPointer);

      const coords = createRectangle(
        previewCoord, 
        anchoEstatico, 
        altoEstatico, 
        rotacionAuto * Math.PI / 180
      );

      if (coords) {
        const color = selectedBlock.Color || '#000000';
        const previewFeature = new Feature({ 
          geometry: new Polygon(coords),
          tipo: selectedBlock.Nombre || selectedBlock.nombre,
          color: color,
          preview: true
        });
        previewSource.addFeature(previewFeature);
      }
    }
  }, [modo, selectedBlock, previewCoord, tallerEnPointer, modoCreacionActivo]);

  // Efecto para previsualización de movimiento
  useEffect(() => {
    const { previewSource } = mapObj.current;
    if (!previewSource) return;

    if (!modoCreacionActivo) {
      previewSource.clear();
    }

    if (modo === 'mover' && moveBlock && movePreviewCoord && tallerEnPointer) {
      const ancho = moveBlock.Ancho || 30;
      const alto = moveBlock.Alto || 20;
      const rotacionAuto = calcularRotacionAutomatica(tallerEnPointer);
      
      const coords = createRectangle(
        movePreviewCoord,
        ancho,
        alto,
        rotacionAuto * Math.PI / 180
      );
      
      if (coords) {
        const color = moveBlock.TipoColor || '#000000';
        const previewFeature = new Feature({
          geometry: new Polygon(coords),
          tipo: moveBlock.TipoNombre || moveBlock.nombre,
          color: color,
          preview: true
        });
        previewSource.addFeature(previewFeature);
      }
    }
  }, [modo, moveBlock, movePreviewCoord, tallerEnPointer, modoCreacionActivo]);
}

export function useBlockEffects(mapObj, bloques) {
  useEffect(() => {
    const { source } = mapObj.current;
    if (!source) return;
    
    source.clear();
    
    if (!bloques || bloques.length === 0) {
      return;
    }
    
    bloques.forEach(bloque => {
      const coords = createRectangle(
        [bloque.Longitud, bloque.Latitud],
        bloque.Ancho,
        bloque.Alto,
        bloque.Rotacion * Math.PI / 180
      );
      if (coords) {
        const feature = new Feature({ geometry: new Polygon(coords) });
        feature.set('tipo', bloque.TipoNombre || bloque.Tipo);
        feature.set('Bloque', bloque.Bloque || '');
        feature.set('TipoNombre', bloque.TipoNombre || '');
        feature.set('TipoColor', bloque.TipoColor || '');
        feature.set('localización', bloque.Localización || '');
        feature.set('celda', bloque.Celda || '');
        feature.set('situacion', bloque.Situación || '');
        feature.set('empresa', bloque.Empresa || '');
        feature.set('comentarios', bloque.Comentarios || '');
        feature.set('fechaCreacion', bloque.FechaCreacion || '');
        feature.set('Id', bloque.Id);
        feature.set('Latitud', bloque.Latitud);
        feature.set('Longitud', bloque.Longitud);
        feature.set('preview', false);
        const color = bloque.TipoColor || '#000000';
        feature.setStyle(getBlockStyle(color, bloque.Bloque || '', false));
        source.addFeature(feature);
      }
    });
  }, [bloques]);
} 
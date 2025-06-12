/**
 * Componente principal del mapa
 * 
 * Este componente maneja:
 * - Visualización del mapa de OpenLayers
 * - Interacción con bloques (selección, edición, borrado)
 * - Gestión de capas y estilos
 * - Manejo de eventos del mapa
 * - Comunicación con el componente padre (App)
 */

import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Feature, Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import * as olSource from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { FullScreen, defaults as defaultControls } from 'ol/control.js';
import { DragRotate, defaults as defaultInteractions } from 'ol/interaction';
import { Polygon } from 'ol/geom';
import {  intersects as intersectsExtent } from 'ol/extent';
import './Mapa.css';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import { DeleteModal, EditModal } from './MapaModals';
import { useMapInitialization, useMapEvents, usePreviewEffects, useBlockEffects } from './MapaEffects';
import { bloquesPredefinidos } from './MapaUtils';

function getBlockStyle(color, text, isPreview = false) {
  return new Style({
    fill: new Fill({ color: isPreview ? color + '80' : '#ffffff00' }), // Fondo transparente o semitransparente para preview
    stroke: new Stroke({ color, width: 4 }),
    text: isPreview ? null : new Text({ // Solo mostrar texto para bloques reales, no para previsualizaciones
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

function createRectangle(center, ancho, alto, rotation = 0) {
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
 * Componente Mapa
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.bloques - Lista de bloques a mostrar
 * @param {Array} props.tiposBloque - Tipos de bloque disponibles
 * @param {Function} props.onBlockPosition - Callback para actualizar posición de bloques
 * @param {Function} props.onDeleteBlock - Callback para borrar bloques
 * @param {Function} props.onEditBlock - Callback para editar bloques
 * @param {boolean} props.modoCreacionActivo - Indica si está activo el modo de creación
 * @param {Function} props.setModoCreacionActivo - Función para actualizar el estado de modoCreacionActivo
 * @param {Object} props.selectedBlock - Bloque seleccionado actualmente
 * @param {Function} props.fetchBloques - Función para actualizar la lista de bloques
 */
export default function Mapa({ 
  bloques, 
  tiposBloque, 
  onBlockPosition, 
  onDeleteBlock, 
  onEditBlock,
  modoCreacionActivo,
  setModoCreacionActivo,
  selectedBlock,
  fetchBloques
}) {
  const mapRef = useRef(null);
  const [customAncho, setCustomAncho] = useState(30);
  const [customAlto, setCustomAlto] = useState(30);
  const [customRot, setCustomRot] = useState(0);
  const [pointerCoord, setPointerCoord] = useState(null);
  const [tallerEnPointer, setTallerEnPointer] = useState(null);
  const [hoveredBlockInfo, setHoveredBlockInfo] = useState(null);
  const [hoveredBlockPixel, setHoveredBlockPixel] = useState(null);
  const mapObj = useRef({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [moveMode, setMoveMode] = useState(false);
  const [modo, setModo] = useState('creacion');
  const [moveBlock, setMoveBlock] = useState(null);
  const [moveMenu, setMoveMenu] = useState(null);
  const [movePreviewCoord, setMovePreviewCoord] = useState(null);
  const [previewCoord, setPreviewCoord] = useState(null);
  const [bloquesLocales, setBloquesLocales] = useState([]);
  const [tipoBloqueEditError, setTipoBloqueEditError] = useState('');

  // Inicialización del mapa
  useMapInitialization(mapRef, mapObj);

  // Eventos del mapa
  useMapEvents(mapObj, {
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
  });

  // Efectos de previsualización
  usePreviewEffects(mapObj, {
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
  });

  // Efectos de bloques
  useBlockEffects(mapObj, bloques);

  // Efecto para sincronizar bloquesLocales
  useEffect(() => {
    setBloquesLocales(prev => {
      const reales = bloques.map(b => `${b.Latitud}|${b.Longitud}|${b.Tipo}`);
      return prev.filter(b => !b.optimista || !reales.includes(`${b.Latitud}|${b.Longitud}|${b.Tipo}`)).concat(bloques);
    });
  }, [bloques]);

  // Efecto para manejar cambios de modo
  useEffect(() => {
    if (moveMode) setModo('mover');
  }, [moveMode]);

  // Efecto para manejar la selección de bloque
  useEffect(() => {
    if (selectedBlock) {
      setModo('creacion');
      setHoveredBlockInfo(null);
      setHoveredBlockPixel(null);
    }
  }, [selectedBlock]);

  // Efecto para limpiar estados cuando cambian los bloques
  useEffect(() => {
    if (!selectedBlock) {
      setHoveredBlockInfo(null);
      setHoveredBlockPixel(null);
      setPreviewCoord(null);
      setMoveBlock(null);
      setMoveMenu(null);
      setMovePreviewCoord(null);
      if (mapObj.current?.previewSource) {
        mapObj.current.previewSource.clear();
      }
    }
  }, [bloques, selectedBlock]);

  // Funciones para mover bloques
  const handleStartMove = (blockInfo) => {
    const bloqueCompleto = bloques.find(b => b.Id === blockInfo.Id);
    if (!bloqueCompleto) return;
    
    setMoveBlock({
      ...bloqueCompleto,
      Bloque: blockInfo.Bloque,
      TipoNombre: bloqueCompleto.TipoNombre,
      TipoColor: bloqueCompleto.TipoColor,
      TipoBloqueId: bloqueCompleto.TipoBloqueId,
      Localización: blockInfo.Localización,
      Celda: blockInfo.Celda,
      Situación: blockInfo.Situación,
      Empresa: blockInfo.Empresa,
      Comentarios: blockInfo.Comentarios
    });
    setCustomAncho(bloqueCompleto.Ancho || 30);
    setCustomAlto(bloqueCompleto.Alto || 20);
    setCustomRot(bloqueCompleto.Rotacion || 0);
    setModo('mover');
    setHoveredBlockInfo(null);
    setHoveredBlockPixel(null);
  };

  const handleDeleteBlock = async () => {
    if (!blockToDelete?.Id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bloques/${blockToDelete.Id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Error al borrar el bloque');
      }
      setBlockToDelete(null);
      setModo(selectedBlock ? 'creacion' : '');
      if (fetchBloques) fetchBloques();
    } catch (error) {
      alert('Error al borrar el bloque: ' + error.message);
    }
  };

  const handleEditBlock = (blockInfo) => {
    let tipoBloqueId = '';
    if (blockInfo.TipoBloqueId) {
      tipoBloqueId = blockInfo.TipoBloqueId;
    } else if (blockInfo.TipoNombre && tiposBloque.length > 0) {
      const tipo = tiposBloque.find(t => t.Nombre === blockInfo.TipoNombre);
      tipoBloqueId = tipo ? tipo.Id : '';
    }
    setEditData({
      Id: blockInfo.Id,
      Bloque: blockInfo.Bloque,
      Localización: blockInfo.Localización,
      Celda: blockInfo.Celda,
      Situación: blockInfo.Situación,
      Empresa: blockInfo.Empresa,
      Comentarios: blockInfo.Comentarios,
      Latitud: blockInfo.Latitud,
      Longitud: blockInfo.Longitud,
      TipoBloqueId: tipoBloqueId
    });
    setModo('edicion');
  };

  const handleSaveEdit = async () => {
    if (!editData?.Id) return;
    if (!editData.TipoBloqueId) {
      setTipoBloqueEditError('Debes seleccionar un tipo de bloque');
      return;
    }
    setTipoBloqueEditError('');
    try {
      const bloqueOriginal = bloques.find(b => b.Id === editData.Id);
      if (!bloqueOriginal) {
        throw new Error('No se encontró el bloque original');
      }
      const tipoSeleccionado = tiposBloque.find(t => String(t.Id) === String(editData.TipoBloqueId));
      const bloqueActualizado = {
        ...bloqueOriginal,
        Bloque: editData.Bloque,
        Localización: editData.Localización,
        Celda: editData.Celda,
        Situación: editData.Situación,
        Empresa: editData.Empresa,
        Comentarios: editData.Comentarios,
        Latitud: bloqueOriginal.Latitud,
        Longitud: bloqueOriginal.Longitud,
        Ancho: bloqueOriginal.Ancho,
        Alto: bloqueOriginal.Alto,
        Rotacion: bloqueOriginal.Rotacion,
        TipoBloqueId: editData.TipoBloqueId,
        TipoColor: tipoSeleccionado ? tipoSeleccionado.Color : bloqueOriginal.TipoColor,
        FechaCreacion: bloqueOriginal.FechaCreacion
      };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bloques/${editData.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bloqueActualizado)
      });
      if (!response.ok) {
        throw new Error('Error al actualizar el bloque');
      }
      setEditData(null);
      setModo(selectedBlock ? 'creacion' : '');
      if (fetchBloques) fetchBloques();
    } catch (error) {
      alert('Error al actualizar el bloque: ' + error.message);
    }
  };

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 16px',
        background: '#f8f9fa',
        borderBottom: 'none'
      }}>
      </div>
      
      <div id="map" ref={mapRef} style={{ width: '100%', height: '90vh', position: 'relative' }} />

      {/* Popup de información al hacer click sobre un bloque */}
      {modo === 'info' && hoveredBlockInfo && hoveredBlockPixel && (
        <div
          className="ol-popup-block-info"
          style={{
            position: 'absolute',
            left: hoveredBlockPixel[0] + 20,
            top: hoveredBlockPixel[1] + 20,
            background: 'white',
            border: '2px solid #0d6efd',
            borderRadius: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            padding: 18,
            zIndex: 9999,
            minWidth: 260,
            maxWidth: 350
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{fontWeight: 'bold', fontSize: 18, color: '#0d6efd'}}>Información del bloque</span>
            <button
              style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}
              onClick={() => {
                setHoveredBlockInfo(null);
                setHoveredBlockPixel(null);
                setModo(selectedBlock ? 'creacion' : '');
              }}
              title="Cerrar"
            >
              &times;
            </button>
          </div>
          <div><b>Bloque:</b> {hoveredBlockInfo.Bloque || '-'}</div>
          <div><b>Tipo:</b> {hoveredBlockInfo.TipoNombre || '-'}</div>
          <div><b>Localización:</b> {hoveredBlockInfo.Localización || '-'}</div>
          <div><b>Celda:</b> {hoveredBlockInfo.Celda || '-'}</div>
          <div><b>Situación:</b> {hoveredBlockInfo.Situación || '-'}</div>
          <div><b>Empresa:</b> {hoveredBlockInfo.Empresa || '-'}</div>
          <div><b>Comentarios:</b> {hoveredBlockInfo.Comentarios || '-'}</div>
          <div><b>Fecha de creación:</b> {hoveredBlockInfo.FechaCreacion ? hoveredBlockInfo.FechaCreacion.split('T')[0] : '-'}</div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="danger" size="sm" onClick={() => {
              setBlockToDelete(hoveredBlockInfo);
              setModo('borrado');
            }}>
              Borrar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleStartMove(hoveredBlockInfo)}>
              Mover
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleEditBlock(hoveredBlockInfo)}>
              Editar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para borrar */}
      <DeleteModal 
        show={modo === 'borrado'} 
        onHide={() => {
          setBlockToDelete(null);
          setModo(selectedBlock ? 'creacion' : '');
        }}
        onDelete={handleDeleteBlock}
      />

      {/* Modal de edición de bloque */}
      <EditModal 
        show={modo === 'edicion'} 
        onHide={() => {
          setEditData(null);
          setModo(selectedBlock ? 'creacion' : '');
        }}
        editData={editData}
        setEditData={setEditData}
        tiposBloque={tiposBloque}
        tipoBloqueEditError={tipoBloqueEditError}
        onSave={handleSaveEdit}
      />
    </>
  );
}

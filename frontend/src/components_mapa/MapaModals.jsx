/**
 * Componentes modales para el mapa
 * 
 * Este archivo contiene:
 * - Modal de confirmación para borrar bloques
 * - Modal de edición de bloques
 * Ambos modales son utilizados en la interacción con el mapa
 */

import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';

/**
 * Modal de confirmación para borrar un bloque
 * Muestra un mensaje de confirmación antes de proceder con el borrado
 */
export function DeleteModal({ show, onHide, onDelete }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar borrado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Seguro que quieres borrar este bloque?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Borrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * Modal de edición de bloques
 * Permite modificar todas las propiedades de un bloque existente
 * Incluye:
 * - Nombre del bloque
 * - Tipo de bloque (con selector visual)
 * - Localización y celda
 * - Situación y empresa
 * - Comentarios
 */
export function EditModal({ 
  show, 
  onHide, 
  editData, 
  setEditData, 
  tiposBloque, 
  tipoBloqueEditError, 
  onSave 
}) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Editar bloque</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editData && (
          <Form>
            {/* Campo de nombre del bloque */}
            <Form.Group controlId="editBloque">
              <Form.Label>Bloque</Form.Label>
              <Form.Control 
                type="text" 
                value={editData.Bloque} 
                onChange={e => setEditData({ ...editData, Bloque: e.target.value })} 
              />
            </Form.Group>

            {/* Selector de tipo de bloque con previsualización de color */}
            <Form.Group>
              <Form.Label>Tipo de bloque</Form.Label>
              <Select
                classNamePrefix="react-select"
                value={tiposBloque.find(t => String(t.Id) === String(editData.TipoBloqueId)) || null}
                onChange={option => setEditData({ ...editData, TipoBloqueId: option ? option.Id : '', TipoColor: option ? option.Color : '' })}
                options={tiposBloque}
                getOptionLabel={option => option?.Nombre || 'Sin nombre'}
                getOptionValue={option => option.Id.toString()}
                placeholder="Selecciona un tipo de bloque"
                formatOptionLabel={option => (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-block',
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: option.Color,
                      border: '1px solid #bbb'
                    }} />
                    {option.Nombre}
                  </span>
                )}
              />
              {tipoBloqueEditError && <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>{tipoBloqueEditError}</div>}
            </Form.Group>

            {/* Campos de localización y celda */}
            <Form.Group controlId="editLocalizacion">
              <Form.Label>Localización</Form.Label>
              <Form.Control 
                type="text" 
                value={editData.Localización} 
                onChange={e => setEditData({ ...editData, Localización: e.target.value })} 
              />
            </Form.Group>
            <Form.Group controlId="editCelda">
              <Form.Label>Celda</Form.Label>
              <Form.Control 
                type="text" 
                value={editData.Celda} 
                onChange={e => setEditData({ ...editData, Celda: e.target.value })} 
              />
            </Form.Group>

            {/* Campos de situación y empresa */}
            <Form.Group controlId="editSituacion">
              <Form.Label>Situación</Form.Label>
              <Form.Control 
                type="text" 
                value={editData.Situación} 
                onChange={e => setEditData({ ...editData, Situación: e.target.value })} 
              />
            </Form.Group>
            <Form.Group controlId="editEmpresa">
              <Form.Label>Empresa</Form.Label>
              <Form.Control 
                type="text" 
                value={editData.Empresa} 
                onChange={e => setEditData({ ...editData, Empresa: e.target.value })} 
              />
            </Form.Group>

            {/* Campo de comentarios */}
            <Form.Group controlId="editComentarios">
              <Form.Label>Comentarios</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                value={editData.Comentarios} 
                onChange={e => setEditData({ ...editData, Comentarios: e.target.value })} 
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSave}>
          Guardar cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 
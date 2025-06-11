/**
 * Componente que contiene todos los modales de la aplicación
 * 
 * Este componente maneja:
 * - Modal de información del bloque
 * - Modal de gestión de tipos de bloque
 * - Modal de eliminación de tipos de bloque
 * - Modal de instrucciones iniciales
 * - Modal de instrucciones de configuración
 */

import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import Select from 'react-select';

function AppModals({
  showModal,
  setShowModal,
  bloqueData,
  setBloqueData,
  tiposBloque,
  tipoBloqueError,
  handleSubmit,
  showConfig,
  setShowConfig,
  nuevoTipo,
  setNuevoTipo,
  handleAddTipo,
  showDeleteTipoModal,
  setShowDeleteTipoModal,
  handleDeleteTipo,
  showInstruccionesModal,
  setShowInstruccionesModal,
  noMostrarInstrucciones,
  setNoMostrarInstrucciones,
  handleCerrarInstrucciones,
  showInstruccionesConfig,
  setShowInstruccionesConfig
}) {
  return (
    <>
      {/* Modal de información del bloque */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Información del Bloque</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Campos del formulario de bloque */}
            <Form.Group controlId="formBloque">
              <Form.Label>Nombre del Bloque</Form.Label>
              <Form.Control 
                type="text" 
                value={bloqueData.Bloque} 
                onChange={(e) => setBloqueData({ ...bloqueData, Bloque: e.target.value })}
                placeholder="B-"
              />
            </Form.Group>

            {/* Selector de tipo de bloque */}
            <Form.Group>
              <Form.Label>Tipo de bloque</Form.Label>
              <Select
                classNamePrefix="react-select"
                value={tiposBloque.find(t => String(t.Id) === String(bloqueData.TipoBloqueId)) || null}
                onChange={option => setBloqueData({ ...bloqueData, TipoBloqueId: option ? option.Id : '', TipoColor: option ? option.Color : '' })}
                options={tiposBloque}
                getOptionLabel={option => (
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
                getOptionValue={option => option.Id.toString()}
                placeholder="Selecciona un tipo de bloque"
              />
              {tipoBloqueError && <div style={{ color: 'red', fontSize: 13, marginTop: 4 }}>{tipoBloqueError}</div>}
            </Form.Group>

            {/* Resto de campos del formulario */}
            <Form.Group controlId="formLocalizacion">
              <Form.Label>Localización</Form.Label>
              <Form.Control 
                type="text" 
                value={bloqueData.Localización} 
                onChange={(e) => setBloqueData({ ...bloqueData, Localización: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCelda">
              <Form.Label>Celda</Form.Label>
              <Form.Control 
                type="text" 
                value={bloqueData.Celda} 
                onChange={(e) => setBloqueData({ ...bloqueData, Celda: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formSituacion">
              <Form.Label>Situación</Form.Label>
              <Form.Control type="text" value={bloqueData.Situación} onChange={(e) => setBloqueData({ ...bloqueData, Situación: e.target.value })} />
            </Form.Group>
            <Form.Group controlId="formEmpresa">
              <Form.Label>Empresa</Form.Label>
              <Form.Control type="text" value={bloqueData.Empresa} onChange={(e) => setBloqueData({ ...bloqueData, Empresa: e.target.value })} />
            </Form.Group>
            <Form.Group controlId="formComentarios">
              <Form.Label>Comentarios</Form.Label>
              <Form.Control as="textarea" rows={3} value={bloqueData.Comentarios} onChange={(e) => setBloqueData({ ...bloqueData, Comentarios: e.target.value })} />
            </Form.Group>
            <Form.Group controlId="formFechaCreacion">
              <Form.Label>Fecha de Creación</Form.Label>
              <Form.Control 
                type="date" 
                value={bloqueData.FechaCreacion} 
                onChange={(e) => setBloqueData({ ...bloqueData, FechaCreacion: e.target.value })}
                disabled
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Añadir bloque</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de gestión de tipos de bloque */}
      <Modal show={showConfig} onHide={() => setShowConfig(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Gestión de tipos de bloque</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddTipo}>
            <Form.Group className="mb-3" controlId="nuevoTipoNombre">
              <Form.Label>Nombre del tipo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Introduce el nombre"
                value={nuevoTipo.nombre}
                onChange={e => setNuevoTipo({ ...nuevoTipo, nombre: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="nuevoTipoColor">
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="color"
                value={nuevoTipo.color}
                onChange={e => setNuevoTipo({ ...nuevoTipo, color: e.target.value })}
                style={{ width: 50, height: 36, padding: 0, border: 'none', background: 'none' }}
              />
            </Form.Group>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="secondary" onClick={() => setShowConfig(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Añadir tipo
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de eliminación de tipos de bloque */}
      <Modal show={showDeleteTipoModal} onHide={() => setShowDeleteTipoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar tipo de bloque</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tiposBloque.length === 0 ? (
            <div>No hay tipos de bloque disponibles.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 350, overflowY: 'auto' }}>
              {tiposBloque.map(tipo => (
                <li key={tipo.Id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-block',
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: tipo.Color,
                      border: '1px solid #bbb'
                    }} />
                    {tipo.Nombre}
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => {
                      if (window.confirm(`¿Seguro que quieres eliminar el tipo de bloque "${tipo.Nombre}"?`)) {
                        handleDeleteTipo(tipo.Id);
                      }
                    }}
                  >
                    🗑️ Borrar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteTipoModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de instrucciones iniciales */}
      <Modal show={showInstruccionesModal} onHide={() => setShowInstruccionesModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bienvenido a la aplicación de bloques</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: 16 }}>
            <p>Para añadir un bloque, sigue estos pasos:</p>
            <ol style={{ paddingLeft: 20 }}>
              <li>Haz clic en el botón "Añadir bloque" en la esquina superior derecha</li>
              <li>Pasa el ratón sobre un taller para ver la previsualización del bloque</li>
              <li>Haz clic izquierdo para colocar el bloque sobre el taller</li>
              <li>Rellene el formulario o cancele la acción si lo coloca en una posición incorrecta</li>
              <li>Puedes ver las siguientes instrucciones en cualquier momento desde el botón de configuración</li>
            </ol>
          </div>
          <Form.Check
            type="checkbox"
            label="No mostrar este mensaje de nuevo"
            checked={noMostrarInstrucciones}
            onChange={(e) => setNoMostrarInstrucciones(e.target.checked)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCerrarInstrucciones}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de instrucciones de configuración */}
      <Modal show={showInstruccionesConfig} onHide={() => setShowInstruccionesConfig(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>¿Cómo añadir un bloque?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: 16 }}>
            <p>Para añadir un bloque, sigue estos pasos:</p>
            <ol style={{ paddingLeft: 20 }}>
              <li>Haz clic en el botón "Añadir bloque" en la esquina superior derecha</li>
              <li>Pasa el ratón sobre un taller para ver la previsualización del bloque</li>
              <li>Haz clic izquierdo para colocar el bloque sobre el taller</li>
              <li>Rellene el formulario o cancele la acción si lo coloca en una posición incorrecta</li>
            </ol>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowInstruccionesConfig(false)}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AppModals; 
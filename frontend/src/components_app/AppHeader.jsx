/**
 * Componente de cabecera de la aplicación
 * 
 * Este componente maneja:
 * - El filtrado por fechas de los bloques
 * - El botón de actualización de datos
 * - El botón de añadir nuevo bloque
 * - El menú de configuración con opciones para gestionar tipos de bloque
 */

import React from 'react';
import { Row, Col, Form, Button, Dropdown } from 'react-bootstrap';

function AppHeader({ 
  fechaInicio, 
  setFechaInicio, 
  fechaFin, 
  setFechaFin, 
  setError, 
  fetchBloques, 
  handleAñadirBloque,
  showDropdown,
  setShowDropdown,
  setShowConfig,
  setShowDeleteTipoModal,
  setShowInstruccionesConfig
}) {
  return (
    <Row className="barra-superior" style={{ flexWrap: 'nowrap', gap: 12 }}>
      {/* Selector de fecha de inicio */}
      <Col md="auto" style={{ minWidth: 180 }}>
        <Form.Group>
          <Form.Label>Fecha Inicio</Form.Label>
          <Form.Control
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              setError(null);
            }}
          />
        </Form.Group>
      </Col>

      {/* Selector de fecha de fin */}
      <Col md="auto" style={{ minWidth: 180 }}>
        <Form.Group>
          <Form.Label>Fecha Fin</Form.Label>
          <Form.Control
            type="date"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value);
              setError(null);
            }}
          />
        </Form.Group>
      </Col>

      {/* Botón de actualización */}
      <Col md="auto" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <Button 
          variant="primary" 
          onClick={() => {
            if (!fechaInicio || !fechaFin) {
              setError('Por favor, selecciona ambas fechas');
              return;
            }
            setError(null);
            fetchBloques();
          }}
          disabled={!fechaInicio || !fechaFin}
        >
          Actualizar
        </Button>
      </Col>

      {/* Botón de añadir bloque */}
      <Col md="auto" style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
        <Button
          variant="success"
          style={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: 16,
            lineHeight: 1,
            paddingTop: 0,
            paddingBottom: 0,
            height: 40
          }}
          onClick={handleAñadirBloque}
        >
          Añadir bloque
        </Button>
      </Col>

      {/* Menú de configuración */}
      <Col style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', paddingRight: 24 }}>
        <Dropdown show={showDropdown} onToggle={setShowDropdown} align="end">
          <Dropdown.Toggle
            as={Button}
            variant="outline-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, width: 36, padding: 0, marginLeft: 0 }}
            title="Configuración de tipos de bloque"
            onClick={() => setShowDropdown(!showDropdown)}
            className="dropdown-toggle-sin-caret"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
            </svg>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {/* Opciones del menú de configuración */}
            <Dropdown.Item onClick={() => { setShowConfig(true); setShowDropdown(false); }}>
              Añadir tipo de bloque
            </Dropdown.Item>
            <Dropdown.Item onClick={() => { setShowDeleteTipoModal(true); setShowDropdown(false); }}>
              Eliminar tipo de bloque
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => { setShowInstruccionesConfig(true); setShowDropdown(false); }}>
              ¿Cómo añadir un bloque?
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Col>
    </Row>
  );
}

export default AppHeader; 
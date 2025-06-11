/**
 * Componente principal de la aplicación de gestión de bloques
 * 
 * Este componente maneja:
 * - La gestión del estado global de la aplicación
 * - La comunicación con el backend para operaciones CRUD de bloques y tipos
 * - La lógica de filtrado por fechas
 * - La gestión de modales y estados de la interfaz
 */

import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import Mapa from '../components_mapa/Mapa';
import AppHeader from './AppHeader';
import AppModals from './AppModals';
import './App.css';

function App() {
  // Estados para la gestión de modales y errores
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [bloques, setBloques] = useState([]);
  const [showInstruccionesModal, setShowInstruccionesModal] = useState(false);
  const [showInstruccionesConfig, setShowInstruccionesConfig] = useState(false);
  const [noMostrarInstrucciones, setNoMostrarInstrucciones] = useState(() => {
    return sessionStorage.getItem('noMostrarInstrucciones') === 'true';
  });
  
  // Estados para el filtrado por fechas (por defecto última semana)
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  // Estado para los datos del bloque que se está creando/editando
  const [bloqueData, setBloqueData] = useState({
    Bloque: '', 
    Localización: '', 
    Celda: '', 
    Situación: '', 
    Empresa: '', 
    Comentarios: '', 
    Latitud: 0, 
    Longitud: 0,
    Ancho: 0,
    Alto: 0,
    Rotacion: 0,
    Tipo: '',
    FechaCreacion: new Date().toISOString().split('T')[0]
  });

  // Estados para la gestión de tipos de bloque
  const [tiposBloque, setTiposBloque] = useState([]);
  const [nuevoTipo, setNuevoTipo] = useState({ nombre: '', color: '#000000' });
  const [selectedTipoId, setSelectedTipoId] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Estados para el modo de operación y menús contextuales
  const [modo, setModo] = useState('creacion');
  const [menuContext, setMenuContext] = useState(null);
  const [moveBlock, setMoveBlock] = useState(null);
  const [moveMenu, setMoveMenu] = useState(null);

  // Estados para la configuración y modales
  const [showConfig, setShowConfig] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteTipoModal, setShowDeleteTipoModal] = useState(false);

  // Estado para el modo de creación de bloques
  const [modoCreacionActivo, setModoCreacionActivo] = useState(false);

  // Estado para errores de tipo de bloque
  const [tipoBloqueError, setTipoBloqueError] = useState('');

  /**
   * Función para obtener los bloques del backend
   * Filtra los bloques por el rango de fechas seleccionado
   */
  const fetchBloques = async () => {
    try {
      setError(null);
      // Limpiar bloques antes de hacer la petición
      setBloques([]);
      
      let url = `${import.meta.env.VITE_API_URL}/api/bloques`;
      
      // Asegurarse de que las fechas estén en el formato correcto
      const fechaInicioFormateada = fechaInicio ? new Date(fechaInicio + 'T00:00:00').toISOString().split('T')[0] : null;
      const fechaFinFormateada = fechaFin ? new Date(fechaFin + 'T23:59:59.999').toISOString().split('T')[0] : null;
      
      if (fechaInicioFormateada && fechaFinFormateada) {
        url += `?fechaInicio=${fechaInicioFormateada}&fechaFin=${fechaFinFormateada}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verificar que los bloques estén dentro del rango de fechas
      const bloquesFiltrados = data.filter(bloque => {
        const fechaCreacion = new Date(bloque.FechaCreacion).toISOString().split('T')[0];
        return fechaCreacion >= fechaInicioFormateada && fechaCreacion <= fechaFinFormateada;
      });
      
      // Si no hay bloques en el rango de fechas, mostrar mensaje y asegurar que no hay bloques
      if (bloquesFiltrados.length === 0) {
        setError(`No hay bloques en el rango de fechas seleccionado (${fechaInicio} a ${fechaFin})`);
        setBloques([]); // Asegurar que el array de bloques esté vacío
        return;
      }
      
      setBloques(bloquesFiltrados);
    } catch (error) {
      console.error('Error al cargar bloques:', error);
      setError(error.message);
      setBloques([]); // Asegurar que el array de bloques esté vacío en caso de error
    }
  };

  /**
   * Función para obtener los tipos de bloque del backend
   */
  const fetchTiposBloque = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tipos-bloque`);
      const data = await res.json();
      setTiposBloque(Array.isArray(data) ? data : []);
    } catch (err) {
      setTiposBloque([]);
    }
  };

  /**
   * Efecto inicial que carga los bloques y tipos al montar el componente
   * También muestra las instrucciones si es la primera vez
   */
  useEffect(() => {
    fetchBloques();
    fetchTiposBloque();
    
    // Mostrar instrucciones si es la primera vez
    if (!noMostrarInstrucciones) {
      setShowInstruccionesModal(true);
    }
  }, []); // Solo se ejecuta una vez al montar el componente

  /**
   * Función para manejar la creación de un nuevo bloque
   * Valida los datos y envía la petición al backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bloqueData.TipoBloqueId) {
      setTipoBloqueError('Debes seleccionar un tipo de bloque');
      return;
    }
    setTipoBloqueError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bloques`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bloqueData,
          Color: bloqueData.Color || bloqueData.color,
          Rotacion: bloqueData.Rotacion || bloqueData.rotacion || 0
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el bloque');
      }

      const data = await response.json();
      console.log('Bloque creado:', data);
      setShowModal(false);
      // Limpiar la selección del tipo de bloque
      setSelectedTipoId('');
      setSelectedBlock(null);
      setModo('');
      fetchBloques();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el bloque. Por favor, asegúrate de que el servidor backend está corriendo.');
    }
  };

  /**
   * Función para añadir un nuevo tipo de bloque
   * Crea el tipo en el backend y actualiza la lista
   */
  const handleAddTipo = async (e) => {
    e.preventDefault();
    if (!nuevoTipo.nombre.trim()) return;
    let nuevoId = null;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tipos-bloque`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Nombre: nuevoTipo.nombre, Color: nuevoTipo.color })
    });
      const data = await res.json();
      // Si el backend devuelve el tipo creado, usar su Id
      nuevoId = data?.Id;
    } catch (err) {
      // fallback: refrescar lista aunque no tengamos el id
    }
    setNuevoTipo({ nombre: '', color: '#000000' });
    // Refrescar lista y seleccionar el nuevo tipo automáticamente
    fetchTiposBloque().then(() => {
      setShowConfig(false);
      setTimeout(() => {
        // Buscar el tipo recién creado (por nombre y color, o por id si lo tenemos)
        let tipoRecienCreado = null;
        if (nuevoId) {
          tipoRecienCreado = tiposBloque.find(t => String(t.Id) === String(nuevoId));
        }
        if (!tipoRecienCreado) {
          tipoRecienCreado = tiposBloque.find(t => t.Nombre === nuevoTipo.nombre && t.Color === nuevoTipo.color);
        }
        if (tipoRecienCreado) {
          setSelectedTipoId(tipoRecienCreado.Id);
          setBloqueData(prev => ({
            ...prev,
            TipoBloqueId: tipoRecienCreado.Id,
            Color: tipoRecienCreado.Color
          }));
        }
      }, 200);
    });
  };

  /**
   * Función para eliminar un tipo de bloque
   * Verifica que no esté en uso antes de eliminarlo
   */
  const handleDeleteTipo = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tipos-bloque/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        let msg = 'No se pudo borrar el tipo de bloque.';
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {}
        if (msg.includes('REFERENCE constraint')) {
          alert('No se puede borrar este tipo de bloque porque está en uso por algún bloque.');
        } else {
        alert(msg + ' Puede que esté en uso por algún bloque.');
        }
        return;
      }
      await fetchTiposBloque(); // Usar la función que ya está definida
    } catch (err) {
      alert('Error de red al borrar el tipo de bloque: ' + err.message);
    }
  };

  /**
   * Función para manejar la posición de un bloque en el mapa
   * Se llama cuando se coloca un bloque en el mapa
   */
  const handleBlockPosition = (coord, tipo, taller, dims) => {
    console.log('[handleBlockPosition] FUNCIÓN LLAMADA', { coord, tipo, taller, dims });
    // Crear el objeto de datos del bloque
    const bloqueData = {
      nombre: tipo,
      posicion: {
        x: coord[0],
        y: coord[1]
      },
      dimensiones: {
        ancho: dims.ancho,
        alto: dims.alto,
        rotacion: dims.rotacion
      },
      taller: taller.localización,
      celda: taller.celda,
      tipoBloqueId: dims.tipoBloqueId,
      color: dims.tipoColor
    };
    console.log('[handleBlockPosition] Datos del bloque a crear:', bloqueData);
    
    // Seleccionar el primer tipo de bloque por defecto si hay tipos disponibles
    const primerTipo = tiposBloque.length > 0 ? tiposBloque[0] : null;

    setBloqueData({
      Bloque: 'B-', 
      Localización: taller.localización || '', 
      Celda: taller.celda || '', 
      Situación: '', 
      Empresa: '', 
      Comentarios: '', 
      Latitud: coord[1], 
      Longitud: coord[0],
      Ancho: dims.ancho || 30,
      Alto: dims.alto || 20,
      Rotacion: dims.rotacion || 0,
      Tipo: tipo,
      TipoBloqueId: primerTipo ? primerTipo.Id : null,
      Color: primerTipo ? primerTipo.Color : '#000000',
      FechaCreacion: new Date().toISOString().split('T')[0]
    });
    console.log('[handleBlockPosition] ANTES DE setShowModal(true)');
    setShowModal(true);
    console.log('[handleBlockPosition] DESPUÉS DE setShowModal(true)');
  };

  const handleAñadirBloque = () => {
    setModoCreacionActivo(true);
  };

  const handleCerrarInstrucciones = () => {
    setShowInstruccionesModal(false);
    if (noMostrarInstrucciones) {
      sessionStorage.setItem('noMostrarInstrucciones', 'true');
    }
  };

  return (
    <Container fluid className="p-0">
      {error && (
        <div className="alert alert-danger m-3" role="alert">
          {error}
        </div>
      )}
      
      <AppHeader 
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        setError={setError}
        fetchBloques={fetchBloques}
        handleAñadirBloque={handleAñadirBloque}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        setShowConfig={setShowConfig}
        setShowDeleteTipoModal={setShowDeleteTipoModal}
        setShowInstruccionesConfig={setShowInstruccionesConfig}
      />

      <Mapa 
        onBlockPosition={handleBlockPosition} 
        bloques={bloques}
        fetchBloques={fetchBloques}
        tiposBloque={tiposBloque}
        setTiposBloque={setTiposBloque}
        nuevoTipo={nuevoTipo}
        setNuevoTipo={setNuevoTipo}
        selectedTipoId={selectedTipoId}
        setSelectedTipoId={setSelectedTipoId}
        handleAddTipo={handleAddTipo}
        handleDeleteTipo={handleDeleteTipo}
        setSelectedBlock={setSelectedBlock}
        key={`mapa-${fechaInicio}-${fechaFin}`}
        selectedBlock={selectedBlock}
        modo={modo}
        setModo={setModo}
        menuContext={menuContext}
        setMenuContext={setMenuContext}
        moveBlock={moveBlock}
        setMoveBlock={setMoveBlock}
        moveMenu={moveMenu}
        setMoveMenu={setMoveMenu}
        modoCreacionActivo={modoCreacionActivo}
        setModoCreacionActivo={setModoCreacionActivo}
      />

      <AppModals 
        showModal={showModal}
        setShowModal={setShowModal}
        bloqueData={bloqueData}
        setBloqueData={setBloqueData}
        tiposBloque={tiposBloque}
        tipoBloqueError={tipoBloqueError}
        handleSubmit={handleSubmit}
        showConfig={showConfig}
        setShowConfig={setShowConfig}
        nuevoTipo={nuevoTipo}
        setNuevoTipo={setNuevoTipo}
        handleAddTipo={handleAddTipo}
        showDeleteTipoModal={showDeleteTipoModal}
        setShowDeleteTipoModal={setShowDeleteTipoModal}
        handleDeleteTipo={handleDeleteTipo}
        showInstruccionesModal={showInstruccionesModal}
        setShowInstruccionesModal={setShowInstruccionesModal}
        noMostrarInstrucciones={noMostrarInstrucciones}
        setNoMostrarInstrucciones={setNoMostrarInstrucciones}
        handleCerrarInstrucciones={handleCerrarInstrucciones}
        showInstruccionesConfig={showInstruccionesConfig}
        setShowInstruccionesConfig={setShowInstruccionesConfig}
      />
    </Container>
  );
}

export default App;

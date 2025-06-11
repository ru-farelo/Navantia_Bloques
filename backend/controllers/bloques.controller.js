/**
 * Controlador para la gestión de bloques
 * 
 * Este controlador maneja:
 * - Obtención de bloques con filtrado por fechas
 * - Creación de nuevos bloques
 * - Eliminación de bloques existentes
 * - Actualización de bloques
 * 
 * Cada bloque contiene información sobre su ubicación, tipo, dimensiones
 * y propiedades adicionales como localización, celda, situación, etc.
 */

import { sql, config } from '../config/db.js';

/**
 * Obtiene los bloques filtrados por rango de fechas
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @returns {Array} Lista de bloques con su información asociada
 */
export async function getBloques(req, res) {
  let pool;
  try {
    // Verificar conexión
    pool = await sql.connect(config);

    // Verificar si la tabla existe
    const checkTableQuery = `
      SELECT CASE 
        WHEN EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Bloques')
        THEN 1
        ELSE 0
      END AS [existe]
    `;
    const tableExists = await pool.request().query(checkTableQuery);
    
    if (tableExists.recordset[0].existe === 0) {
      throw new Error('La tabla Bloques no existe en la base de datos');
    }

    // Verificar si la columna FechaCreacion existe
    const checkColumnQuery = `
      SELECT CASE 
        WHEN EXISTS (
          SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'Bloques' AND COLUMN_NAME = 'FechaCreacion'
        )
        THEN 1
        ELSE 0
      END AS [existe]
    `;
    const columnExists = await pool.request().query(checkColumnQuery);
    
    if (columnExists.recordset[0].existe === 0) {
      throw new Error('La columna FechaCreacion no existe en la tabla Bloques');
    }

    // Construir y ejecutar la consulta principal
    let query = `
      SELECT B.*, T.Nombre AS TipoNombre, T.Color AS TipoColor
      FROM Bloques B
      LEFT JOIN Tipo_Bloques T ON B.TipoBloqueId = T.Id
      WHERE CAST(B.FechaCreacion AS DATE) >= CAST(@fechaInicio AS DATE)
      AND CAST(B.FechaCreacion AS DATE) <= CAST(@fechaFin AS DATE)
      ORDER BY B.FechaCreacion DESC
    `;
    
    const request = pool.request();
    
    // Establecer fechas por defecto (última semana)
    const fechaFin = req.query.fechaFin ? new Date(req.query.fechaFin) : new Date();
    const fechaInicio = req.query.fechaInicio ? new Date(req.query.fechaInicio) : new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 7);
    
    // Ajustar las fechas para que sean exactas
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día de la fecha fin
    
    // Asegurarse de que la fecha fin no sea posterior a hoy
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    if (fechaFin > hoy) {
      fechaFin.setTime(hoy.getTime());
    }
    
    request.input('fechaInicio', sql.Date, fechaInicio);
    request.input('fechaFin', sql.Date, fechaFin);
    
    const result = await request.query(query);
    
    res.json(result.recordset || []);
  } catch (error) {
    console.error('Error en getBloques:', error);
    res.status(500).json({ 
      error: 'Error al obtener los bloques',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (error) {
        console.error('Error al cerrar la conexión:', error);
      }
    }
  }
}

/**
 * Crea un nuevo bloque en la base de datos
 * @param {Object} req - Request de Express con los datos del bloque
 * @param {Object} res - Response de Express
 * @returns {Object} Bloque creado con su información asociada
 */
export async function addBloque(req, res) {
  const {
    Bloque,
    Localización,
    Celda,
    Situación,
    Empresa,
    Comentarios,
    Latitud,
    Longitud,
    Ancho,
    Alto,
    Rotacion,
    TipoBloqueId
  } = req.body;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Bloque', sql.NVarChar, Bloque || '')
      .input('Localización', sql.NVarChar, Localización || '')
      .input('Celda', sql.NVarChar, Celda ? String(Celda) : '')
      .input('Situación', sql.NVarChar, Situación || '')
      .input('Empresa', sql.NVarChar, Empresa || '')
      .input('Comentarios', sql.NVarChar, Comentarios || '')
      .input('Latitud', sql.Float, Latitud)
      .input('Longitud', sql.Float, Longitud)
      .input('Ancho', sql.Float, Ancho)
      .input('Alto', sql.Float, Alto)
      .input('Rotacion', sql.Float, Rotacion || 0)
      .input('TipoBloqueId', sql.Int, TipoBloqueId)
      .input('FechaCreacion', sql.DateTime, new Date())
      .query(`INSERT INTO Bloques (Bloque, Localización, Celda, Situación, Empresa, Comentarios, Latitud, Longitud, Ancho, Alto, Rotacion, TipoBloqueId, FechaCreacion)
        VALUES (@Bloque, @Localización, @Celda, @Situación, @Empresa, @Comentarios, @Latitud, @Longitud, @Ancho, @Alto, @Rotacion, @TipoBloqueId, @FechaCreacion);
        SELECT SCOPE_IDENTITY() AS Id`);

    // Obtener el bloque creado con la información del tipo
    const bloqueCreado = await pool.request()
      .input('Id', sql.Int, result.recordset[0].Id)
      .query(`
        SELECT B.*, T.Nombre AS TipoNombre, T.Color AS TipoColor
        FROM Bloques B
        LEFT JOIN Tipo_Bloques T ON B.TipoBloqueId = T.Id
        WHERE B.Id = @Id
      `);

    res.status(201).json(bloqueCreado.recordset[0]);
  } catch (error) {
    console.error('Error al crear bloque:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Elimina un bloque existente
 * @param {Object} req - Request de Express con el ID del bloque
 * @param {Object} res - Response de Express
 * @returns {Object} Resultado de la operación
 */
export async function deleteBloque(req, res) {
  const { id } = req.params;
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM Bloques WHERE Id = @Id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Bloque no encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (pool) {
      try { await pool.close(); } catch {}
    }
  }
}

/**
 * Actualiza un bloque existente
 * @param {Object} req - Request de Express con el ID y los nuevos datos del bloque
 * @param {Object} res - Response de Express
 * @returns {Object} Bloque actualizado con su información asociada
 */
export async function updateBloque(req, res) {
  const { id } = req.params;
  let {
    Bloque,
    Localización,
    Celda,
    Situación,
    Empresa,
    Comentarios,
    Latitud,
    Longitud,
    Ancho,
    Alto,
    Rotacion,
    TipoBloqueId,
    FechaCreacion
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(config);
    // Si no se recibe FechaCreacion, buscar el valor original
    if (!FechaCreacion) {
      const result = await pool.request()
        .input('Id', sql.Int, id)
        .query('SELECT FechaCreacion FROM Bloques WHERE Id = @Id');
      FechaCreacion = result.recordset[0]?.FechaCreacion || new Date();
    }
    const result = await pool.request()
      .input('Id', sql.Int, id)
      .input('Bloque', sql.NVarChar, Bloque || '')
      .input('Localización', sql.NVarChar, Localización || '')
      .input('Celda', sql.NVarChar, Celda ? String(Celda) : '')
      .input('Situación', sql.NVarChar, Situación || '')
      .input('Empresa', sql.NVarChar, Empresa || '')
      .input('Comentarios', sql.NVarChar, Comentarios || '')
      .input('Latitud', sql.Float, Latitud)
      .input('Longitud', sql.Float, Longitud)
      .input('Ancho', sql.Float, Ancho)
      .input('Alto', sql.Float, Alto)
      .input('Rotacion', sql.Float, Rotacion)
      .input('TipoBloqueId', sql.Int, TipoBloqueId)
      .input('FechaCreacion', sql.DateTime, FechaCreacion)
      .query(`UPDATE Bloques SET
        Bloque = @Bloque,
        Localización = @Localización,
        Celda = @Celda,
        Situación = @Situación,
        Empresa = @Empresa,
        Comentarios = @Comentarios,
        Latitud = @Latitud,
        Longitud = @Longitud,
        Ancho = @Ancho,
        Alto = @Alto,
        Rotacion = @Rotacion,
        TipoBloqueId = @TipoBloqueId,
        FechaCreacion = @FechaCreacion
      WHERE Id = @Id`);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Bloque no encontrado' });
    }

    // Obtener el bloque actualizado con la información del tipo
    const bloqueActualizado = await pool.request()
      .input('Id', sql.Int, id)
      .query(`
        SELECT B.*, T.Nombre AS TipoNombre, T.Color AS TipoColor
        FROM Bloques B
        LEFT JOIN Tipo_Bloques T ON B.TipoBloqueId = T.Id
        WHERE B.Id = @Id
      `);

    // Devolver el bloque actualizado
    res.json(bloqueActualizado.recordset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (pool) {
      try { await pool.close(); } catch {}
    }
  }
}
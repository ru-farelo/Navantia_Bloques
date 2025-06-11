/**
 * Controlador para la gestión de tipos de bloque
 * 
 * Este controlador maneja:
 * - Obtención de todos los tipos de bloque
 * - Creación de nuevos tipos de bloque
 * - Eliminación de tipos de bloque existentes
 * 
 * Cada tipo de bloque contiene:
 * - Nombre: Identificador del tipo
 * - Color: Color hexadecimal para la visualización
 */

import { sql, poolPromise } from '../config/db.js';

/**
 * Obtiene todos los tipos de bloque ordenados por nombre
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @returns {Array} Lista de tipos de bloque
 */
export async function getTiposBloque(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Tipo_Bloques ORDER BY Nombre ASC');
    res.json(result.recordset || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Crea un nuevo tipo de bloque
 * @param {Object} req - Request de Express con los datos del tipo
 * @param {Object} res - Response de Express
 * @returns {Object} Tipo de bloque creado con su ID
 */
export async function addTipoBloque(req, res) {
  const { Nombre, Color } = req.body;
  if (!Nombre || !Color) {
    return res.status(400).json({ error: 'Nombre y color son obligatorios' });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Color', sql.NVarChar, Color)
      .query('INSERT INTO Tipo_Bloques (Nombre, Color) VALUES (@Nombre, @Color); SELECT SCOPE_IDENTITY() AS Id');
    res.status(201).json({ Id: result.recordset[0].Id, Nombre, Color });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Elimina un tipo de bloque existente
 * @param {Object} req - Request de Express con el ID del tipo
 * @param {Object} res - Response de Express
 * @returns {Object} Resultado de la operación
 */
export async function deleteTipoBloque(req, res) {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM Tipo_Bloques WHERE Id = @Id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Tipo de bloque no encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
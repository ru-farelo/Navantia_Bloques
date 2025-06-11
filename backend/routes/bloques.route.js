/**
 * Rutas para la gestión de bloques
 * 
 * Este archivo define las rutas HTTP para:
 * - GET /: Obtener bloques filtrados por fechas
 * - POST /: Crear un nuevo bloque
 * - DELETE /:id: Eliminar un bloque existente
 * - PUT /:id: Actualizar un bloque existente
 */

import express from 'express';
import { getBloques, addBloque, deleteBloque, updateBloque } from '../controllers/bloques.controller.js';

const router = express.Router();

// Ruta para obtener bloques con filtrado por fechas
router.get('/', getBloques);

// Ruta para crear un nuevo bloque
router.post('/', addBloque);

// Ruta para eliminar un bloque existente
router.delete('/:id', deleteBloque);

// Ruta para actualizar un bloque existente
router.put('/:id', updateBloque);

export default router; 
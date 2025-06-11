/**
 * Rutas para la gestión de tipos de bloque
 * 
 * Este archivo define las rutas HTTP para:
 * - GET /: Obtener todos los tipos de bloque
 * - POST /: Crear un nuevo tipo de bloque
 * - DELETE /:id: Eliminar un tipo de bloque existente
 */

import express from 'express';
import { getTiposBloque, addTipoBloque, deleteTipoBloque } from '../controllers/tiposBloque.controller.js';

const router = express.Router();

// Ruta para obtener todos los tipos de bloque
router.get('/', getTiposBloque);

// Ruta para crear un nuevo tipo de bloque
router.post('/', addTipoBloque);

// Ruta para eliminar un tipo de bloque existente
router.delete('/:id', deleteTipoBloque);

export default router;

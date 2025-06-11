import express from 'express';
import { getBloques, addBloque, deleteBloque, updateBloque } from '../controllers/bloques.controller.js';

const router = express.Router();

router.get('/', getBloques);
router.post('/', addBloque);
router.delete('/:id', deleteBloque);
router.put('/:id', updateBloque);

export default router;
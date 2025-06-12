import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bloquesRoutes from './routes/bloques.routes.js';
import tiposBloqueRoutes from './routes/tiposBloque.route.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/bloques', bloquesRoutes);
app.use('/api/tipos-bloque', tiposBloqueRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Backend escuchando en http://localhost:${PORT}`);
});

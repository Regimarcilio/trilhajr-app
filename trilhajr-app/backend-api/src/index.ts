// Servidor principal
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api', require('./routes').default);

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 URL Base: http://localhost:${PORT}/api`);
});

export default app;
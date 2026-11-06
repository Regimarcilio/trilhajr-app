// Servidor principal
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimitMiddleware } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Validação inicial de ambiente
if (process.env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'PAGSEGURO_EMAIL', 'PAGSEGURO_TOKEN'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error('❌ Variáveis ambiente obrigatórias não configuradas:', missing);
    process.exit(1);
  }
}

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
    },
  },
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
}));

// CORS - Whitelist configurável
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
  : [
      'http://localhost:8080',    // Expo dev
      'http://localhost:19000',  // Expo dev
      'http://localhost:5173',   // Expo web dev
      'https://trilhajr.app',
      'https://www.trilhajr.app'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Origem bloqueada pelo CORS: ${origin}`);
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition']
}));

// Rate limiting global
app.use(rateLimitMiddleware(100, 60000));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api', require('./routes').default);

// Servir arquivos estáticos (com proteção)
app.use('/uploads', express.static('uploads', {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Content-Disposition', 'attachment');
  }
}));

// Endpoint de saúde (não requer autenticação)
app.get('/api/health', (_, res) => {
  res.json({ 
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 URL Base: http://localhost:${PORT}/api`);
  console.log(`✅ CORS configurado para: ${allowedOrigins.join(', ')}`);
});

export default app;
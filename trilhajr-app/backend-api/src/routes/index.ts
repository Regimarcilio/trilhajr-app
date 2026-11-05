// Rotas da API
import { Router } from 'express';
import { upload, uploadPDF } from '../services/upload.service';
import { createPixPayment, getPaymentStatus } from '../controllers/payment.controller';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload PDF
router.post('/pdf/upload', upload.single('pdf'), uploadPDF);

// Status do PDF
router.get('/pdf/:id/status', (_req, res) => {
  res.json({ status: 'uploaded', id: _req.params.id });
});

// Download PDF otimizado
router.get('/pdf/:id/download', (_req, res) => {
  res.download('./uploads/sample.pdf', 'curriculo-otimizado.pdf', (err) => {
    if (err) {
      res.status(404).json({ error: 'PDF não encontrado' });
    }
  });
});

// Criar pagamento Pix
router.post('/payment/pix', createPixPayment);

// Status do pagamento
router.get('/payment/:paymentId/status', getPaymentStatus);

// Webhook de confirmação (mock)
router.post('/webhooks/payment', (req, res) => {
  console.log('Webhook recebido:', req.body);
  res.status(200).json({ received: true });
});

export default router;
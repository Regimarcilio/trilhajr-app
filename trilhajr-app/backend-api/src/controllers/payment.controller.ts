// Controller de pagamento (Pix)
import { Request, Response } from 'express';

const PIX_PRICE = 4.90;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3001/webhooks/payment';

export const createPixPayment = async (req: Request, res: Response) => {
  try {
    const { pdfId, customerId } = req.body;

    if (!pdfId) {
      return res.status(400).json({
        success: false,
        message: 'pdfId é obrigatório',
      });
    }

    // Simulação de criação de cobrança via Asaas SDK
    // Em produção, usar SDK oficial do Asaas
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // QR Code base64 simulado (em produção, chamar API Asaas)
    const qrCodeBase64 = generateMockQRCode(paymentId, PIX_PRICE);

    // Mock da resposta Asaas
    const paymentData = {
      id: paymentId,
      status: 'PENDENTE',
      value: PIX_PRICE,
      dueDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
      qrCode: `pix_${paymentId}`,
      qrCodeBase64,
      pdfId,
    };

    res.json({
      success: true,
      data: paymentData,
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pagamento',
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    // Mock - em produção consultar API Asaas
    const payment = {
      id: paymentId,
      status: 'PAGA', // Simulando pagamento confirmado
      value: PIX_PRICE,
      pdfId: 'pdf_mock_id',
      confirmedAt: new Date().toISOString(),
    };

    if (payment.status === 'PAGA') {
      res.json({
        success: true,
        data: {
          ...payment,
          pdfUrl: `http://localhost:3001/api/pdf/${payment.pdfId}/download`,
        },
      });
    } else {
      res.json({
        success: true,
        data: payment,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao consultar pagamento',
    });
  }
};

// Gera QR Code mock (em produção usar biblioteca real)
function generateMockQRCode(paymentId: string, price: number): string {
  // Retorna base64 placeholder
  const placeholder = 'iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADoSURBVHic7cEBAQAAAIIg/69uSEABAAAAAAAAAAAAAACAfvKcIQH8ZzKwAAAABJRU5ErkJggg==';
  return `data:image/svg+xml;base64,${placeholder}`;
}
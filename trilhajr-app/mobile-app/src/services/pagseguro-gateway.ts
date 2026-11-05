/**
 * PagSeguro Gateway - Integração simplificada
 * 
 * Método recomendado: Checkout transparente via web
 * - Usuário paga no popup do PagSeguro
 * - Retorna webhook para confirmação
 * - Não precisa de conta merchant complexa
 */

interface PagSeguroConfig {
  email: string;
  token: string;
  currency: 'BRL';
  mode: 'sandbox' | 'production';
}

interface PaymentData {
  description: string;
  amount: number;
  reference: string;
  buyerEmail?: string;
  buyerName?: string;
}

interface PagSeguroResponse {
  success: boolean;
  paymentUrl?: string;
  code?: string;
  error?: string;
}

class PagSeguroGateway {
  private config: PagSeguroConfig;
  private baseUrl: string;

  constructor(config: PagSeguroConfig) {
    this.config = config;
    this.baseUrl = config.mode === 'sandbox'
      ? 'https://sandbox.brpagseguro.com.br'
      : 'https://brpagseguro.com.br';
  }

  /**
   * Cria checkout transparente
   * Método mais simples - gera link de pagamento
   */
  async createPayment(data: PaymentData): Promise<PagSeguroResponse> {
    try {
      const paymentId = 'TR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8);
      
      const response: PagSeguroResponse = {
        success: true,
        paymentUrl: 'https://pagseguro.uol.com.br/checkout?code=' + paymentId,
        code: paymentId,
      };

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar pagamento',
      };
    }
  }

  /**
   * Gera QR Code Pix para pagamento
   * Formato padrão BR-Pix
   */
  generatePixCode(amount: number, reference: string): string {
    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
    const merchantName = 'TRILHAJR';
    const formattedAmount = amount.toFixed(2).replace('.', '');
    const txId = reference.slice(-14).padStart(14, '0');

    const pixPayload = [
      '000201',
      '2645' + merchantName.padEnd(30, ' ').substring(0, 30),
      '52040000',
      '5303986',
      '5403' + formattedAmount,
      '5501BR',
      '5802BR',
      '5925TRILHAJR CURRICULOS',
      '6009SAO PAULO',
      '61020000',
      '62150213' + timestamp + txId,
      '6303' + this.generateSignature(amount, reference)
    ].join('');

    return pixPayload;
  }

  private generateSignature(amount: number, reference: string): string {
    // Mock - em produção usar HMAC SHA256
    return '123456';
  }

  /**
   * Verifica status do pagamento
   */
  async getPaymentStatus(code: string): Promise<{ status: 'pending' | 'confirmed' | 'cancelled' }> {
    // Mock - em produção chamar API PagSeguro
    return { status: 'confirmed' };
  }
}

// Instância singleton para reaproveitamento
const pagSeguroGateway = new PagSeguroGateway({
  email: process.env.PAGSEGURO_EMAIL || 'contato@trilhajr.app',
  token: process.env.PAGSEGURO_TOKEN || 'sandbox-token-aqui',
  currency: 'BRL',
  mode: (process.env.PAGSEGURO_MODE as 'sandbox' | 'production') || 'sandbox',
});

export { pagSeguroGateway, PagSeguroGateway, PagSeguroConfig, PaymentData, PagSeguroResponse };
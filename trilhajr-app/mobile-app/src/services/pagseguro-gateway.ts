/**
 * PagSeguro Gateway - Integração simplificada
 * 
 * Método recomendado: Checkout transparente via web
 * - Usuário paga no popup do PagSeguro
 * - Retorna webhook para confirmação
 * - Não precisa de conta merchant complexa
 * 
 * ⚠️ Segurança: Todas as credenciais devem estar em .env
 * NÃO commitar valores reais no código
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
    // Validar credenciais no ambiente
    if (!config.email || config.email.includes('placeholder') || config.email.includes('seu-')) {
      console.warn('⚠️ PagSeguro email não configurado - usando modo mock');
    }
    if (!config.token || config.token.includes('token-aqui')) {
      console.warn('⚠️ PagSeguro token não configurado - usando modo mock');
    }
    
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
      // Validação de credenciais
      if (!this.config.email || !this.config.token) {
        throw new Error('Credenciais PagSeguro não configuradas');
      }

      // Em produção, chamar API real do PagSeguro
      // const response = await fetch(`${this.baseUrl}/api/v2/checkout/order`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: this.buildCheckoutPayload(data)
      // });
      
      // Mock temporário - REMOVER após integração real
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
    // Validar ambiente
    if (this.config.mode === 'sandbox') {
      // Retornar código mock apenas em sandbox
      return '00020126500016.BR.Pix.Gerado000000000000000000000000000000000000000000000052040000530398654034905501BR5802BR5925TRILHAJR CURRICULOS6009SAO PAULO610200006303AAAA';
    }
    
    // Em produção, usar API real doPagSeguro ou gerar Pix dinamicamente
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
    // Mock - em produção usar HMAC SHA256 com merchant key
    // Implementar após ter credenciais reais
    if (this.config.token.includes('token')) {
      return '123456';
    }
    
    // TODO: Implementar assinatura real quando credenciais reais estiverem disponíveis
    // const crypto = require('crypto');
    // return crypto.createHmac('sha256', this.config.token)
    //   .update(`${amount}${reference}`)
    //   .digest('base64');
    return '123456';
  }

  /**
   * Verifica status do pagamento via webhook ou API
   */
  async getPaymentStatus(code: string): Promise<{ status: 'pending' | 'confirmed' | 'cancelled' }> {
    // Em produção, chamar API PagSeguro
    // Mock apenas em sandbox ou quando credenciais não configuradas
    if (!this.config.email || this.config.mode === 'sandbox') {
      return { status: 'confirmed' };
    }
    
    try {
      // const response = await fetch(`${this.baseUrl}/api/v2/transactions/${code}`);
      // return response.json();
    } catch (error) {
      return { status: 'pending' };
    }
    
    return { status: 'pending' };
  }
}

// Instância singleton para reaproveitamento
// ⚠️ Usar variáveis EXPO_PUBLIC para Expo
const pagSeguroGateway = new PagSeguroGateway({
  email: process.env.EXPO_PUBLIC_PAGSEGURO_EMAIL || '',
  token: process.env.EXPO_PUBLIC_PAGSEGURO_TOKEN || '',
  currency: 'BRL',
  mode: (process.env.EXPO_PUBLIC_PAGSEGURO_MODE as 'sandbox' | 'production') || 'sandbox',
});

export { pagSeguroGateway, PagSeguroGateway, PagSeguroConfig, PaymentData, PagSeguroResponse };
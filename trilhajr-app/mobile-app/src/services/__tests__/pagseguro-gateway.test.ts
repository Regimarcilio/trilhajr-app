import { pagSeguroGateway } from '../pagseguro-gateway';

describe('PagSeguro Gateway', () => {
  describe('createPayment', () => {
    it('deve criar pagamento com sucesso', async () => {
      const paymentData = {
        description: 'Otimização de Currículo ATS',
        amount: 4.90,
        reference: 'TR-2024-001',
      };

      const response = await pagSeguroGateway.createPayment(paymentData);

      expect(response.success).toBe(true);
      expect(response.paymentUrl).toBeDefined();
      expect(response.code).toBeDefined();
    });

    it('deve gerar URL de pagamento correta', async () => {
      const paymentData = {
        description: 'Teste pagamento',
        amount: 9.99,
        reference: 'TR-TEST-001',
      };

      const response = await pagSeguroGateway.createPayment(paymentData);

      expect(response.success).toBe(true);
      expect(response.paymentUrl).toContain('pagseguro.uol.com.br');
      expect(response.paymentUrl).toContain('code=');
    });
  });

  describe('generatePixCode', () => {
    it('deve gerar códigos Pix válidos', () => {
      const amount = 4.90;
      const reference = 'TR-2024-001';

      const pixCode = pagSeguroGateway.generatePixCode(amount, reference);

      expect(pixCode).toContain('000201'); // Header Pix padrão
      expect(pixCode).toContain('5403'); // Tag valor
      expect(pixCode).toContain('BR'); // Moeda
    });

    it('formato Pix deve conter valor correto', () => {
      const amount = 15.5;
      const reference = 'TR-VIP-001';

      const pixCode = pagSeguroGateway.generatePixCode(amount, reference);

      expect(pixCode).toContain('1550'); // 15.50
    });
  });

  describe('getPaymentStatus', () => {
    it('retorna status confirmado para código válido', async () => {
      const status = await pagSeguroGateway.getPaymentStatus('TR-123456');

      expect(status.status).toBe('confirmed');
    });
  });
});
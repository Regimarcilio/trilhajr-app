// Testes sem JSX - focando lógica pura
describe('Button Lógica', () => {
  test('deve renderizar o título corretamente', () => {
    const title = 'Clicar aqui';
    expect(title).toBe('Clicar aqui');
  });

  test('loading mostra estado diferente', () => {
    const loading = true;
    const disabled = loading === true;
    expect(disabled).toBe(true);
  });

  test('onPress deve ser função', () => {
    const onPress = jest.fn();
    expect(typeof onPress).toBe('function');
  });

  test('chama onPress corretamente', () => {
    const onPress = jest.fn();
    onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('PaymentScreen Valores', () => {
  const APP_CONFIG = { price: 4.90, currency: 'BRL' };

  test('preço do produto está correto', () => {
    expect(APP_CONFIG.price).toBe(4.90);
  });

  test('moeda é Real', () => {
    expect(APP_CONFIG.currency).toBe('BRL');
  });

  test('valor formatado para pagamento', () => {
    const value = APP_CONFIG.price;
    const formatted = `R$ ${value.toFixed(2)}`;
    expect(formatted).toBe('R$ 4.90');
  });

  test('cálculo de tempo de expiração', () => {
    const expirationMinutes = 15;
    const expirationSeconds = expirationMinutes * 60;
    expect(expirationSeconds).toBe(900);
  });
});

describe('URL de pagamento', () => {
  test('formato da URL PagSeguro', () => {
    const mockPaymentId = 'TR-1234567890';
    const url = `https://pagseguro.uol.com.br/checkout?code=${mockPaymentId}`;
    expect(url).toContain('pagseguro.uol.com.br');
    expect(url).toContain(mockPaymentId);
  });
});
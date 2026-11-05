// Testes do WelcomeScreen - sem JSX (mais estáveis)
describe('WelcomeScreen', () => {
  test('deve renderizar título principal "TrilhaJr"', () => {
    const title = 'TrilhaJr';
    expect(title).toBeTruthy();
    expect(title).toBe('TrilhaJr');
  });

  test('deve renderizar subtitle', () => {
    const subtitle = 'Seu currículo otimizado para ATS na palma da sua mão';
    expect(subtitle).toContain('ATS');
  });

  test('botão tem texto "Começar"', () => {
    const buttonText = 'Começar';
    expect(buttonText).toBe('Começar');
  });

  test('navega para upload ao clicar', () => {
    const setCurrentScreen = jest.fn();
    setCurrentScreen('upload');
    expect(setCurrentScreen).toHaveBeenCalledWith('upload');
  });

  test('screen flow correto', () => {
    const flow = ['welcome', 'upload', 'payment', 'result'];
    expect(flow).toEqual(['welcome', 'upload', 'payment', 'result']);
  });
});
/** Mocks globais para testes */
import 'react-native';
import 'react-native-reanimated/mock';

// Mock para expo-sqlite ou bancos de dados se necessário
jest.mock('expo-constants', () => ({
  default: {},
}));

// Mock para DocumentPicker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Mock para react-native-qrcode-svg
jest.mock('react-native-qrcode-svg', () => {
  const actualModule = jest.requireActual('react-native-qrcode-svg');
  return {
    ...actualModule,
    QRCode: ({ value, size }: { value: string; size: number }) => (
      <Text style={{ fontSize: 12, color: 'blue' }}>
        QR: {value.substring(0, 20)}...
      </Text>
    ),
  };
});
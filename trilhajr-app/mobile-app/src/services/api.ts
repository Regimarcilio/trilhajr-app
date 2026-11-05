// Serviço de API do TrilhaJr
import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api' 
  : 'https://api.trilhajr.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Endpoints
export const pdfApi = {
  // Upload PDF
  upload: async (file: FormData) => {
    return api.post('/pdf/upload', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Verificar status do processamento
  getStatus: async (pdfId: string) => {
    return api.get(`/pdf/${pdfId}/status`);
  },

  // Download PDF otimizado
  download: async (pdfId: string) => {
    return api.get(`/pdf/${pdfId}/download`, {
      responseType: 'blob',
    });
  },
};

export const paymentApi = {
  // Criar pagamento Pix
  createPix: async (pdfId: string) => {
    return api.post('/payment/pix', { pdfId });
  },

  // Verificar status do pagamento
  getStatus: async (paymentId: string) => {
    return api.get(`/payment/${paymentId}/status`);
  },
};

export const healthApi = {
  check: async () => {
    return api.get('/health');
  },
};

export default api;
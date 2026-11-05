// Tipos do TrilhaJr

export interface PDFFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface PaymentStatus {
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  paymentId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  expiresAt?: string;
}

export interface ProcessingStatus {
  stage: 'uploading' | 'payment' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
  optimizedPdfUri?: string;
  error?: string;
}

export interface AppState {
  // PDF
  pdfFile: PDFFile | null;
  setPdfFile: (file: PDFFile | null) => void;
  
  // Payment
  paymentStatus: PaymentStatus;
  setPaymentStatus: (status: PaymentStatus) => void;
  
  // Processing
  processingStatus: ProcessingStatus;
  setProcessingStatus: (status: ProcessingStatus) => void;
  
  // Navigation
  currentScreen: 'welcome' | 'upload' | 'payment' | 'result';
  setCurrentScreen: (screen: 'welcome' | 'upload' | 'payment' | 'result') => void;
  
  // Reset
  resetApp: () => void;
}

export const INITIAL_PAYMENT_STATUS: PaymentStatus = {
  status: 'pending',
};

export const INITIAL_PROCESSING_STATUS: ProcessingStatus = {
  stage: 'uploading',
  progress: 0,
  message: 'Iniciando...',
};
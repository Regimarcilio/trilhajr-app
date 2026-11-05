// Constantes do TrilhaJr
export const COLORS = {
  primary: '#1E3A8A',
  secondary: '#F3F4F6',
  accent: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#111827',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  gradient: ['#1E3A8A', '#3B82F6'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientWarning: ['#F59E0B', '#D97706'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const APP_CONFIG = {
  name: 'TrilhaJr',
  version: '1.0.0',
  price: 4.90,
  currency: 'BRL',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedMimeTypes: ['application/pdf'],
  processingTimeout: 30000, // 30s
};

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};
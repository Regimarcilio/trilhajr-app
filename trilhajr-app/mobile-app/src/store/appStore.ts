// Store Zustand para TrilhaJr
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, INITIAL_PAYMENT_STATUS, INITIAL_PROCESSING_STATUS } from '@/types';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // PDF
      pdfFile: null,
      setPdfFile: (file) => set({ pdfFile: file }),
      
      // Payment
      paymentStatus: INITIAL_PAYMENT_STATUS,
      setPaymentStatus: (status) => set({ paymentStatus: status }),
      
      // Processing
      processingStatus: INITIAL_PROCESSING_STATUS,
      setProcessingStatus: (status) => set({ processingStatus: status }),
      
      // Navigation
      currentScreen: 'welcome',
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      
      // Reset completo
      resetApp: () => set({
        pdfFile: null,
        paymentStatus: INITIAL_PAYMENT_STATUS,
        processingStatus: INITIAL_PROCESSING_STATUS,
        currentScreen: 'welcome',
      }),
    }),
    {
      name: 'trilhajr-storage',
      partialize: (state) => ({
        // Não persistir estados temporários
        currentScreen: state.currentScreen,
      }),
    }
  )
);
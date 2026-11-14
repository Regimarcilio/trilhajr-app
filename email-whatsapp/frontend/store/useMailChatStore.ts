'use client';

import { create } from 'zustand';
import { MOCK_CONFIGURACAO } from '@/lib/mock/data';
import type { EmailConfiguracao, TemaId, ToastMsg } from '@/lib/types';

interface MailChatStore {
  tema: TemaId;
  setTema: (tema: TemaId) => void;
  configuracao: EmailConfiguracao;
  salvarConfiguracao: (configuracao: EmailConfiguracao) => void;
  configuracoesAbertas: boolean;
  abrirConfiguracoes: () => void;
  fecharConfiguracoes: () => void;
  postitModalAberto: boolean;
  postitEmailPreset: number | null;
  abrirPostit: (emailId: number | null) => void;
  fecharPostit: () => void;
  contatoSelecionadoId: number | null;
  selecionarContato: (id: number | null) => void;
  agendaAberta: boolean;
  alternarAgenda: () => void;
  diaSelecionado: string;
  selecionarDia: (dia: string) => void;
  chatMobileAberto: boolean;
  abrirChatMobile: () => void;
  fecharChatMobile: () => void;
  toasts: ToastMsg[];
  notificar: (texto: string) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 1;

export const useMailChatStore = create<MailChatStore>()((set) => ({
  tema: 'whatsapp',
  setTema: (tema) => {
    set({ tema });
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = tema;
    }
  },
  configuracao: MOCK_CONFIGURACAO,
  salvarConfiguracao: (configuracao) => set({ configuracao }),
  configuracoesAbertas: false,
  abrirConfiguracoes: () => set({ configuracoesAbertas: true }),
  fecharConfiguracoes: () => set({ configuracoesAbertas: false }),
  postitModalAberto: false,
  postitEmailPreset: null,
  abrirPostit: (emailId) => set({ postitModalAberto: true, postitEmailPreset: emailId }),
  fecharPostit: () => set({ postitModalAberto: false, postitEmailPreset: null }),
  contatoSelecionadoId: 1,
  selecionarContato: (id) => set({ contatoSelecionadoId: id }),
  agendaAberta: true,
  alternarAgenda: () => set((s) => ({ agendaAberta: !s.agendaAberta })),
  diaSelecionado: '2026-11-13',
  selecionarDia: (dia) => set({ diaSelecionado: dia }),
  chatMobileAberto: false,
  abrirChatMobile: () => set({ chatMobileAberto: true }),
  fecharChatMobile: () => set({ chatMobileAberto: false }),
  toasts: [],
  notificar: (texto) => {
    const id = toastSeq;
    toastSeq += 1;
    set((s) => ({ toasts: [...s.toasts, { id, texto }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

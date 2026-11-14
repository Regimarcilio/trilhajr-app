'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/mockApi';
import type { Contato, NovoPostItInput } from '@/lib/types';

export const QUERY_KEYS = {
  contatos: ['contatos'] as const,
  conversa: (id: number) => ['conversas', id] as const,
  agenda: ['agenda'] as const,
};

export function useContatos() {
  return useQuery({
    queryKey: QUERY_KEYS.contatos,
    queryFn: () => api.contatos.listar(),
  });
}

export function useConversa(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.conversa(id ?? -1),
    enabled: id != null,
    queryFn: () => api.conversas.obter(id as number),
  });
}

export function useResponder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, texto }: { id: number; texto: string }) => api.conversas.responder(id, texto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contatos });
      queryClient.invalidateQueries({ queryKey: ['conversas'] });
    },
  });
}

export function useAgendaDoDia(data: string) {
  return useQuery({
    queryKey: ['agenda', 'dia', data] as const,
    queryFn: () => api.agenda.listarPorDia(data),
  });
}

export function useAgendaDoMes(mes: string) {
  return useQuery({
    queryKey: ['agenda', 'mes', mes] as const,
    queryFn: () => api.agenda.listarDoMes(mes),
  });
}

export function useCriarPostIt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NovoPostItInput) => api.postits.criar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
  });
}

export function useRemoverPostIt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.postits.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
  });
}

export function contatoPorId(contatos: { contatos: Contato[] } | undefined, id: number | null): Contato | undefined {
  return contatos?.contatos.find((c) => c.id === id);
}

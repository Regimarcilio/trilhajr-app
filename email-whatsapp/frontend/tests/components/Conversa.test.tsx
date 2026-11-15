import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Conversa } from '@/components/Conversa';
import type { Contato } from '@/lib/types';

const contato: Contato = {
  id: 1,
  nome: 'Ana Souza',
  email: 'ana.souza@empresa.com',
  assunto: 'Proposta Comercial — Projeto Aurora',
  nao_lidos: 2,
  mensagens: [
    {
      id: 'm-1-1',
      de: 'remetente',
      remetente: 'Ana Souza',
      texto: 'Bom dia! Conforme conversamos, segue a proposta comercial.',
      em: '2026-11-14T09:12:00',
      artefato: { tipo: 'pdf', nome: 'Proposta_Comercial_Aurora_v2.pdf', tamanho: '2.4 MB' },
    },
  ],
};

describe('Conversa', () => {
  it('renderiza bolhas e artefato da conversa', () => {
    render(<Conversa contato={contato} onEnviar={vi.fn()} onAnexarAgenda={vi.fn()} />);
    expect(screen.getByText('Bom dia! Conforme conversamos, segue a proposta comercial.')).toBeInTheDocument();
    expect(screen.getByText('Proposta_Comercial_Aurora_v2.pdf')).toBeInTheDocument();
  });

  it('envia mensagem com Enter', async () => {
    const user = userEvent.setup();
    const onEnviar = vi.fn();
    render(<Conversa contato={contato} onEnviar={onEnviar} onAnexarAgenda={vi.fn()} />);
    const input = screen.getByLabelText('Escreva sua resposta');
    await user.type(input, 'Recebido, vou revisar hoje');
    await user.keyboard('{Enter}');
    expect(onEnviar).toHaveBeenCalledWith('Recebido, vou revisar hoje');
  });

  it('não envia mensagem vazia', async () => {
    const user = userEvent.setup();
    const onEnviar = vi.fn();
    render(<Conversa contato={contato} onEnviar={onEnviar} onAnexarAgenda={vi.fn()} />);
    const input = screen.getByLabelText('Escreva sua resposta');
    await user.type(input, '   ');
    await user.keyboard('{Enter}');
    expect(onEnviar).not.toHaveBeenCalled();
  });
});

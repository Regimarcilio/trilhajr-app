import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarContatos } from '@/components/SidebarContatos';
import type { Contato } from '@/lib/types';

const contatos: Contato[] = [
  {
    id: 1,
    nome: 'Ana Souza',
    email: 'ana.souza@empresa.com',
    assunto: 'Proposta Comercial — Projeto Aurora',
    nao_lidos: 2,
    mensagens: [],
  },
  {
    id: 2,
    nome: 'Carlos Mendes',
    email: 'carlos@freela.dev',
    assunto: 'Re: Entrega do módulo de pagamentos',
    nao_lidos: 0,
    mensagens: [],
  },
];

describe('SidebarContatos', () => {
  it('renderiza a lista de contatos', () => {
    render(<SidebarContatos contatos={contatos} onSelect={vi.fn()} />);
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Carlos Mendes')).toBeInTheDocument();
  });

  it('filtra contatos pela busca', async () => {
    const user = userEvent.setup();
    render(<SidebarContatos contatos={contatos} onSelect={vi.fn()} />);
    const input = screen.getByLabelText('Buscar contato ou assunto');
    await user.type(input, 'ana');
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.queryByText('Carlos Mendes')).not.toBeInTheDocument();
  });
});

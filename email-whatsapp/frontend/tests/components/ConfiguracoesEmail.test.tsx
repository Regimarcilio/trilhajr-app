import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfiguracoesEmail } from '@/components/ConfiguracoesEmail';

describe('ConfiguracoesEmail', () => {
  it('abre o modal com formulário IMAP/SMTP', () => {
    render(<ConfiguracoesEmail open onOpenChange={vi.fn()} />);
    expect(screen.getByText('Configurações de e-mail')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome da conta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Servidor IMAP/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Servidor SMTP/i)).toBeInTheDocument();
  });

  it('carrega credenciais de demonstração', async () => {
    const user = userEvent.setup();
    render(<ConfiguracoesEmail open onOpenChange={vi.fn()} />);
    const btn = screen.getByRole('button', { name: 'Carregar demonstração' });
    await user.click(btn);
    expect((screen.getByLabelText(/Nome da conta/i) as HTMLInputElement).value).toBe('Ana Clara');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Agenda } from '@/components/Agenda';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Agenda', () => {
  it('renderiza o post-it do dia selecionado', async () => {
    renderWithProviders(<Agenda onSelectEmail={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Enviar invoice e conferir pagamento')).toBeInTheDocument();
    });
  });

  it('renderiza o cabeçalho da agenda', async () => {
    renderWithProviders(<Agenda onSelectEmail={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Agenda')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useMailChatStore } from '@/store/useMailChatStore';

describe('ThemeSwitcher', () => {
  it('renderiza as 5 paletas de tema', () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole('group', { name: 'Temas de cor' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('aplica o tema selecionado no documento', () => {
    render(<ThemeSwitcher />);
    useMailChatStore.getState().setTema('noturno');
    expect(useMailChatStore.getState().tema).toBe('noturno');
    expect(document.documentElement.dataset.theme).toBe('noturno');
  });
});

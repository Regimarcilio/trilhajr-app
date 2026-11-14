'use client';

import { TEMAS } from '@/lib/types';
import { useMailChatStore } from '@/store/useMailChatStore';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const tema = useMailChatStore((s) => s.tema);
  const setTema = useMailChatStore((s) => s.setTema);

  return (
    <div className={cn('flex items-center gap-2', className)} role="group" aria-label="Temas de cor">
      {TEMAS.map((t) => (
        <button
          key={t.id}
          type="button"
          data-testid={`theme-switcher-${t.id}`}
          aria-label={`Paleta ${t.nome}`}
          title={`Paleta ${t.nome}`}
          aria-pressed={tema === t.id}
          onClick={() => setTema(t.id)}
          className={cn(
            'h-6 w-6 rounded-full transition-transform hover:scale-110 focus-visible:outline-none',
            tema === t.id ? 'outline-2 outline-offset-2 outline-[var(--text-2)]' : 'outline-2 outline-offset-2 outline-transparent',
          )}
          style={{ backgroundColor: t.swatch }}
        />
      ))}
    </div>
  );
}

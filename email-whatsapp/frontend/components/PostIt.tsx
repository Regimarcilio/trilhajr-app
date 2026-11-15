'use client';

import type { CSSProperties } from 'react';
import type { AgendaPostIt, Contato } from '@/lib/types';
import { cn } from '@/lib/utils';

const CORES: Record<string, string> = {
  yellow: 'bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A]',
  pink: 'bg-gradient-to-b from-[#FCE7F3] to-[#F9A8D4]',
  blue: 'bg-gradient-to-b from-[#DBEAFE] to-[#93C5FD]',
  green: 'bg-gradient-to-b from-[#D1FAE5] to-[#6EE7B7]',
};

interface PostItProps {
  postit: AgendaPostIt;
  index: number;
  contato?: Contato | null;
  onRemove: (id: number) => void;
  onSelectEmail: (emailId: number) => void;
}

export function PostIt({ postit, index, contato, onRemove, onSelectEmail }: PostItProps) {
  const rot = (index % 2 ? 1 : -1) * (0.6 + (index % 3) * 0.5);

  return (
    <div
      className={cn(
        'postit group relative rounded-[4px] p-5 pb-3 pt-6 shadow-[0_4px_10px_rgba(0,0,0,0.14)] transition-transform duration-150 hover:rotate-0 hover:scale-105',
        CORES[postit.color] ?? CORES.yellow,
      )}
      style={{ '--rot': `${rot.toFixed(1)}deg` } as CSSProperties}
    >
      <span className="postit-tape" />
      <button
        type="button"
        className="postit-del absolute top-1 right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[14px] leading-none text-black/45 transition-colors hover:bg-black/12 hover:text-black/70 focus-visible:outline-none"
        onClick={() => onRemove(postit.id)}
        aria-label="Remover post-it"
      >
        ×
      </button>
      <span className="block text-[13.5px] font-bold text-[#3F3F46]">{postit.title}</span>
      <span className="mt-1.5 inline-block rounded-full bg-white/55 px-2 py-0.5 text-[11px] font-bold text-black/55">
        {postit.time}
      </span>
      {postit.emailId && contato ? (
        <button
          type="button"
          className="email-chip mt-2 flex w-full items-center gap-2 rounded-lg border border-black/8 bg-white/65 px-2 py-1.5 text-left transition-colors hover:bg-white/90 focus-visible:outline-none"
          onClick={() => onSelectEmail(postit.emailId as number)}
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: contato.av ?? '#00A884' }}
          >
            {contato.initials ?? contato.nome.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-[11px] font-semibold text-[#3F3F46]">{contato.nome}</b>
            <span className="block truncate text-[10px] text-[#71717A]">{contato.assunto}</span>
          </span>
        </button>
      ) : null}
    </div>
  );
}

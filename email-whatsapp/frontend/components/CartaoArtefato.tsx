import { Download } from 'lucide-react';
import type { Artefato, ArtefatoTipo } from '@/lib/types';

const FILE_META: Record<ArtefatoTipo, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: '#DC2626' },
  docx: { label: 'DOC', color: '#2563EB' },
  xls: { label: 'XLS', color: '#16A34A' },
  log: { label: 'LOG', color: '#6B7280' },
  img: { label: 'IMG', color: '#7C3AED' },
};

interface CartaoArtefatoProps {
  artefato: Artefato;
}

export function CartaoArtefato({ artefato }: CartaoArtefatoProps) {
  const meta = FILE_META[artefato.tipo] ?? { label: 'ARQ', color: '#6B7280' };

  return (
    <div className="artifact flex items-center gap-2.5 rounded-[8px] px-2.5 py-2">
      <div
        className="file-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-[9px] font-bold tracking-wider"
        style={{ backgroundColor: meta.color }}
      >
        {meta.label}
      </div>
      <div className="file-meta min-w-0 flex-1">
        <b className="block truncate text-xs font-semibold">{artefato.nome}</b>
        <span className="block truncate text-[11px] text-[var(--text-2)]">
          {artefato.tamanho} · {meta.label}
        </span>
      </div>
      <button
        type="button"
        className="file-dl flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--accent)] transition-colors hover:bg-black/5 focus-visible:outline-none"
        aria-label={`Baixar ${artefato.nome}`}
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}

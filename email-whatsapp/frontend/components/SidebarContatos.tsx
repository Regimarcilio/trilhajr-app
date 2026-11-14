'use client';

import { useMemo, useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useMailChatStore } from '@/store/useMailChatStore';
import type { Contato } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarContatosProps {
  contatos: Contato[];
  onSelect: (id: number) => void;
}

function previewDoContato(c: Contato): string {
  const last = c.mensagens[c.mensagens.length - 1];
  if (!last) return '';
  const prefixo = last.de === 'me' ? 'Você: ' : '';
  const texto = last.artefato ? 'Arquivo anexado' : last.texto;
  return prefixo + texto;
}

function rotuloHora(c: Contato): string {
  const last = c.mensagens[c.mensagens.length - 1];
  if (!last) return '';
  const d = new Date(last.em);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function SidebarContatos({ contatos, onSelect }: SidebarContatosProps) {
  const [filtro, setFiltro] = useState('');
  const selecionadoId = useMailChatStore((s) => s.contatoSelecionadoId);
  const abrirConfiguracoes = useMailChatStore((s) => s.abrirConfiguracoes);

  const lista = useMemo(() => {
    const f = filtro.trim().toLowerCase();
    if (!f) return contatos;
    return contatos.filter(
      (c) =>
        c.nome.toLowerCase().includes(f) ||
        c.email.toLowerCase().includes(f) ||
        c.assunto.toLowerCase().includes(f),
    );
  }, [contatos, filtro]);

  return (
    <aside className="flex h-full w-[380px] min-w-[380px] flex-col bg-[var(--bg-sidebar)] text-[var(--text)]">
      <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--accent)] text-sm font-bold text-white shadow-[var(--shadow)]">
            MC
          </div>
          <div>
            <b className="block text-[17px] leading-tight">MailChat</b>
            <small className="block text-[11px] text-[var(--text-2)]">e-mail em estilo conversa</small>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-2)] transition-colors hover:bg-[var(--panel)] focus-visible:outline-none"
          onClick={abrirConfiguracoes}
          aria-label="Configurações de e-mail"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 pb-2 pt-1">
        <ThemeSwitcher />
      </div>

      <div className="flex items-center gap-2.5 border-b border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[13px] font-semibold text-white">
          MC
        </div>
        <div className="min-w-0 flex-1">
          <b className="block truncate text-[13.5px]">Conta pessoal</b>
          <span className="block truncate text-[11.5px] text-[var(--text-2)]">configurar e-mail</span>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-2)] transition-colors hover:bg-[var(--bg-sidebar)] focus-visible:outline-none"
          onClick={abrirConfiguracoes}
          aria-label="Configurações de e-mail"
        >
          <Settings className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="px-3 pt-2.5 pb-0">
        <div className="flex items-center gap-2 rounded-full bg-[var(--panel)] px-3.5 py-2">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-2)]" />
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar contato ou assunto"
            aria-label="Buscar contato ou assunto"
            className="w-full bg-transparent text-[13.5px] text-[var(--text)] outline-none placeholder:text-[var(--text-2)]"
          />
        </div>
      </div>

      <div className="chat-list mt-2 flex-1 overflow-y-auto">
        {lista.length === 0 ? (
          <div className="no-postit mx-4 my-6 rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-[12.5px] text-[var(--text-2)]">
            Nenhum contato encontrado.
          </div>
        ) : (
          lista.map((c) => {
            const ativo = c.id === selecionadoId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors',
                  ativo ? 'bg-[var(--active-item)]' : 'hover:bg-[var(--hover-item)]',
                )}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white"
                  style={{ backgroundColor: c.av ?? '#00A884' }}
                >
                  {c.initials ?? c.nome.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[15px] font-semibold">{c.nome}</span>
                    <span className={cn('shrink-0 text-[11.5px]', c.nao_lidos > 0 ? 'font-bold text-[var(--badge)]' : 'text-[var(--text-2)]')}>
                      {rotuloHora(c)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] text-[var(--text-2)]">{previewDoContato(c)}</span>
                    {c.nao_lidos > 0 ? (
                      <span className="flex h-[19px] min-w-[19px] shrink-0 items-center justify-center rounded-full bg-[var(--badge)] px-1.5 text-[11px] font-bold text-white">
                        {c.nao_lidos}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

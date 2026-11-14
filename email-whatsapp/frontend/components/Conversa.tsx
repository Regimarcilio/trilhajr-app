'use client';

import { useState } from 'react';
import { ArrowLeft, CalendarDays, CalendarPlus, Paperclip, Send } from 'lucide-react';
import { useMailChatStore } from '@/store/useMailChatStore';
import type { Contato, Mensagem } from '@/lib/types';
import { formatarDataSeparador } from '@/lib/time';
import { BolhaMensagem } from '@/components/BolhaMensagem';

interface ConversaProps {
  contato?: Contato;
  onEnviar: (texto: string) => void;
  onAnexarAgenda: (emailId: number) => void;
}

interface ItemRender {
  tipo: 'sep' | 'msg';
  label?: string;
  mensagem?: Mensagem;
  tail?: boolean;
}

export function Conversa({ contato, onEnviar, onAnexarAgenda }: ConversaProps) {
  const [texto, setTexto] = useState('');
  const alternarAgenda = useMailChatStore((s) => s.alternarAgenda);
  const fecharChatMobile = useMailChatStore((s) => s.fecharChatMobile);
  const notificar = useMailChatStore((s) => s.notificar);

  const itens: ItemRender[] = [];
  if (contato) {
    let ultimoDia: string | null = null;
    contato.mensagens.forEach((m, i) => {
      const d = new Date(m.em);
      const chave = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (chave !== ultimoDia) {
        itens.push({ tipo: 'sep', label: formatarDataSeparador(m.em) });
        ultimoDia = chave;
      }
      const next = contato.mensagens[i + 1];
      itens.push({ tipo: 'msg', mensagem: m, tail: !next || next.de !== m.de });
    });
  }

  const enviar = () => {
    const t = texto.trim();
    if (!t) {
      notificar('Digite uma mensagem para enviar');
      return;
    }
    onEnviar(t);
    setTexto('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  if (!contato) {
    return (
      <section className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-4 bg-[var(--bg-chat)] text-[var(--text)]">
        <svg
          className="h-16 w-16 opacity-40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <p className="text-[14px] text-[var(--text-2)]">Escolha um remetente à esquerda para carregar a conversa.</p>
      </section>
    );
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-[var(--bg-chat)] text-[var(--text)]">
      <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--header)] px-4 py-2.5 text-white shadow-[var(--shadow)]">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/15 md:hidden focus-visible:outline-none"
          onClick={fecharChatMobile}
          aria-label="Voltar para a lista de contatos"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white"
          style={{ backgroundColor: contato.av ?? '#00A884' }}
        >
          {contato.initials ?? contato.nome.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <b className="block truncate text-[15.5px]">{contato.nome}</b>
          <span className="block truncate text-[12px] opacity-85">
            {contato.email} — {contato.assunto}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none"
            onClick={() => onAnexarAgenda(contato.id)}
            aria-label="Anexar e-mail à agenda"
          >
            <CalendarPlus className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none"
            onClick={alternarAgenda}
            aria-label="Mostrar ou ocultar agenda"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        className="messages flex-1 overflow-y-auto px-[8%] py-5"
        style={{
          backgroundColor: 'var(--bg-chat)',
          backgroundImage: 'radial-gradient(var(--dot) 1.1px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      >
        {itens.map((item, i) => {
          if (item.tipo === 'sep') {
            return (
              <div key={`sep-${i}`} className="date-sep mx-auto my-3 w-fit rounded-lg bg-white/85 px-3 py-1 text-[11.5px] text-[var(--text-2)] shadow-[0_1px_1px_rgba(0,0,0,0.08)]">
                {item.label}
              </div>
            );
          }
          const m = item.mensagem as Mensagem;
          return <BolhaMensagem key={m.id} mensagem={m} tail={Boolean(item.tail)} />;
        })}
      </div>

      <footer className="composer flex items-center gap-2 border-t border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-2)] transition-colors hover:bg-[var(--bg-sidebar)] focus-visible:outline-none"
          onClick={() => notificar('Seleção de arquivo (protótipo)')}
          aria-label="Anexar arquivo"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escreva sua resposta..."
          aria-label="Escreva sua resposta"
          className="composer-input min-w-0 flex-1 rounded-full border-none bg-[var(--bg-sidebar)] px-4 py-2.5 text-[14px] text-[var(--text)] outline-none shadow-[inset_0_0_0_1px_var(--border)] placeholder:text-[var(--text-2)]"
        />
        <button
          type="button"
          className="send-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-transform hover:scale-105 focus-visible:outline-none"
          onClick={enviar}
          aria-label="Enviar resposta"
        >
          <Send className="h-5 w-5" />
        </button>
      </footer>
    </section>
  );
}

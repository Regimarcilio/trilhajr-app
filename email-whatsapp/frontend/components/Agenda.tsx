'use client';

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAgendaDoDia, useAgendaDoMes, useContatos, useRemoverPostIt } from '@/hooks/useMailChat';
import { useMailChatStore } from '@/store/useMailChatStore';
import { montarChave } from '@/lib/time';
import { PostIt } from '@/components/PostIt';

const DOW = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

interface AgendaProps {
  onSelectEmail: (emailId: number) => void;
}

export function Agenda({ onSelectEmail }: AgendaProps) {
  const agendaAberta = useMailChatStore((s) => s.agendaAberta);
  const alternarAgenda = useMailChatStore((s) => s.alternarAgenda);
  const diaSelecionado = useMailChatStore((s) => s.diaSelecionado);
  const selecionarDia = useMailChatStore((s) => s.selecionarDia);
  const abrirPostit = useMailChatStore((s) => s.abrirPostit);
  const { data: postitsDia } = useAgendaDoDia(diaSelecionado);
  const { data: contatosData } = useContatos();
  const ano = Number(diaSelecionado.split('-')[0]);
  const mes = Number(diaSelecionado.split('-')[1]) - 1;
  const mesKey = `${ano}-${String(mes + 1).padStart(2, '0')}`;
  const { data: postitsMes } = useAgendaDoMes(mesKey);
  const removerPostIt = useRemoverPostIt();
  const [cal, setCal] = useState(() => ({ ano: new Date().getFullYear(), mes: new Date().getMonth() }));

  const postitsDoMes = useMemo(() => postitsMes ?? [], [postitsMes]);
  const diasComPostit = useMemo(() => new Set(postitsDoMes.map((p) => p.day)), [postitsDoMes]);

  const primeiro = new Date(cal.ano, cal.mes, 1);
  const startDay = primeiro.getDay();
  const totalDias = new Date(cal.ano, cal.mes + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startDay; i += 1) cells.push(null);
  for (let d = 1; d <= totalDias; d += 1) cells.push(montarChave(cal.ano, cal.mes, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const hoje = new Date();
  const hojeKey = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  const postitsDoDia = postitsDia ?? [];
  const postitsOrdenados = [...postitsDoDia].sort((a, b) => a.time.localeCompare(b.time));

  const labelDia = useMemo(() => {
    const [y, m, d] = diaSelecionado.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const nome = dt.toLocaleDateString('pt-BR', { weekday: 'long' });
    const mesNome = dt.toLocaleDateString('pt-BR', { month: 'long' });
    return `${nome} ${dt.getDate()} de ${mesNome}`;
  }, [diaSelecionado]);

  if (!agendaAberta) return null;

  const contatos = contatosData?.contatos ?? [];

  return (
    <aside className="agenda flex w-[360px] min-w-[360px] flex-col bg-[var(--bg-sidebar)] text-[var(--text)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
        <b className="text-[16px]">Agenda</b>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-2)] transition-colors hover:bg-[var(--panel)] focus-visible:outline-none"
          onClick={alternarAgenda}
          aria-label="Fechar agenda"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="calendar-card mx-3.5 mt-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3">
        <div className="flex items-center justify-between pb-2">
          <b className="text-[13.5px] capitalize text-[var(--text)]">
            {new Date(cal.ano, cal.mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </b>
          <div className="flex gap-1">
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-2)] transition-colors hover:bg-[var(--bg-sidebar)] focus-visible:outline-none"
              onClick={() => setCal((c) => (c.mes === 0 ? { ano: c.ano - 1, mes: 11 } : { ...c, mes: c.mes - 1 }))}
              aria-label="Mês anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-2)] transition-colors hover:bg-[var(--bg-sidebar)] focus-visible:outline-none"
              onClick={() => setCal((c) => (c.mes === 11 ? { ano: c.ano + 1, mes: 0 } : { ...c, mes: c.mes + 1 }))}
              aria-label="Próximo mês"
            >
              ›
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {DOW.map((d, i) => (
            <div key={i} className="py-1 text-center text-[10.5px] font-semibold text-[var(--text-2)]">
              {d}
            </div>
          ))}
          {cells.map((key, i) => {
            if (!key) return <div key={`b-${i}`} />;
            const dNum = Number(key.split('-')[2]);
            const ativo = key === diaSelecionado;
            const hoje = key === hojeKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selecionarDia(key)}
                className={
                  'relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-[12.5px] transition-colors focus-visible:outline-none ' +
                  (ativo
                    ? 'bg-[var(--accent)] font-bold text-white'
                    : 'text-[var(--text)] hover:bg-[var(--bg-sidebar)]') +
                  (hoje && !ativo ? ' font-bold text-[var(--accent)]' : '')
                }
              >
                {dNum}
                {diasComPostit.has(key) ? (
                  <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${ativo ? 'bg-white' : 'bg-[var(--accent)]'}`} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="agenda-body flex-1 overflow-y-auto px-3.5 pb-5">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-[var(--accent-2)] px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none"
            onClick={() => abrirPostit(null)}
          >
            <Plus className="h-3.5 w-3.5" />
            Novo post-it
          </button>
        </div>
        <div className="mb-1 text-[13px] font-bold capitalize text-[var(--text)]">{labelDia}</div>
        {postitsDoDia.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-[12.5px] text-[var(--text-2)]">
            Nenhum compromisso neste dia.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {postitsOrdenados.map((p, i) => (
              <PostIt
                key={p.id}
                postit={p}
                index={i}
                contato={p.emailId ? contatos.find((c) => c.id === p.emailId) ?? null : null}
                onRemove={(id) => removerPostIt.mutate(id)}
                onSelectEmail={onSelectEmail}
              />
            ))}
          </div>
        )}
        <p className="mt-4 text-center text-[11.5px] leading-relaxed text-[var(--text-2)]">
          Use o botão de calendário no topo do e-mail para anexar a conversa a um compromisso.
        </p>
      </div>
    </aside>
  );
}

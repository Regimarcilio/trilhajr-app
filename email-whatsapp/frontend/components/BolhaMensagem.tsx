import { Check, CheckCheck } from 'lucide-react';
import type { Mensagem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CartaoArtefato } from './CartaoArtefato';

interface BolhaMensagemProps {
  mensagem: Mensagem;
  tail: boolean;
}

export function BolhaMensagem({ mensagem, tail }: BolhaMensagemProps) {
  const outbound = mensagem.de === 'me';

  return (
    <div className={cn('msg-row', outbound ? 'out' : 'in')}>
      <div
        className={cn(
          'msg max-w-[64%] rounded-[9px] px-2.5 py-1.5 text-sm leading-relaxed shadow-[0_1px_1px_rgba(0,0,0,0.12)]',
          outbound
            ? 'bg-[var(--bubble-out)] text-[var(--bubble-out-text)]'
            : 'bg-[var(--bubble-in)] text-[var(--text)]',
          tail ? (outbound ? 'msg-tail-out' : 'msg-tail-in') : '',
        )}
      >
        {mensagem.artefato ? <CartaoArtefato artefato={mensagem.artefato} /> : null}
        {mensagem.texto ? <span className="msg-text whitespace-pre-wrap">{mensagem.texto}</span> : null}
        <div className="msg-time mt-1 flex items-center justify-end gap-1 text-[10.5px] text-[var(--text-2)]">
          {new Date(mensagem.em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          {outbound ? (
            <span className={cn('flex items-center', mensagem.status === 'read' ? 'text-[var(--tick)]' : 'text-[var(--text-2)]')}>
              {mensagem.status === 'read' ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

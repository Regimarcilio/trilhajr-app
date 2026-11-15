import { MOCK_CONTATOS, MOCK_POSTITS, novoId } from '../mock/data';
import type { AgendaPostIt, Contato, ContatoListResponse, NovoPostItInput } from '../types';

const contatos = structuredClone(MOCK_CONTATOS);
const postits = structuredClone(MOCK_POSTITS);

const latencia = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function cloneContato(c: Contato): Contato {
  return structuredClone(c);
}

function clonePostit(p: AgendaPostIt): AgendaPostIt {
  return { ...p };
}

function proximoPostItId(): number {
  return postits.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

/**
 * Mock dos contratos da MailChat:
 * - GET    /api/contatos
 * - GET    /api/contatos/:id/conversa
 * - POST   /api/conversas/:id/respostas
 * - POST   /api/postits
 * - GET    /api/agenda?data=YYYY-MM-DD
 * - GET    /api/agenda?mes=YYYY-MM
 */
export const api = {
  contatos: {
    listar: async (): Promise<ContatoListResponse> => {
      await latencia();
      return { contatos: contatos.map((c) => cloneContato(c)) };
    },
  },
  conversas: {
    obter: async (id: number): Promise<Contato> => {
      await latencia();
      const contato = contatos.find((c) => c.id === id);
      if (!contato) {
        throw new Error(`Conversa não encontrada: ${id}`);
      }
      return cloneContato(contato);
    },
    responder: async (id: number, texto: string): Promise<Contato> => {
      await latencia();
      const contato = contatos.find((c) => c.id === id);
      if (!contato) {
        throw new Error(`Conversa não encontrada: ${id}`);
      }
      const mensagem = {
        id: novoId('m'),
        de: 'me' as const,
        texto,
        em: new Date().toISOString(),
        status: 'sent' as const,
      };
      contato.mensagens.push(mensagem);
      return cloneContato(contato);
    },
  },
  postits: {
    criar: async (input: NovoPostItInput): Promise<AgendaPostIt> => {
      await latencia();
      const postit: AgendaPostIt = { id: proximoPostItId(), ...input };
      postits.push(postit);
      return clonePostit(postit);
    },
    remover: async (id: number): Promise<void> => {
      await latencia();
      const idx = postits.findIndex((p) => p.id === id);
      if (idx >= 0) postits.splice(idx, 1);
    },
  },
  agenda: {
    listarPorDia: async (data: string): Promise<AgendaPostIt[]> => {
      await latencia();
      return postits
        .filter((p) => p.day === data)
        .map(clonePostit)
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    listarDoMes: async (mes: string): Promise<AgendaPostIt[]> => {
      await latencia();
      return postits.filter((p) => p.day.startsWith(mes)).map(clonePostit);
    },
  },
};

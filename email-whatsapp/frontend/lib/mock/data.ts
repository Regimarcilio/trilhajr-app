import type { AgendaPostIt, Contato, EmailConfiguracao } from '../types';

let seq = 100;

export function novoId(prefixo: string): string {
  seq += 1;
  return `${prefixo}-${seq}`;
}

export const MOCK_CONTATOS: Contato[] = [
  {
    id: 1,
    nome: 'Ana Souza',
    email: 'ana.souza@empresa.com',
    assunto: 'Proposta Comercial — Projeto Aurora',
    nao_lidos: 2,
    initials: 'AS',
    av: '#0E9F6E',
    mensagens: [
      {
        id: 'm-1-1',
        de: 'remetente',
        remetente: 'Ana Souza',
        texto: 'Bom dia! Conforme conversamos, segue a proposta comercial para o Projeto Aurora com o escopo completo.',
        em: '2026-11-14T09:12:00',
        artefato: { tipo: 'pdf', nome: 'Proposta_Comercial_Aurora_v2.pdf', tamanho: '2.4 MB' },
      },
      {
        id: 'm-1-2',
        de: 'me',
        texto: 'Bom dia, Ana! Recebi. Vou revisar os valores e te retorno até sexta.',
        em: '2026-11-14T09:20:00',
        status: 'read',
      },
      {
        id: 'm-1-3',
        de: 'remetente',
        remetente: 'Ana Souza',
        texto: 'Perfeito. Incluí também a planilha de investimentos por fase.',
        em: '2026-11-14T09:42:00',
      },
      {
        id: 'm-1-4',
        de: 'remetente',
        remetente: 'Ana Souza',
        texto: '',
        em: '2026-11-14T09:42:00',
        artefato: { tipo: 'xls', nome: 'Investimentos_Aurora_fases.xlsx', tamanho: '1.1 MB' },
      },
      {
        id: 'm-1-5',
        de: 'remetente',
        remetente: 'Ana Souza',
        texto: 'Qualquer dúvida, me chama.',
        em: '2026-11-14T09:43:00',
      },
    ],
  },
  {
    id: 2,
    nome: 'Carlos Mendes',
    email: 'carlos@freela.dev',
    assunto: 'Re: Entrega do módulo de pagamentos',
    nao_lidos: 0,
    initials: 'CM',
    av: '#0A7CFF',
    mensagens: [
      {
        id: 'm-2-1',
        de: 'me',
        texto: 'Carlos, subi a build de homologação. O webhook de confirmação está estável.',
        em: '2026-11-13T18:02:00',
        status: 'read',
      },
      {
        id: 'm-2-2',
        de: 'remetente',
        remetente: 'Carlos Mendes',
        texto: 'Show. Rodando os testes aqui. Achei um edge case no estorno.',
        em: '2026-11-13T18:20:00',
      },
      {
        id: 'm-2-3',
        de: 'remetente',
        remetente: 'Carlos Mendes',
        texto: 'Consegui reproduzir: estorno parcial com cartão expirado.',
        em: '2026-11-13T08:58:00',
        artefato: { tipo: 'log', nome: 'estorno_edge_case.log', tamanho: '48 KB' },
      },
      {
        id: 'm-2-4',
        de: 'me',
        texto: 'Entendi. Vou corrigir hoje e gero nova build.',
        em: '2026-11-13T09:05:00',
        status: 'read',
      },
    ],
  },
  {
    id: 3,
    nome: 'Marina Lima',
    email: 'marina@studio.design',
    assunto: 'Atualização do brandbook v3',
    nao_lidos: 0,
    initials: 'ML',
    av: '#DB2777',
    mensagens: [
      {
        id: 'm-3-1',
        de: 'remetente',
        remetente: 'Marina Lima',
        texto: 'Atualizei o brandbook com a nova paleta e os usos de grid.',
        em: '2026-11-14T10:15:00',
        artefato: { tipo: 'pdf', nome: 'Brandbook_Estudio_v3.pdf', tamanho: '18.7 MB' },
      },
      {
        id: 'm-3-2',
        de: 'me',
        texto: 'Marina, ficou incrível. Aprovado para seguir com os decks.',
        em: '2026-11-14T10:30:00',
        status: 'read',
      },
    ],
  },
  {
    id: 4,
    nome: 'Pedro Alvares',
    email: 'pedro.alvares@juridico.adv',
    assunto: 'Contrato de prestação de serviços — revisão',
    nao_lidos: 1,
    initials: 'PA',
    av: '#7C3AED',
    mensagens: [
      {
        id: 'm-4-1',
        de: 'remetente',
        remetente: 'Pedro Alvares',
        texto: 'Segue a minuta revisada com as alterações da cláusula 12.',
        em: '2026-11-14T11:02:00',
        artefato: { tipo: 'docx', nome: 'Contrato_Prestacao_Rev4.docx', tamanho: '96 KB' },
      },
      {
        id: 'm-4-2',
        de: 'remetente',
        remetente: 'Pedro Alvares',
        texto: 'Precisamos fechar até dia 20.',
        em: '2026-11-14T11:05:00',
      },
    ],
  },
  {
    id: 5,
    nome: 'Equipe Nuvem',
    email: 'nuvem@startup.io',
    assunto: 'Invoice #2026-041 — vencimento',
    nao_lidos: 0,
    initials: 'EN',
    av: '#D97706',
    mensagens: [
      {
        id: 'm-5-1',
        de: 'remetente',
        remetente: 'Equipe Nuvem',
        texto: 'Faturamento referente ao ciclo de outubro.',
        em: '2026-11-14T12:40:00',
        artefato: { tipo: 'pdf', nome: 'Invoice_2026-041.pdf', tamanho: '210 KB' },
      },
      {
        id: 'm-5-2',
        de: 'me',
        texto: 'Recebido. Pagamento agendado para 15/11.',
        em: '2026-11-14T12:55:00',
        status: 'read',
      },
    ],
  },
  {
    id: 6,
    nome: 'João Ribeiro',
    email: 'joao.ribeiro@cliente.com',
    assunto: 'Dúvidas sobre o cronograma',
    nao_lidos: 0,
    initials: 'JR',
    av: '#0891B2',
    mensagens: [
      {
        id: 'm-6-1',
        de: 'remetente',
        remetente: 'João Ribeiro',
        texto: 'Olá! Como ficam as entregas da sprint 12 com o feriado?',
        em: '2026-11-14T13:20:00',
      },
      {
        id: 'm-6-2',
        de: 'remetente',
        remetente: 'João Ribeiro',
        texto: 'Consigo adiantar a homologação na quarta.',
        em: '2026-11-14T13:20:00',
      },
    ],
  },
];

export const MOCK_POSTITS: AgendaPostIt[] = [
  { id: 1, day: '2026-11-10', time: '14:00', title: 'Call com Ana — Proposta Aurora', color: 'yellow', emailId: 1 },
  { id: 2, day: '2026-11-11', time: '10:30', title: 'Revisão do contrato — cláusula 12', color: 'blue', emailId: 4 },
  { id: 3, day: '2026-11-13', time: '16:00', title: 'Enviar invoice e conferir pagamento', color: 'green', emailId: null },
];

export const MOCK_CONFIGURACAO: EmailConfiguracao = {
  nome: 'Conta pessoal',
  email: 'nao configurado',
  imapServidor: 'imap.mailchat.com',
  imapPorta: 993,
  smtpServidor: 'smtp.mailchat.com',
  smtpPorta: 587,
  senha: '',
};

export const DIA_INICIAL = '2026-11-13';

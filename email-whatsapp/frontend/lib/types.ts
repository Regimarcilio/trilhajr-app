export const TEMA_WHATSAPP = 'whatsapp';
export const TEMA_OCEANO = 'oceano';
export const TEMA_VIOLETA = 'violeta';
export const TEMA_ROSA = 'rosa';
export const TEMA_NOTURNO = 'noturno';

export type TemaId = 'whatsapp' | 'oceano' | 'violeta' | 'rosa' | 'noturno';

export interface Tema {
  id: TemaId;
  nome: string;
  cor: string;
  swatch: string;
}

export const TEMAS: Tema[] = [
  { id: 'whatsapp', nome: 'Verde', cor: '#25D366', swatch: '#00A884' },
  { id: 'oceano', nome: 'Azul', cor: '#0A7CFF', swatch: '#0A7CFF' },
  { id: 'violeta', nome: 'Violeta', cor: '#7C3AED', swatch: '#7C3AED' },
  { id: 'rosa', nome: 'Rosa', cor: '#E11D48', swatch: '#E11D48' },
  { id: 'noturno', nome: 'Escuro', cor: '#202C33', swatch: '#111B21' },
];

export type ArtefatoTipo = 'pdf' | 'docx' | 'xls' | 'log' | 'img';

export interface Artefato {
  tipo: ArtefatoTipo;
  nome: string;
  tamanho: string;
}

export type MensagemDe = 'remetente' | 'me';

export type MensagemStatus = 'sent' | 'read';

export interface Mensagem {
  id: string;
  de: MensagemDe;
  remetente?: string;
  texto: string;
  em: string;
  status?: MensagemStatus;
  artefato?: Artefato;
}

export interface Contato {
  id: number;
  nome: string;
  email: string;
  assunto: string;
  nao_lidos: number;
  mensagens: Mensagem[];
  initials?: string;
  av?: string;
}

export interface ContatoMeta {
  versao: string;
  fonte: string;
  gerado_em: string;
  status: string;
}

export interface ContatoListResponse {
  contatos: Contato[];
  meta?: ContatoMeta;
}

export type PostItCor = 'yellow' | 'pink' | 'blue' | 'green';

export interface AgendaPostIt {
  id: number;
  day: string;
  time: string;
  title: string;
  color: PostItCor;
  emailId: number | null;
}

export interface NovoPostItInput {
  day: string;
  time: string;
  title: string;
  color: PostItCor;
  emailId: number | null;
}

export interface EmailConfiguracao {
  nome: string;
  email: string;
  imapServidor: string;
  imapPorta: number;
  smtpServidor: string;
  smtpPorta: number;
  senha: string;
}

export interface ToastMsg {
  id: number;
  texto: string;
}

const MESES_3 = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

function chaveData(d: Date): string {
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

function hojeKey(): string {
  return chaveData(new Date());
}

function ontemKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return chaveData(d);
}

function parseEm(em: string): Date {
  const d = new Date(em);
  if (Number.isNaN(d.getTime())) {
    return new Date();
  }
  return d;
}

/** "HH:MM" para hoje, "ontem HH:MM" para ontem, "dd/MM HH:MM" para outros dias. */
export function formatarHoraMensagem(em: string): string {
  const d = parseEm(em);
  const hora = `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
  if (chaveData(d) === hojeKey()) return hora;
  if (chaveData(d) === ontemKey()) return `ontem ${hora}`;
  const [ano, mes, dia] = chaveData(d).split('-').map(Number);
  return `${doisDigitos(dia)} de ${MESES_3[mes - 1]} de ${ano} ${hora}`;
}

/** Rótulo de separador temporal da conversa. */
export function formatarDataSeparador(em: string): string {
  const d = parseEm(em);
  const chave = chaveData(d);
  if (chave === hojeKey()) return 'Hoje';
  if (chave === ontemKey()) return 'Ontem';
  const [ano, mes, dia] = chave.split('-').map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "novembro de 2026" — usado no título do mini-calendário. */
export function formatarMesAno(ano: number, mes: number): string {
  return new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function rotuloDiaSemana(key: string): string {
  const [ano, mes, dia] = key.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia);
  const nome = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  return `${nome} de ${d.getDate()} de ${d.getFullYear()}`.replace(/^./, (c) => c.toUpperCase());
}

export function rotuloDiaCurto(key: string): string {
  const [ano, mes, dia] = key.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function ehDiaAtual(key: string): boolean {
  return key === hojeKey();
}

export function ehDiaSelecionado(key: string, selecionado: string): boolean {
  return key === selecionado;
}

export function montarChave(ano: number, mes: number, dia: number): string {
  return `${ano}-${doisDigitos(mes + 1)}-${doisDigitos(dia)}`;
}

export function montarData(ano: number, mes: number, dia: number): Date {
  return new Date(ano, mes, dia);
}

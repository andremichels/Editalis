/**
 * Formatação de exibição compartilhada: datas, rótulos e títulos.
 *
 * Toda tela deve passar por aqui em vez de formatar por conta própria —
 * antes cada lista tinha o seu jeito (datas com fuso errado, "pregao_eletronico"
 * cru, título genérico "AVISO DE LICITAÇÃO" em todos os itens).
 */
import type { Article } from './types';

// ── Datas ──────────────────────────────────────────────────────────────────

/**
 * Converte "AAAA-MM-DD" (ou ISO completo) em Date local. Datas puras são
 * tratadas como meia-noite local — `new Date("2026-07-03")` vira UTC e, no
 * fuso de Brasília, aparece como 02/07.
 */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const pure = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = new Date(pure ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Formato curto, sempre com ano: 03/07/2026 */
export function formatDateShort(value?: string | null): string {
  const d = parseDate(value);
  return d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
}

/** Formato longo: 3 de julho de 2026 */
export function formatDateLong(value?: string | null): string {
  const d = parseDate(value);
  return d ? d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

/** Data e hora curtas: 03/07/2026, 14:05 */
export function formatDateTime(value?: string | null): string {
  const d = parseDate(value);
  return d
    ? d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';
}

/** Dias inteiros até a data (negativo = já passou). */
export function daysUntil(value?: string | null): number | null {
  const d = parseDate(value);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** "abertura hoje" / "abertura amanhã" / "abertura em 5 dias" */
export function openingLabel(days: number): string {
  if (days === 0) return 'abertura hoje';
  if (days === 1) return 'abertura amanhã';
  return `abertura em ${days} dias`;
}

// ── Valores ────────────────────────────────────────────────────────────────

export function formatMoney(value?: number | string | null): string {
  if (value == null || value === '') return '';
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

// ── Rótulos ────────────────────────────────────────────────────────────────

export const MODALITY_LABELS: Record<string, string> = {
  pregao: 'Pregão',
  pregao_eletronico: 'Pregão eletrônico',
  pregao_presencial: 'Pregão presencial',
  concorrencia: 'Concorrência',
  concorrencia_eletronica: 'Concorrência eletrônica',
  dispensa: 'Dispensa',
  inexigibilidade: 'Inexigibilidade',
  tomada_precos: 'Tomada de preços',
  concurso: 'Concurso',
  leilao: 'Leilão',
  credenciamento: 'Credenciamento',
  pre_qualificacao: 'Pré-qualificação',
  chamamento_publico: 'Chamamento público',
  chamada_publica: 'Chamada pública',
  convite: 'Convite',
  rdc: 'RDC',
  dialogo_competitivo: 'Diálogo competitivo',
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  licitacao: 'Aviso de licitação',
  contrato: 'Contrato',
  aditivo: 'Termo aditivo',
  rescisao: 'Rescisão',
  dispensa: 'Dispensa',
  inexigibilidade: 'Inexigibilidade',
  adjudicacao: 'Adjudicação',
  homologacao: 'Homologação',
  suspensao: 'Suspensão',
  revogacao: 'Revogação',
  anulacao: 'Anulação',
  retificacao: 'Retificação',
  resultado: 'Resultado',
  nomeacao: 'Nomeação',
  exoneracao: 'Exoneração',
  portaria: 'Portaria',
  acordo: 'Acordo de cooperação',
  convenio: 'Convênio',
};

/** Palavras-chave/tags geradas pelo normalizador, sem acento. */
export const KEYWORD_LABELS: Record<string, string> = {
  obras: 'Obras',
  reforma: 'Reforma',
  construcao: 'Construção',
  materiais: 'Materiais',
  equipamentos: 'Equipamentos',
  servicos: 'Serviços',
  manutencao: 'Manutenção',
  ti: 'TI',
  saude: 'Saúde',
  educacao: 'Educação',
  limpeza: 'Limpeza',
  seguranca: 'Segurança',
  transporte: 'Transporte',
  alimentacao: 'Alimentação',
  combustivel: 'Combustível',
  iluminacao: 'Iluminação',
  drenagem: 'Drenagem',
  pavimentacao: 'Pavimentação',
  saneamento: 'Saneamento',
  medicamentos: 'Medicamentos',
  consultoria: 'Consultoria',
  publicidade: 'Publicidade',
  eventos: 'Eventos',
  capacitacao: 'Capacitação',
};

/** Fallback para valores desconhecidos: "tomada_precos" → "Tomada precos". */
function humanize(raw: string): string {
  const s = raw.replace(/_/g, ' ').trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function modalityLabel(raw?: string | null): string {
  if (!raw) return '';
  return MODALITY_LABELS[raw.toLowerCase()] ?? humanize(raw);
}

export function docTypeLabel(raw?: string | null): string {
  if (!raw) return '';
  return DOC_TYPE_LABELS[raw.toLowerCase()] ?? humanize(raw);
}

export function keywordLabel(raw?: string | null): string {
  if (!raw) return '';
  return KEYWORD_LABELS[raw.toLowerCase()] ?? humanize(raw);
}

// ── Títulos de publicação ──────────────────────────────────────────────────

/**
 * Cabeçalhos que só dizem o tipo do ato. Quando o título é um desses, todos os
 * itens da lista ficam iguais ("AVISO DE LICITAÇÃO", "EXTRATO DE CONTRATO"…),
 * então usamos o objeto como título e o tipo vira etiqueta.
 */
const GENERIC_HEADING = /^(aviso|extrato|termo|resultado|despacho|retifica[çc][ãa]o|errata|edital|ata|homologa[çc][ãa]o|adjudica[çc][ãa]o|revoga[çc][ãa]o|anula[çc][ãa]o|suspens[ãa]o|rescis[ãa]o|julgamento|apostilamento|comunicado|reratifica[çc][ãa]o)\b[^\d]{0,60}$/i;

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

const LOWER_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'ao', 'aos', 'à', 'às', 'que', 'se', 'um', 'uma']);

/**
 * Texto todo em maiúsculas → só a primeira letra maiúscula, preservando
 * siglas curtas (FCP, MCOM, TI) e códigos com barra (SEDEC/MIDR).
 */
function sentenceCase(s: string): string {
  const letters = s.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length < 8) return s;
  const upper = letters.replace(/[^A-ZÀ-Þ]/g, '').length;
  if (upper / letters.length < 0.7) return s;
  const out = s
    .split(/(\s+)/)
    .map((tok) => {
      const word = tok.replace(/[^A-Za-zÀ-ÿ]/g, '');
      const isAcronym = (word.length >= 2 && word.length <= 4 && !LOWER_WORDS.has(word.toLowerCase())) || tok.includes('/');
      return isAcronym ? tok : tok.toLowerCase();
    })
    .join('');
  return out.charAt(0).toUpperCase() + out.slice(1);
}

function truncate(s: string, max: number): string {
  s = s.replace(/[,;:\s-]+$/, '');
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.\s-]+$/, '')}…`;
}

function headingOf(a: Article): string {
  return (a.title_marker || a.title || '').trim();
}

function isGenericHeading(h: string): boolean {
  return !h || GENERIC_HEADING.test(h);
}

/** Extrai o objeto do texto ("Objeto: ...") quando o normalizador não preencheu. */
function objectFromContent(a: Article): string | null {
  const text = stripTags(a.content || a.excerpt || '');
  const m = text.match(/\bobjeto\s*(?:do\s+contrato|da\s+licita[çc][ãa]o)?\s*[:\-–]\s*(.{12,400}?)(?:\.\s|;\s|\s(?:valor|vig[êe]ncia|prazo|data|contratad[ao]|fundamento|processo)\b|$)/i);
  return m ? m[1].trim() : null;
}

/**
 * Título descritivo da publicação: o objeto quando existe, senão o título
 * original (portarias e despachos já têm título distintivo), e por último o
 * começo do texto quando o título é só o tipo do ato.
 */
export function articleTitle(a: Article, max = 160): string {
  const nd = a.normalized_data;
  const heading = headingOf(a);
  const object = nd?.object_summary?.trim() || objectFromContent(a);
  if (object) return truncate(sentenceCase(object), max);
  if (!isGenericHeading(heading)) return truncate(sentenceCase(heading), max);

  const text = stripTags(a.content || a.excerpt || '');
  const body = heading && text.toUpperCase().startsWith(heading.toUpperCase()) ? text.slice(heading.length).trim() : text;
  if (body) return truncate(sentenceCase(body), max);
  return sentenceCase(heading) || 'Publicação do DOU';
}

/**
 * Etiqueta curta com o tipo do ato: "Aviso de licitação", "Portaria",
 * "Despacho"… Vem do cabeçalho original (o doc_type do normalizador às vezes
 * marca despachos e decisões como portaria); o doc_type só entra como fallback.
 */
export function articleKind(a: Article): string {
  const heading = headingOf(a);
  if (heading && isGenericHeading(heading)) {
    const lower = heading.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  const first = heading.split(/[\s,]+/)[0]?.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (first && first.length > 3) return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  return docTypeLabel(a.normalized_data?.doc_type) || 'Publicação';
}

/** Órgão mais específico disponível, para a linha abaixo do título. */
export function articleOrgan(a: Article): string {
  return a.organ_level_1 || a.organ || 'Diário Oficial da União';
}

// ── Trecho com destaque ────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Termos de uma consulta, sem operadores (AND/OR/NOT, -termo) e sem aspas. */
export function queryTerms(query: string): string[] {
  const phrases = [...query.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const rest = query
    .replace(/"[^"]*"/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !/^(and|or|not|e|ou|não|nao)$/i.test(t) && !t.startsWith('-'));
  return [...phrases, ...rest].map((t) => t.replace(/[()*]/g, '').trim()).filter((t) => t.length >= 3);
}

/**
 * Trecho do texto em torno da primeira ocorrência de um dos termos, com os
 * termos marcados em <mark>. O texto é escapado antes, então o HTML devolvido
 * é seguro para dangerouslySetInnerHTML.
 */
export function highlightSnippet(content: string | undefined, query: string, radius = 140): string {
  const text = stripTags(content || '');
  if (!text) return '';
  const terms = queryTerms(query);
  const folded = fold(text);
  let pos = -1;
  for (const t of terms) {
    const i = folded.indexOf(fold(t));
    if (i >= 0 && (pos < 0 || i < pos)) pos = i;
  }
  const start = pos < 0 ? 0 : Math.max(0, pos - radius / 2);
  const end = Math.min(text.length, start + radius * 2);
  let out = escapeHtml(text.slice(start, end));
  // marca as ocorrências comparando sem acento, preservando o texto original
  for (const t of terms) {
    const ft = fold(escapeHtml(t));
    if (!ft) continue;
    const fo = fold(out);
    let result = '';
    let last = 0;
    let idx = fo.indexOf(ft);
    while (idx >= 0) {
      result += out.slice(last, idx) + '<mark>' + out.slice(idx, idx + ft.length) + '</mark>';
      last = idx + ft.length;
      idx = fo.indexOf(ft, last);
    }
    out = result + out.slice(last);
  }
  return `${start > 0 ? '…' : ''}${out}${end < text.length ? '…' : ''}`;
}

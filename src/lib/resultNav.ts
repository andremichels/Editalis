/**
 * Lista da última busca (a página exibida), para o Detalhe mostrar
 * "Resultado 4 de 288" e ir para o anterior/próximo. Fica na aba (sessionStorage).
 */

const KEY = 'editalis_result_nav';

export interface ResultNav {
  q: string;
  total: number;
  /** posição do primeiro item da página na busca inteira */
  offset: number;
  slugs: string[];
}

export function saveResultNav(nav: ResultNav): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(nav));
  } catch {}
}

export interface ResultPosition {
  q: string;
  position: number; // 1-based
  total: number;
  prev: string | null;
  next: string | null;
}

/** Para useSyncExternalStore: o texto guardado é estável entre leituras. */
export const subscribeNav = () => () => {};
export function navSnapshot(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
export const navServer = () => null;

/** Onde esta publicação está na última busca, ou null se não veio de lá. */
export function resultPosition(slug: string, raw: string | null = navSnapshot()): ResultPosition | null {
  try {
    if (!raw) return null;
    const nav = JSON.parse(raw) as ResultNav;
    const i = nav.slugs.indexOf(slug);
    if (i < 0) return null;
    return {
      q: nav.q,
      position: nav.offset + i + 1,
      total: Math.max(nav.total, nav.offset + nav.slugs.length),
      prev: nav.slugs[i - 1] ?? null,
      next: nav.slugs[i + 1] ?? null,
    };
  } catch {
    return null;
  }
}

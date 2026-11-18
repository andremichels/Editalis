/**
 * Lembra de qual tela de lista o usuário abriu uma publicação, para o
 * "← Voltar" do detalhe levar de volta a ela (e não sempre ao Painel).
 * Navegar entre publicações semelhantes não sobrescreve a origem.
 */
const KEY = 'editalis_back';

const LISTS: Record<string, string> = {
  '/dashboard': 'Voltar ao painel',
  '/busca': 'Voltar à busca',
  '/busca/cnpj': 'Voltar à busca por CNPJ',
  '/favoritos': 'Voltar aos favoritos',
  '/alertas': 'Voltar aos alertas',
};

export function rememberListPage(pathname: string) {
  if (!(pathname in LISTS)) return;
  try {
    sessionStorage.setItem(KEY, pathname);
  } catch {}
}

const noop = () => () => {};

/** href de volta, para useSyncExternalStore (no servidor, sempre o painel). */
export function backHrefSnapshot(): string {
  return backTarget().href;
}
export function backHrefServer(): string {
  return '/dashboard';
}
export const subscribeBack = noop;

export function backLabel(href: string): string {
  return LISTS[href] ?? LISTS['/dashboard'];
}

export function backTarget(): { href: string; label: string } {
  let href = '/dashboard';
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved && saved in LISTS) href = saved;
  } catch {}
  return { href, label: LISTS[href] };
}

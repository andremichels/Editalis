import Link from 'next/link';

export function Header() {
  return (
    <header
      className="bg-white"
      style={{ borderBottom: '2px solid var(--color-divider)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span
              className="text-xl tracking-tight"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                color: 'var(--color-text)',
              }}
            >
              Editalis
            </span>
            <span
              className="hidden sm:inline text-xs"
              style={{ color: 'var(--color-neutral-500)' }}
            >
              Diário Oficial da União
            </span>
          </Link>
          <nav
            className="flex items-center gap-6 text-sm"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-neutral-600)' }}
          >
            <Link
              href="/"
              className="hover:text-[var(--color-text)] transition-colors font-semibold"
            >
              Buscar
            </Link>
            <Link
              href="/orgaos"
              className="hover:text-[var(--color-text)] transition-colors font-semibold"
            >
              Órgãos
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer
      className="bg-white mt-auto"
      style={{ borderTop: '2px solid var(--color-divider)' }}
    >
      <div
        className="mx-auto max-w-7xl px-4 py-6 text-xs"
        style={{ color: 'var(--color-neutral-500)' }}
      >
        Editalis — Dados do{' '}
        <a
          href="https://www.in.gov.br"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'var(--color-neutral-600)' }}
        >
          Diário Oficial da União
        </a>
      </div>
    </footer>
  );
}

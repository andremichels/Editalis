import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">Editalis</span>
            <span className="hidden sm:inline text-xs text-gray-400 font-normal">
              Diário Oficial da União
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Buscar
            </Link>
            <Link href="/orgaos" className="hover:text-gray-900 transition-colors">
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
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-gray-400">
        Editalis — Dados do Diário Oficial da União via{' '}
        <a
          href="https://www.in.gov.br"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          IN.gov.br
        </a>
      </div>
    </footer>
  );
}

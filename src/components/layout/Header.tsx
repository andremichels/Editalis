import Link from 'next/link';
import { Button } from '@/components/ui/Button';

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

export function MarketingHeader() {
  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-text)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-10">
        <div className="flex h-[76px] items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3.5">
            <span
              className="text-[22px] tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-text)' }}
            >
              EDITALIS
            </span>
            <span
              className="hidden sm:inline text-[11px] font-semibold uppercase"
              style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}
            >
              Consulta de licitações
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#produto" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Produto</a>
            <a href="#cobertura" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Cobertura</a>
            <a href="#planos" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Planos</a>
            <Link href="/login"><Button variant="outline" size="sm">Entrar</Button></Link>
            <Link href="/cadastro"><Button variant="primary" size="sm">Testar 7 dias</Button></Link>
          </nav>
          <Link href="/cadastro" className="md:hidden">
            <Button variant="primary" size="sm">Testar 7 dias</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer style={{ background: 'var(--color-text)', color: 'var(--color-neutral-400)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-10 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] text-sm">
        <div>
          <span className="text-xl font-black tracking-tight" style={{ color: '#fff', letterSpacing: '-0.03em' }}>EDITALIS</span>
          <p className="mt-3 leading-relaxed max-w-xs">Consulta e monitoramento de licitações a partir dos diários oficiais brasileiros.</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="font-bold" style={{ color: '#fff' }}>Produto</span>
          <a href="#produto">Busca</a>
          <a href="#produto">Alertas</a>
          <a href="#planos">Planos</a>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="font-bold" style={{ color: '#fff' }}>Empresa</span>
          <a href="#cobertura">Cobertura</a>
          <a href="#produto">Contato</a>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="font-bold" style={{ color: '#fff' }}>Legal</span>
          <a href="#produto">Termos</a>
          <a href="#produto">Privacidade · LGPD</a>
        </div>
      </div>
      <div
        className="mx-auto max-w-7xl px-4 sm:px-10 py-5 text-xs"
        style={{ borderTop: '1px solid var(--color-neutral-800)' }}
      >
        © 2026 Editalis Tecnologia Ltda · CNPJ 00.000.000/0001-00
      </div>
    </footer>
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

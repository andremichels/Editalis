'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { newMatchesCount, useAccount } from '@/lib/useAccount';
import { resetUser } from '@/lib/analytics';

interface NavItem {
  label: string;
  href: string;
  /** texto pequeno à direita (ex.: "+12" resultados nos alertas) */
  badge?: string;
  /** rótulo secundário, abaixo do item */
  hint?: string;
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { name, planLabel, alerts, lastViewed } = useAccount();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    resetUser();
    router.push('/login');
  };

  const matches = newMatchesCount(alerts);

  const navItems: NavItem[] = [
    { label: 'Painel', href: '/dashboard' },
    { label: 'Busca', href: '/busca' },
    { label: 'Favoritos', href: '/favoritos' },
    { label: 'Alertas', href: '/alertas', badge: matches > 0 ? `${matches} ${matches === 1 ? 'novo' : 'novos'}` : undefined },
    { label: 'Setores', href: '/setores' },
    { label: 'Minha conta', href: '/perfil' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto py-6" style={{ background: 'var(--color-text)', color: 'var(--color-neutral-300)' }}>
      <div className="px-5 pt-2 pb-7 mb-4" style={{ borderBottom: '1px solid #3a3735' }}>
        <div className="text-[18px] font-extrabold tracking-[0.02em]" style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}>
          EDITALIS
        </div>
      </div>

      <nav className="flex flex-col">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-between h-11 px-5 text-sm ${active ? 'font-bold' : 'font-medium'}`}
              style={{
                background: active ? '#3a3735' : 'transparent',
                color: active ? '#fff' : '#e7e4e2',
                boxShadow: active ? 'inset 3px 0 0 var(--color-accent)' : 'none',
              }}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[12px] font-bold py-0.5 px-[7px]" style={{ background: 'var(--color-accent)', color: '#fff' }} title="Resultados novos nos seus alertas ativos">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {lastViewed && (
          <Link
            href={`/artigo/${lastViewed.slug}`}
            onClick={onNavigate}
            className="block px-5 py-3 mt-3"
            style={{ borderTop: '1px solid #3a3735' }}
            title={lastViewed.title}
          >
            <span className="block text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-neutral-400)' }}>
              Última consultada
            </span>
            <span className="block text-[13px] font-semibold mt-1 line-clamp-2" style={{ color: 'var(--color-neutral-200)' }}>
              {lastViewed.title}
            </span>
          </Link>
        )}
      </nav>

      <div className="mt-auto px-5 pt-5 pb-10" style={{ borderTop: '1px solid #3a3735' }}>
        <Link href="/perfil" className="block">
          <div className="text-[14px] font-bold" style={{ color: '#fff' }}>{name || ' '}</div>
          {planLabel && (
            <div className="text-[13px] mt-1" style={{ color: '#bdb8b5' }}>Plano {planLabel}</div>
          )}
        </Link>
        <button onClick={handleSignOut} className="text-[13px] mt-3 py-1 cursor-pointer underline" style={{ color: 'var(--color-neutral-300)' }}>
          Sair
        </button>
      </div>
    </div>
  );
}

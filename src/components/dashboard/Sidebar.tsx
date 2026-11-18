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
    { label: 'Alertas', href: '/alertas', badge: matches > 0 ? `+${matches}` : undefined },
    { label: 'Setores', href: '/setores' },
    { label: 'Minha conta', href: '/perfil' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto py-6" style={{ background: 'var(--color-text)', color: 'var(--color-neutral-300)' }}>
      <div className="px-5 pb-6 mb-5" style={{ borderBottom: '1px solid var(--color-neutral-800)' }}>
        <div className="text-[19px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}>
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
              className="flex items-center justify-between px-5 py-3 text-sm font-semibold"
              style={{
                background: active ? 'var(--color-neutral-800)' : 'transparent',
                color: active ? '#fff' : 'var(--color-neutral-300)',
                boxShadow: active ? 'inset 4px 0 0 #fff' : 'none',
              }}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[11px] font-bold" title="Resultados nos seus alertas ativos">
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
            style={{ borderTop: '1px solid var(--color-neutral-800)' }}
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

      <div className="mt-auto px-5 pt-5 pb-10" style={{ borderTop: '1px solid var(--color-neutral-800)' }}>
        <Link href="/perfil" className="block">
          <div className="text-[13px] font-bold" style={{ color: '#fff' }}>{name || ' '}</div>
          {planLabel && (
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-neutral-400)' }}>Plano {planLabel}</div>
          )}
        </Link>
        <button onClick={handleSignOut} className="text-[13px] mt-3 py-1 cursor-pointer underline" style={{ color: 'var(--color-neutral-300)' }}>
          Sair
        </button>
      </div>
    </div>
  );
}

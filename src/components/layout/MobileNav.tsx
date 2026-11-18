'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { newMatchesCount, useAccount } from '@/lib/useAccount';
import { resetUser } from '@/lib/analytics';

const TABS: { label: string; href: string }[] = [
  { label: 'Painel', href: '/dashboard' },
  { label: 'Busca', href: '/busca' },
  { label: 'Favoritos', href: '/favoritos' },
  { label: 'Alertas', href: '/alertas' },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { name, alerts } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    resetUser();
    router.push('/login');
  };

  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const matches = newMatchesCount(alerts);
  const badges: Record<string, string | undefined> = { '/alertas': matches > 0 ? `+${matches}` : undefined };

  return (
    <>
      {/* Top bar */}
      <div className="lg:hidden flex items-center justify-between px-5 py-3.5 sticky top-0 z-30" style={{ background: 'var(--color-text)' }}>
        <div className="text-[17px] font-black tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}>
          EDITALIS
        </div>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 flex items-center justify-center text-xs font-bold cursor-pointer shrink-0"
          style={{ border: '2px solid var(--color-neutral-600)', color: '#fff', background: 'transparent' }}
          aria-label="Menu da conta"
        >
          {initials}
        </button>
      </div>

      {/* Account dropdown */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-[52px] right-3 min-w-[180px]"
            style={{ background: 'var(--color-bg)', border: '2px solid var(--color-text)' }}
          >
            <Link
              href="/perfil"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-bold"
              style={{ borderBottom: '1px solid var(--color-divider)', color: 'var(--color-text)' }}
            >
              Minha conta
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-3 text-sm font-bold cursor-pointer"
              style={{ color: 'var(--color-text)' }}
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4"
        style={{ background: 'var(--color-neutral-100)', borderTop: '2px solid var(--color-text)' }}
      >
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const badge = badges[tab.href];
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5"
              style={{
                borderTop: active ? '3px solid var(--color-text)' : '3px solid transparent',
                marginTop: '-2px',
                color: active ? 'var(--color-text)' : 'var(--color-neutral-700)',
                minHeight: 44,
              }}
            >
              <span className="text-[11px] font-bold">{tab.label}</span>
              {badge && (
                <span className="text-[10px] font-bold" style={{ color: 'var(--color-neutral-700)' }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

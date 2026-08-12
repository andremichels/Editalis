'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { useFavorites } from '@/lib/useFavorites';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

const TABS: { label: string; href: string }[] = [
  { label: 'Painel', href: '/dashboard' },
  { label: 'Buscar', href: '/busca' },
  { label: 'Favoritas', href: '/favoritos' },
  { label: 'Alertas', href: '/alertas' },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { favorites } = useFavorites();
  const [name, setName] = useState('');
  const [alertCount, setAlertCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setName(user?.user_metadata?.nome || user?.email?.split('@')[0] || '');
      if (user) {
        fetch(`${API_BASE}/api/v1/alerts?user_id=${user.id}`)
          .then((r) => r.json())
          .then((alerts: { id: number }[]) => setAlertCount(alerts.length))
          .catch(() => {});
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const counts: Record<string, number> = { '/favoritos': favorites.size, '/alertas': alertCount };

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
          const count = counts[tab.href];
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5"
              style={{
                borderTop: active ? '3px solid var(--color-accent)' : '3px solid transparent',
                marginTop: '-2px',
                color: active ? 'var(--color-accent)' : 'var(--color-neutral-600)',
                minHeight: 44,
              }}
            >
              <span className="text-[11px] font-bold">{tab.label}</span>
              {!!count && (
                <span className="text-[10px] font-bold" style={{ color: active ? 'var(--color-accent)' : 'var(--color-neutral-500)' }}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

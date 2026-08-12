'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { authFetch } from '@/lib/api';
import { useFavorites } from '@/lib/useFavorites';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

interface NavItem {
  label: string;
  href?: string;
  count?: number;
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('');
  const [alertCount, setAlertCount] = useState(0);
  const { favorites } = useFavorites();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setName(user?.user_metadata?.nome || user?.email?.split('@')[0] || '');
      if (user) {
        authFetch(`${API_BASE}/api/v1/alerts`)
          .then(r => r.json())
          .then((alerts: any[]) => setAlertCount(alerts.length))
          .catch(() => {});
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const favCount = favorites.size;

  const navItems: NavItem[] = [
    { label: 'Painel', href: '/dashboard' },
    { label: 'Busca', href: '/busca' },
    { label: 'Favoritas', href: '/favoritos', count: favCount },
    { label: 'Alertas', href: '/alertas', count: alertCount },
    { label: 'Última consultada' },
    { label: 'Minha conta', href: '/perfil' },
  ];

  return (
    <div className="flex flex-col py-6" style={{ background: 'var(--color-text)', color: 'var(--color-neutral-400)' }}>
      <div className="px-5 pb-6 mb-5" style={{ borderBottom: '1px solid var(--color-neutral-800)' }}>
        <div className="text-[19px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}>
          EDITALIS
        </div>
        <div className="text-[11px] uppercase mt-1" style={{ letterSpacing: '0.12em' }}>{name}</div>
      </div>

      <nav className="flex flex-col">
        {navItems.map((item) => {
          const active = item.href !== undefined && pathname === item.href;
          const content = (
            <>
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="text-[11px] font-bold opacity-80">{item.count}</span>
              )}
            </>
          );
          const className = 'flex items-center justify-between px-5 py-3 text-sm font-semibold';
          const style = { background: active ? 'var(--color-accent)' : 'transparent', color: active ? '#fff' : 'var(--color-neutral-400)' };

          if (!item.href) {
            return (
              <div key={item.label} className={className} style={{ ...style, opacity: 0.6, cursor: 'default' }}>
                {content}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className} style={style} onClick={onNavigate}>
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-5 pt-5" style={{ borderTop: '1px solid var(--color-neutral-800)' }}>
        <Link href="/perfil" className="block">
        <div className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>Plano Profissional</div>
        <div className="text-[13px] font-bold mt-0.5" style={{ color: '#fff' }}>{name || ' '}</div>
        </Link>
        <button onClick={handleSignOut} className="text-xs mt-2 cursor-pointer" style={{ color: 'var(--color-neutral-500)' }}>
          Sair
        </button>
      </div>
    </div>
  );
}

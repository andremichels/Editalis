'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';

interface NavItem {
  label: string;
  href?: string;
  count?: number;
}

// "Favoritas" and "Última consultada" have no dedicated screen in the design —
// favorites live inside /alertas, and "Última consultada" wasn't designed, so
// both render as inert (non-navigable) items instead of pointing at dead links.
const navItems: NavItem[] = [
  { label: 'Painel', href: '/dashboard' },
  { label: 'Busca', href: '/busca' },
  { label: 'Favoritas', count: 14 },
  { label: 'Alertas', href: '/alertas', count: 3 },
  { label: 'Última consultada' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setName(data.user?.user_metadata?.nome || data.user?.email || '');
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col py-6" style={{ background: 'var(--color-text)', color: 'var(--color-neutral-400)' }}>
      <div className="px-5 pb-6 mb-5" style={{ borderBottom: '1px solid var(--color-neutral-800)' }}>
        <div className="text-[19px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: '#fff' }}>
          EDITALIS
        </div>
        <div className="text-[11px] uppercase mt-1" style={{ letterSpacing: '0.12em' }}>Construtora Órion</div>
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
            <Link key={item.href} href={item.href} className={className} style={style}>
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

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DeadlinesCard } from '@/components/dashboard/DeadlinesCard';
import { FavoriteDeadlines, ProfilesCard } from '@/components/dashboard/ProfilesCard';
import { VerticalFeed, loadVerticalFeed, type VerticalFeedData } from '@/components/dashboard/VerticalFeed';
import { authFetch, getRecentArticles } from '@/lib/api';
import { daysUntil, formatMoneyCompact, parseDate } from '@/lib/format';
import { newMatchesCount, useAccount } from '@/lib/useAccount';
import { useFavorites } from '@/lib/useFavorites';
import type { Article } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

const openDays = (a: Article) => daysUntil(a.normalized_data?.opening_date);

/** Aberturas nos próximos 30 dias, sem repetir publicação, da mais próxima. */
function computeDeadlines(articles: Article[]): Article[] {
  const seen = new Set<number>();
  return articles
    .filter((a) => {
      const d = openDays(a);
      if (d == null || d < 0 || d > 30 || seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    })
    .sort((a, b) => (openDays(a) ?? 0) - (openDays(b) ?? 0));
}

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

function Kpi({ href, label, value, hint, tone, first }: { href: string; label: string; value: string; hint: string; tone?: string; first?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-1 py-5 ${first ? 'pr-5' : 'px-5'} hover:no-underline`}
      style={{ borderRight: '1px solid var(--color-line)' }}
    >
      <span className="text-[12px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-muted)' }}>{label}</span>
      <span className="text-[36px] font-extrabold tracking-[-0.02em] leading-tight" style={{ color: tone ?? 'var(--color-text)' }}>{value}</span>
      <span className="text-[13px]" style={{ color: 'var(--color-muted)' }}>{hint}</span>
    </Link>
  );
}

/**
 * Painel: saudação com busca, quatro números do dia, prazos mais próximos em
 * cartões, o feed do setor agrupado por dia e, ao lado, alertas e favoritos
 * com prazo. Cada bloco busca em paralelo e mostra esqueleto até chegar.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { name, alerts } = useAccount();
  const { favorites } = useFavorites();
  const [feed, setFeed] = useState<VerticalFeedData | null>(null);
  const [recent, setRecent] = useState<Article[] | null>(null);
  const [favArticles, setFavArticles] = useState<Article[] | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    loadVerticalFeed()
      .then(setFeed)
      .catch(() => setFeed({ verticals: [], selected: [], articles: [] }));
    getRecentArticles(50)
      .then(setRecent)
      .catch(() => setRecent([]));
    authFetch(`${API_BASE}/api/v1/favorites`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFavArticles(Array.isArray(data) ? data : []))
      .catch(() => setFavArticles([]));
  }, []);

  const pool = feed && recent ? [...feed.articles, ...recent] : null;
  const deadlines = pool ? computeDeadlines(pool) : null;
  const favsNow = favArticles?.filter((a) => favorites.has(a.id)) ?? null;

  // Números do dia
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  const newSinceYesterday = feed?.articles.filter((a) => (parseDate(a.published_date)?.getTime() ?? 0) >= yesterday.getTime()).length;
  const within7 = deadlines?.filter((a) => (openDays(a) ?? 99) <= 7) ?? null;
  const within7Favs = within7?.filter((a) => favorites.has(a.id)).length ?? 0;
  const openValue = deadlines?.reduce((sum, a) => sum + (Number(a.normalized_data?.value) || 0), 0) ?? 0;
  const activeAlerts = alerts?.filter((a) => a.enabled).length ?? 0;
  const sectors = feed?.selected.length ?? 0;
  const dash = '—';

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const firstName = name.split(' ')[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/busca?q=${encodeURIComponent(term)}` : '/busca');
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <header className="flex items-center justify-between gap-8 flex-wrap py-8 px-4 sm:px-12" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className="flex flex-col gap-1">
            <h1 className="text-[32px] font-extrabold tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)' }}>
              {greeting()}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>{hoje.charAt(0).toUpperCase() + hoje.slice(1)}</p>
          </div>
          <form onSubmit={submit} role="search" className="flex flex-[1_1_380px] max-w-[560px]">
            <label htmlFor="painel-q" className="sr-only-text">Buscar no Diário Oficial</label>
            <input
              id="painel-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar editais, órgãos, CNPJ…"
              className="flex-1 min-w-0 h-12 px-4 text-[15px]"
              style={{ border: '2px solid var(--color-text)', borderRight: 0, background: 'var(--color-field)', color: 'var(--color-text)' }}
            />
            <button type="submit" className="h-12 px-[22px] text-[14px] font-bold cursor-pointer" style={{ border: '2px solid var(--color-text)', background: 'var(--color-text)', color: '#fff' }}>
              Buscar
            </button>
          </form>
        </header>

        <section aria-label="Resumo" className="mt-6 mx-4 sm:mx-12 grid grid-cols-2 xl:grid-cols-4" style={{ borderTop: '1px solid var(--color-line)', borderBottom: '1px solid var(--color-line)' }}>
          <Kpi
            first
            href="#do-seu-setor"
            label="Novos desde ontem"
            value={newSinceYesterday == null ? dash : String(newSinceYesterday)}
            hint={sectors ? `nos seus ${sectors} ${sectors === 1 ? 'setor' : 'setores'}` : 'escolha seus setores'}
          />
          <Kpi
            href="#prazos-titulo"
            label="Abrem em 7 dias"
            value={within7 == null ? dash : String(within7.length)}
            tone={within7 && within7.length > 0 ? 'var(--color-accent-text)' : undefined}
            hint={within7Favs > 0 ? `${within7Favs} já nos favoritos` : 'entre as publicações recentes'}
          />
          <Kpi
            href="/alertas"
            label="Novos nos alertas"
            value={alerts == null ? dash : String(newMatchesCount(alerts))}
            hint={`em ${activeAlerts} ${activeAlerts === 1 ? 'alerta ativo' : 'alertas ativos'}`}
          />
          <Kpi
            href="#prazos-titulo"
            label="Valor em aberto"
            value={deadlines == null ? dash : formatMoneyCompact(openValue) || 'R$ 0'}
            hint="licitações com prazo aberto"
          />
        </section>

        <DeadlinesCard items={deadlines} />

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-12 mt-12 mb-16 mx-4 sm:mx-12">
          <div id="do-seu-setor" className="min-w-0">
            <VerticalFeed data={feed} />
          </div>
          <aside className="flex flex-col gap-8">
            <ProfilesCard alerts={alerts} />
            <FavoriteDeadlines articles={favsNow} total={favorites.size} />
          </aside>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

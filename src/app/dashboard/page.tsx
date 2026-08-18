'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricsBar } from '@/components/dashboard/MetricsBar';
import { DeadlinesCard } from '@/components/dashboard/DeadlinesCard';
import { ProfilesCard } from '@/components/dashboard/ProfilesCard';
import { VolumeChart } from '@/components/dashboard/VolumeChart';
import { VerticalFeed } from '@/components/dashboard/VerticalFeed';
import { getStats, getRecentArticles, authFetch, type PublicStats } from '@/lib/api';
import type { Article } from '@/lib/types';
import { parseSectionNumber } from '@/lib/utils';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { supabase } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

interface ProfileItem {
  name: string;
  count: string;
}

interface DeadlineItem {
  id: number;
  slug: string;
  title: string;
  organ: string;
  days: string;
  tone: 'urgent' | 'default' | 'later';
}

function computeDeadlines(articles: Article[]): DeadlineItem[] {
  const now = new Date();
  const deadlines: DeadlineItem[] = [];

  for (const a of articles) {
    const nd = a.normalized_data;
    if (!nd || typeof nd === 'string') continue;
    const openingDate = nd.opening_date;
    if (!openingDate) continue;

    const od = new Date(openingDate);
    const diffDays = Math.ceil((od.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) continue; // já passou
    if (diffDays > 30) continue; // muito longe

    let tone: 'urgent' | 'default' | 'later';
    if (diffDays <= 3) tone = 'urgent';
    else if (diffDays <= 7) tone = 'default';
    else tone = 'later';

    deadlines.push({
      id: a.id,
      slug: a.slug,
      title: a.title_marker || a.title,
      organ: a.organ_level_1 || a.organ || '',
      days: diffDays === 0 ? 'abertura hoje' : diffDays === 1 ? 'abertura amanhã' : `abertura em ${diffDays} dias`,
      tone,
    });
  }

  return deadlines.sort((a, b) => {
    const urgency = { urgent: 0, default: 1, later: 2 };
    return urgency[a.tone] - urgency[b.tone];
  }).slice(0, 5);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('pt-BR').format(n);
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [recent, setRecent] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<{date: string; count: number}[]>([]);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);

  const loadProfiles = (userId: string) => {
    authFetch(`${API_BASE}/api/v1/alerts`)
      .then((r) => r.json())
      .then((alerts: any[]) => {
        const items = alerts.map((a) => ({
          name: a.name,
          count: a.match_count > 0 ? `+${a.match_count}` : '0',
        }));
        setProfiles(items);
      })
      .catch(console.error);
  };

  const loadData = () => {
    setError(null);
    getStats().then(setStats).catch((e) => {
      setError('Não foi possível carregar os dados. Verifique sua conexão.');
      console.error(e);
    });
    getRecentArticles(50).then((articles) => {
      setRecent(articles.slice(0, 5));
      setDeadlines(computeDeadlines(articles));
    }).catch(console.error);
    fetch(`${API_BASE}/api/v1/volume?days=7`)
      .then((r) => r.json())
      .then(setVolume)
      .catch(console.error);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) loadProfiles(data.session.user.id);
    });
  };

  useEffect(() => { loadData(); }, []);

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const lastSync = stats?.last_sync_at
    ? new Date(stats.last_sync_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const metrics = [
    { label: 'Licitações na base', value: stats ? formatNumber(stats.total_articles) : '...' },
    { label: 'Publicados hoje', value: stats ? formatNumber(stats.articles_today) : '...', accent: true },
    { label: 'Nesta semana', value: stats ? formatNumber(stats.articles_this_week) : '...' },
    { label: 'Último sync', value: lastSync },
  ];

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10 flex items-center justify-between" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Painel</h1>
            <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-600)' }}>{hoje} · última varredura às {lastSync}</div>
          </div>
          <button
            onClick={() => router.push('/busca')}
            className="text-left py-3 px-5 text-sm font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            Nova busca
          </button>
        </div>

        {error && (
          <div className="mx-10 mt-4 p-4 flex items-center justify-between" style={{ background: '#f8d7da', border: '2px solid #f5c6cb' }}>
            <span className="text-sm font-bold" style={{ color: '#721c24' }}>{error}</span>
            <button
              onClick={loadData}
              className="px-4 py-1.5 text-sm font-bold"
              style={{ background: '#721c24', color: '#fff', border: 'none' }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <MetricsBar metrics={metrics} />

        <VerticalFeed />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
          {/* Recent articles from DOU API */}
          <div className="min-w-0 lg:border-r-2" style={{ borderColor: 'var(--color-text)' }}>
            <div className="pt-6 px-10 pb-4 flex items-baseline justify-between">
              <h2 className="text-xl font-black tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                Publicações recentes
              </h2>
            </div>
            <div className="px-10 pb-10">
              <div style={{ borderTop: '2px solid var(--color-text)' }}>
                {recent.length === 0 && (
                  <div className="py-10 text-center text-[13px]" style={{ color: 'var(--color-neutral-500)' }}>
                    Carregando...
                  </div>
                )}
                {recent.map((article) => {
                  const sectionNumber = parseSectionNumber(article.section);
                  return (
                    <a
                      key={article.id}
                      href={`/artigo/${article.slug}`}
                      className="block py-4 cursor-pointer hover:opacity-80 transition-opacity relative"
                      style={{ borderBottom: '1px solid var(--color-divider)', textDecoration: 'none' }}
                    >
                      <div className="absolute top-4 right-0">
                        <FavoriteButton articleId={article.id} />
                      </div>
                      <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-accent)' }}>
                        {article.organ_level_1 || article.organ || 'DOU'}
                      </div>
                      <h3 className="text-[15px] font-bold leading-snug mb-1" style={{ color: 'var(--color-text)' }}>
                        {article.title_marker || article.title}
                      </h3>
                      <div className="text-[12px]" style={{ color: 'var(--color-neutral-500)' }}>
                        {new Date(article.published_date).toLocaleDateString('pt-BR')}
                        {sectionNumber ? ` · Seção ${sectionNumber}` : ''}
                        {article.page ? ` · p. ${article.page}` : ''}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <DeadlinesCard items={deadlines} />
            <ProfilesCard items={profiles} onManage={() => router.push('/alertas')} />
            <VolumeChart data={volume} />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

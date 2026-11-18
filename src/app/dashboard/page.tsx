'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DeadlinesCard } from '@/components/dashboard/DeadlinesCard';
import { ProfilesCard } from '@/components/dashboard/ProfilesCard';
import { VerticalFeed, loadVerticalFeed, type VerticalFeedData } from '@/components/dashboard/VerticalFeed';
import { getRecentArticles, authFetch } from '@/lib/api';
import type { Article } from '@/lib/types';

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

/**
 * Painel enxuto: só o que é do usuário — publicações do setor, prazos e
 * alertas. Cada bloco busca em paralelo e mostra esqueleto até chegar
 * (`null` = carregando), sem tela de loading global.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [feed, setFeed] = useState<VerticalFeedData | null>(null);
  const [deadlines, setDeadlines] = useState<DeadlineItem[] | null>(null);
  const [profiles, setProfiles] = useState<ProfileItem[] | null>(null);

  useEffect(() => {
    loadVerticalFeed()
      .then(setFeed)
      .catch(() => setFeed({ verticals: [], selected: [], articles: [] }));

    getRecentArticles(50)
      .then((articles) => setDeadlines(computeDeadlines(articles)))
      .catch(() => setDeadlines([]));

    authFetch(`${API_BASE}/api/v1/alerts`)
      .then((r) => (r.ok ? r.json() : []))
      .then((alerts: { name: string; match_count: number }[]) =>
        setProfiles(
          (Array.isArray(alerts) ? alerts : []).map((a) => ({
            name: a.name,
            count: a.match_count > 0 ? `+${a.match_count}` : '0',
          })),
        ),
      )
      .catch(() => setProfiles([]));
  }, []);

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10 flex items-center justify-between" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Painel</h1>
            <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-600)' }}>{hoje}</div>
          </div>
          <button
            onClick={() => router.push('/busca')}
            className="text-left py-3 px-5 text-sm font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            Nova busca
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 pb-10 lg:border-r-2" style={{ borderColor: 'var(--color-text)' }}>
            <VerticalFeed data={feed} />
          </div>
          <div>
            <DeadlinesCard items={deadlines} />
            <ProfilesCard items={profiles} onManage={() => router.push('/alertas')} />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

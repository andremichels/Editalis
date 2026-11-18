'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DeadlinesCard, type DeadlineItem } from '@/components/dashboard/DeadlinesCard';
import { ProfilesCard } from '@/components/dashboard/ProfilesCard';
import { VerticalFeed, loadVerticalFeed, type VerticalFeedData } from '@/components/dashboard/VerticalFeed';
import { getRecentArticles } from '@/lib/api';
import { articleOrgan, articleTitle, daysUntil } from '@/lib/format';
import { useAccount } from '@/lib/useAccount';
import type { Article } from '@/lib/types';

function computeDeadlines(articles: Article[]): DeadlineItem[] {
  const items: DeadlineItem[] = [];
  for (const a of articles) {
    const days = daysUntil(a.normalized_data?.opening_date);
    if (days == null || days < 0 || days > 30) continue;
    items.push({ slug: a.slug, title: articleTitle(a, 90), organ: articleOrgan(a), days });
  }
  return items.sort((a, b) => a.days - b.days).slice(0, 5);
}

/**
 * Painel enxuto: só o que é do usuário — publicações do setor, prazos e
 * alertas. Cada bloco busca em paralelo e mostra esqueleto até chegar
 * (`null` = carregando), sem tela de loading global.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { alerts } = useAccount();
  const [feed, setFeed] = useState<VerticalFeedData | null>(null);
  const [deadlines, setDeadlines] = useState<DeadlineItem[] | null>(null);

  useEffect(() => {
    loadVerticalFeed()
      .then(setFeed)
      .catch(() => setFeed({ verticals: [], selected: [], articles: [] }));

    getRecentArticles(50)
      .then((articles) => setDeadlines(computeDeadlines(articles)))
      .catch(() => setDeadlines([]));
  }, []);

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-6 sm:px-10 flex items-center justify-between gap-4" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Painel</h1>
            <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-700)' }}>{hoje}</div>
          </div>
          <button
            onClick={() => router.push('/busca')}
            className="text-left py-3 px-5 text-sm font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            Buscar
          </button>
        </div>

        <DeadlinesCard items={deadlines} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 pb-10 lg:border-r-2" style={{ borderColor: 'var(--color-text)' }}>
            <VerticalFeed data={feed} />
          </div>
          <div>
            <ProfilesCard alerts={alerts} />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

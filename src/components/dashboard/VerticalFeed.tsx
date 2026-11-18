'use client';

import Link from 'next/link';
import { getPreferences, getVerticalArticles, getVerticals } from '@/lib/api';
import type { Article, Vertical } from '@/lib/types';
import { ArticleRow, ArticleRowSkeleton } from '@/components/articles/ArticleRow';

export interface VerticalFeedData {
  verticals: Vertical[];
  selected: string[];
  articles: Article[];
}

/**
 * Busca os dados do feed "Do seu setor". Chamado pelo /dashboard junto com as
 * outras buscas da página (antes o componente buscava sozinho e só depois de
 * montar, em cascata: verticais → preferências → artigos).
 */
export async function loadVerticalFeed(): Promise<VerticalFeedData> {
  const [verticals, prefs] = await Promise.all([
    getVerticals(),
    getPreferences().catch(() => ({ verticals: [] as string[] })),
  ]);
  const selected: string[] = prefs.verticals ?? [];
  if (selected.length === 0) return { verticals, selected, articles: [] };

  // agrega artigos das verticais selecionadas (limita por vertical)
  const results = await Promise.all(
    selected.map((s) => getVerticalArticles(s, 10).catch(() => ({ count: 0, results: [] as Article[] }))),
  );
  const seen = new Set<number>();
  const merged: Article[] = [];
  for (const r of results) {
    for (const a of r.results) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        merged.push(a);
      }
    }
  }
  return { verticals, selected, articles: merged.slice(0, 10) };
}

function FeedHeader({ names }: { names?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-3 flex-wrap">
      <h2 className="text-xl font-black tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
        Do seu setor
      </h2>
      {names !== undefined && (
        <div className="flex items-baseline gap-3">
          <span className="text-[12px] font-bold" style={{ color: 'var(--color-neutral-700)' }}>{names}</span>
          <Link href="/onboarding" className="text-[13px] font-bold underline" style={{ color: 'var(--color-text)' }}>
            Editar setores
          </Link>
        </div>
      )}
    </div>
  );
}

export function VerticalFeed({ data }: { data: VerticalFeedData | null }) {
  if (!data) {
    return (
      <div className="px-10 pt-6">
        <FeedHeader />
        <div style={{ borderTop: '2px solid var(--color-text)' }}>
          <ArticleRowSkeleton count={5} />
        </div>
      </div>
    );
  }
  const { verticals, selected, articles } = data;
  if (selected.length === 0) {
    return (
      <div className="px-10 pt-6">
        <FeedHeader />
        <p className="text-[14px] mb-4" style={{ color: 'var(--color-neutral-700)' }}>
          Escolha os setores que você acompanha para ver aqui as publicações que importam pra você.
        </p>
        <Link
          href="/onboarding"
          className="inline-block py-2.5 px-4 text-[13px] font-bold"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          Escolher setores
        </Link>
      </div>
    );
  }

  return (
    <div className="px-10 pt-6">
      <FeedHeader names={verticals.filter((v) => selected.includes(v.slug)).map((v) => v.name).join(' · ')} />
      <div style={{ borderTop: '2px solid var(--color-text)' }}>
        {articles.length === 0 && (
          <p className="py-6 text-[14px]" style={{ color: 'var(--color-neutral-700)' }}>
            Nenhuma publicação recente nos seus setores.
          </p>
        )}
        {articles.map((article) => (
          <ArticleRow key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

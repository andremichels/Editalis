'use client';

import Link from 'next/link';
import { getPreferences, getVerticalArticles, getVerticals } from '@/lib/api';
import type { Article, Vertical } from '@/lib/types';
import { FavoriteButton } from '@/components/ui/FavoriteButton';

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

export function VerticalFeed({ data }: { data: VerticalFeedData | null }) {
  if (!data) {
    return (
      <div className="px-10 pt-6">
        <div className="h-7 w-40 skeleton mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      </div>
    );
  }
  const { verticals, selected, articles } = data;
  if (selected.length === 0) {
    return (
      <div className="px-10 pt-6">
        <h2 className="text-xl font-black tracking-[-0.02em] mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
          Do seu setor
        </h2>
        <p className="text-[13px] mb-4" style={{ color: 'var(--color-neutral-600)' }}>
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
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xl font-black tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
          Do seu setor
        </h2>
        <div className="flex items-baseline gap-3">
          <span className="text-[12px] font-bold" style={{ color: 'var(--color-neutral-500)' }}>
            {verticals.filter((v) => selected.includes(v.slug)).map((v) => v.name).join(' · ')}
          </span>
          <Link href="/onboarding" className="text-[12px] font-bold" style={{ color: 'var(--color-accent)' }}>
            Editar setores
          </Link>
        </div>
      </div>
      <div style={{ borderTop: '2px solid var(--color-text)' }}>
        {articles.length === 0 && (
          <div className="py-6 text-center text-[13px]" style={{ color: 'var(--color-neutral-500)' }}>
            Nada recente nos seus setores ainda.
          </div>
        )}
        {articles.map((article) => (
          <Link
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

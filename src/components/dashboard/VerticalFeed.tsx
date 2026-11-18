'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getPreferences, getVerticalArticles, getVerticals } from '@/lib/api';
import type { Article, Vertical } from '@/lib/types';
import { ArticleRow, ArticleRowSkeleton } from '@/components/articles/ArticleRow';
import { daysUntil, parseDate } from '@/lib/format';

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
    selected.map((s) => getVerticalArticles(s, 20).catch(() => ({ count: 0, results: [] as Article[] }))),
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
  merged.sort((a, b) => (parseDate(b.published_date)?.getTime() ?? 0) - (parseDate(a.published_date)?.getTime() ?? 0));
  return { verticals, selected, articles: merged.slice(0, 40) };
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
          <Link href="/setores" className="text-[13px] font-bold underline" style={{ color: 'var(--color-text)' }}>
            Editar setores
          </Link>
        </div>
      )}
    </div>
  );
}

type QuickFilter = 'tudo' | 'recentes' | 'prazo' | 'valor';

const QUICK: { id: QuickFilter; label: string; test: (a: Article, newest: number) => boolean }[] = [
  { id: 'tudo', label: 'Tudo', test: () => true },
  {
    id: 'recentes',
    label: 'Última edição',
    test: (a, newest) => (parseDate(a.published_date)?.getTime() ?? 0) === newest,
  },
  {
    id: 'prazo',
    label: 'Com prazo aberto',
    test: (a) => (daysUntil(a.normalized_data?.opening_date) ?? -1) >= 0,
  },
  { id: 'valor', label: 'Com valor', test: (a) => a.normalized_data?.value != null },
];

const PAGE = 10;

export function VerticalFeed({ data }: { data: VerticalFeedData | null }) {
  const [quick, setQuick] = useState<QuickFilter>('tudo');
  const [shown, setShown] = useState(PAGE);

  if (!data) {
    return (
      <div className="px-6 sm:px-10 pt-6">
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
      <div className="px-6 sm:px-10 pt-6">
        <FeedHeader />
        <p className="text-[14px] mb-4" style={{ color: 'var(--color-neutral-700)' }}>
          Escolha os setores que você acompanha para ver aqui as publicações que importam pra você.
        </p>
        <Link
          href="/setores"
          className="inline-block py-2.5 px-4 text-[13px] font-bold"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          Escolher setores
        </Link>
      </div>
    );
  }

  const newest = Math.max(0, ...articles.map((a) => parseDate(a.published_date)?.getTime() ?? 0));
  const counts = Object.fromEntries(QUICK.map((q) => [q.id, articles.filter((a) => q.test(a, newest)).length])) as Record<QuickFilter, number>;
  const current = QUICK.find((q) => q.id === quick)!;
  const filtered = articles.filter((a) => current.test(a, newest));

  return (
    <div className="px-6 sm:px-10 pt-6">
      <FeedHeader names={verticals.filter((v) => selected.includes(v.slug)).map((v) => v.name).join(' · ')} />
      {articles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Filtro rápido">
          {QUICK.map((q) => {
            const active = q.id === quick;
            return (
              <button
                key={q.id}
                role="tab"
                aria-selected={active}
                onClick={() => { setQuick(q.id); setShown(PAGE); }}
                className="text-[13px] font-bold py-1.5 px-3 cursor-pointer"
                style={{
                  background: active ? 'var(--color-text)' : 'transparent',
                  color: active ? 'var(--color-bg)' : 'var(--color-text)',
                  border: `2px solid ${active ? 'var(--color-text)' : 'var(--color-neutral-400)'}`,
                }}
              >
                {q.label} <span style={{ opacity: 0.75 }}>{counts[q.id]}</span>
              </button>
            );
          })}
        </div>
      )}
      <div style={{ borderTop: '2px solid var(--color-text)' }}>
        {filtered.length === 0 && (
          <p className="py-6 text-[14px]" style={{ color: 'var(--color-neutral-700)' }}>
            {articles.length === 0 ? 'Nenhuma publicação recente nos seus setores.' : 'Nada com esse filtro entre as publicações recentes.'}
          </p>
        )}
        {filtered.slice(0, shown).map((article) => (
          <ArticleRow key={article.id} article={article} />
        ))}
      </div>
      {filtered.length > shown && (
        <button
          onClick={() => setShown((n) => n + PAGE)}
          className="mt-4 py-2.5 px-4 text-[13px] font-bold cursor-pointer"
          style={{ border: '2px solid var(--color-text)', color: 'var(--color-text)', background: 'transparent' }}
        >
          Mostrar mais {Math.min(PAGE, filtered.length - shown)}
        </button>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getPreferences, getVerticalArticles, getVerticals } from '@/lib/api';
import type { Article, Vertical } from '@/lib/types';
import { ArticleRow, ArticleRowSkeleton, ValueDeadline } from '@/components/articles/ArticleRow';
import { dayGroupLabel, isOpportunity, parseDate } from '@/lib/format';
import { useReadIds } from '@/lib/useReads';

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

type Tab = 'oportunidades' | 'movimentacoes' | 'tudo';

const PAGE = 10;

function FeedHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap pb-3">
      <h2 className="text-[22px] font-extrabold tracking-[-0.01em]">Do seu setor</h2>
      {children}
    </div>
  );
}

/**
 * "Do seu setor": oportunidades × movimentações, agrupadas por dia, com
 * valor e prazo à direita. "Esconder vistos" tira o que já foi aberto.
 */
export function VerticalFeed({ data }: { data: VerticalFeedData | null }) {
  const [tab, setTab] = useState<Tab>('oportunidades');
  const [hideSeen, setHideSeen] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const reads = useReadIds();

  if (!data) {
    return (
      <section className="flex flex-col min-w-0">
        <FeedHeader />
        <div style={{ borderTop: '2px solid var(--color-text)' }}>
          <ArticleRowSkeleton count={5} />
        </div>
      </section>
    );
  }
  const { verticals, selected, articles } = data;
  if (selected.length === 0) {
    return (
      <section className="flex flex-col min-w-0">
        <FeedHeader />
        <div className="pt-4" style={{ borderTop: '2px solid var(--color-text)' }}>
          <p className="text-[14px] mb-4" style={{ color: 'var(--color-muted)' }}>
            Escolha os setores que você acompanha para ver aqui as publicações que importam pra você.
          </p>
          <Link href="/setores" className="inline-flex items-center h-11 px-4 text-[14px] font-bold" style={{ background: 'var(--color-accent)', color: '#fff' }}>
            Escolher setores
          </Link>
        </div>
      </section>
    );
  }

  const opportunities = articles.filter(isOpportunity);
  const byTab: Record<Tab, Article[]> = {
    oportunidades: opportunities,
    movimentacoes: articles.filter((a) => !isOpportunity(a)),
    tudo: articles,
  };
  const TABS: { id: Tab; label: string }[] = [
    { id: 'oportunidades', label: `Oportunidades · ${byTab.oportunidades.length}` },
    { id: 'movimentacoes', label: `Movimentações · ${byTab.movimentacoes.length}` },
    { id: 'tudo', label: 'Tudo' },
  ];
  const filtered = byTab[tab].filter((a) => !hideSeen || !reads.has(a.id));
  const visible = filtered.slice(0, shown);

  // agrupa por dia de publicação, mantendo a ordem (mais recente primeiro)
  const groups: { label: string; items: Article[] }[] = [];
  for (const a of visible) {
    const label = dayGroupLabel(a.published_date);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(a);
    else groups.push({ label, items: [a] });
  }
  const names = verticals.filter((v) => selected.includes(v.slug)).map((v) => v.name).join(', ');

  return (
    <section className="flex flex-col min-w-0">
      <FeedHeader>
        <div role="tablist" aria-label="Tipo de publicação" className="flex" style={{ border: '2px solid var(--color-text)' }}>
          {TABS.map((t, i) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => { setTab(t.id); setShown(PAGE); }}
                className={`h-10 px-3.5 text-[13px] cursor-pointer ${active ? 'font-bold' : 'font-semibold'}`}
                style={{
                  background: active ? 'var(--color-text)' : 'var(--color-field)',
                  color: active ? '#fff' : 'var(--color-text)',
                  borderLeft: i > 0 ? '2px solid var(--color-text)' : 'none',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </FeedHeader>

      <div className="flex items-center gap-2 flex-wrap py-3" style={{ borderTop: '2px solid var(--color-text)', borderBottom: '1px solid var(--color-line)' }}>
        <span className="text-[13px] mr-1" style={{ color: 'var(--color-muted)' }}>Filtros:</span>
        <Link
          href="/setores"
          className="inline-flex items-center h-8 px-2.5 text-[13px] font-semibold"
          style={{ border: '1px solid var(--color-text)', background: 'var(--color-field)' }}
          title="Editar setores"
        >
          Setores: {names}
        </Link>
        <label className="inline-flex items-center gap-2 h-8 px-1.5 text-[13px] font-semibold cursor-pointer">
          <input type="checkbox" checked={hideSeen} onChange={(e) => { setHideSeen(e.target.checked); setShown(PAGE); }} style={{ width: 16, height: 16, accentColor: 'var(--color-text)' }} />
          Esconder vistos
        </label>
      </div>

      {filtered.length === 0 && (
        <p className="py-6 text-[14px]" style={{ color: 'var(--color-muted)' }}>
          {articles.length === 0
            ? 'Nenhuma publicação recente nos seus setores.'
            : hideSeen && byTab[tab].length > 0
              ? 'Você já abriu todas as publicações desta lista.'
              : 'Nada nesta aba entre as publicações recentes.'}
        </p>
      )}
      {groups.map((g) => {
        const fresh = g.items.filter((a) => !reads.has(a.id)).length;
        return (
          <div key={g.label}>
            <p className="py-3 text-[12px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-muted)', borderBottom: '1px solid var(--color-line)' }}>
              {g.label}{g.label === 'Hoje' && fresh > 0 ? ` · ${fresh} ${fresh === 1 ? 'novo' : 'novos'}` : ''}
            </p>
            {g.items.map((article) => (
              <ArticleRow key={article.id} article={article} aside={<ValueDeadline article={article} />} />
            ))}
          </div>
        );
      })}
      {filtered.length > shown && (
        <button
          onClick={() => setShown((n) => n + PAGE)}
          className="self-start mt-5 h-11 px-[18px] text-[14px] font-bold cursor-pointer"
          style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
        >
          Carregar mais {Math.min(PAGE, filtered.length - shown)}
          {tab === 'oportunidades' ? ' oportunidades' : ''}
        </button>
      )}
    </section>
  );
}

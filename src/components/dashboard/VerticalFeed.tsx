'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch, getVerticalArticles, getVerticals } from '@/lib/api';
import type { Article, Vertical } from '@/lib/types';
import { FavoriteButton } from '@/components/ui/FavoriteButton';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

export function VerticalFeed() {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await getVerticals();
        const prefsRes = await authFetch(`${API_BASE}/api/v1/account/preferences`);
        const prefs = prefsRes.ok ? await prefsRes.json() : {};
        const slugs: string[] = prefs.verticals ?? [];
        setSelected(slugs);

        if (slugs.length > 0) {
          // agrega artigos das verticais selecionadas (limita por vertical)
          const results = await Promise.all(
            slugs.map((s) => getVerticalArticles(s, 10).catch(() => ({ count: 0, results: [] }))),
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
          setArticles(merged.slice(0, 5));
        }
        setVerticals(all);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return null;
  if (selected.length === 0) return null;

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
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

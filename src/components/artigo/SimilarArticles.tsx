'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Article } from '@/lib/types';
import { articleKind, articleOrgan, articleTitle, formatDateShort } from '@/lib/format';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

export function SimilarArticles({ slug }: { slug: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/article/${encodeURIComponent(slug)}/similar?limit=3`)
      .then((r) => r.json())
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return null;
  if (articles.length === 0) return null;

  return (
    <div className="py-8 px-10" style={{ borderTop: '2px solid var(--color-divider)' }}>
      <div className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-700)' }}>
        Publicações semelhantes
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/artigo/${a.slug}`}
            className="block p-4 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ border: '1px solid var(--color-divider)', textDecoration: 'none' }}
          >
            <div className="text-[12px] mb-1.5" style={{ color: 'var(--color-neutral-700)' }}>
              {articleKind(a)} · {formatDateShort(a.published_date)}
            </div>
            <div className="text-[14px] font-bold leading-[1.3] mb-1 line-clamp-3" style={{ color: 'var(--color-text)' }}>
              {articleTitle(a, 140)}
            </div>
            <div className="text-[12px]" style={{ color: 'var(--color-neutral-700)' }}>
              {articleOrgan(a)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Article } from '@/lib/types';
import { articleKind, articleOrgan, articleTitle, formatDateShort } from '@/lib/format';
import { asideH2, asideH2Style } from '@/components/artigo/ArticleMeta';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

export function SimilarArticles({ slug }: { slug: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/article/${encodeURIComponent(slug)}/similar?limit=4`)
      .then((r) => r.json())
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return null;
  if (articles.length === 0) return null;

  return (
    <section className="print:hidden">
      <h2 className={asideH2} style={asideH2Style}>Semelhantes</h2>
      {articles.map((a) => (
        <Link key={a.id} href={`/artigo/${a.slug}`} className="block py-3 text-[14px] font-semibold leading-[1.4]" style={{ borderBottom: '1px solid var(--color-line)' }}>
          {articleTitle(a, 120)}
          <span className="block mt-0.5 text-[13px] font-normal" style={{ color: 'var(--color-muted)' }}>
            {articleKind(a)} · {articleOrgan(a)} · {formatDateShort(a.published_date)}
          </span>
        </Link>
      ))}
    </section>
  );
}

'use client';

import { Article } from '@/lib/types';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  loading?: boolean;
}

function ArticleCardSkeleton() {
  return (
    <div
      className="p-4 animate-pulse"
      style={{
        background: 'var(--color-surface)',
        border: '2px solid var(--color-divider)',
      }}
    >
      <div className="w-8 mb-3" style={{ borderTop: '2px solid var(--color-neutral-300)' }} />
      <div className="h-4 w-3/4 mb-3" style={{ background: 'var(--color-neutral-300)' }} />
      <div className="h-3 w-1/2 mb-3" style={{ background: 'var(--color-neutral-200)' }} />
      <div className="h-3 w-full mb-2" style={{ background: 'var(--color-neutral-200)' }} />
      <div className="h-3 w-2/3" style={{ background: 'var(--color-neutral-200)' }} />
    </div>
  );
}

export function ArticleList({ articles, loading }: ArticleListProps) {
  if (loading) {
    return (
      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!articles.length) {
    return null; // Handled by parent
  }

  return (
    <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3"
      style={{ border: '2px solid var(--color-divider)' }}
    >
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

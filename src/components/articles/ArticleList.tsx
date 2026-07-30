'use client';

import { Article } from '@/lib/types';
import { ArticleCard } from './ArticleCard';
import { ArticleCardSkeleton } from '@/components/ui/Skeleton';

interface ArticleListProps {
  articles: Article[];
  loading?: boolean;
}

export function ArticleList({ articles, loading }: ArticleListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">Nenhum resultado encontrado.</p>
        <p className="text-gray-400 text-xs mt-1">
          Tente um termo diferente ou mais genérico.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

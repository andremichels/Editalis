import type { Article } from '@/lib/types';
import { ArticleRow, ArticleRowSkeleton } from '@/components/articles/ArticleRow';

interface MatchesListProps {
  loading: boolean;
  matches: Article[];
}

export function MatchesList({ loading, matches }: MatchesListProps) {
  if (loading) return <ArticleRowSkeleton count={3} />;

  if (matches.length === 0) {
    return (
      <p className="text-[14px]" style={{ color: 'var(--color-neutral-700)' }}>
        Nenhuma publicação encontrada com esses critérios.
      </p>
    );
  }

  return (
    <div>
      {matches.map((a) => (
        <ArticleRow key={a.id} article={a} />
      ))}
    </div>
  );
}

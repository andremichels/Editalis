import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const organLabel =
    article.organ_level_2 || article.organ_level_1 || article.organ || '';

  return (
    <Link href={`/artigo/${encodeURIComponent(article.slug)}`}>
      <article
        className="group h-full p-4 transition-colors hover:bg-[var(--color-neutral-100)]"
        style={{
          background: 'var(--color-surface)',
          border: '2px solid var(--color-divider)',
        }}
      >
        {/* Divider topo */}
        <div
          className="mb-3"
          style={{ borderTop: '2px solid var(--color-accent)', width: '2rem' }}
        />

        <h3
          className="text-sm font-semibold leading-snug line-clamp-2 mb-3 group-hover:text-[var(--color-accent)] transition-colors"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
        >
          {article.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="accent">{formatDate(article.published_date)}</Badge>
          {article.section && (
            <Badge variant="neutral">
              {article.section.replace('Seção: ', 'Seção ')}
            </Badge>
          )}
        </div>

        {article.excerpt && (
          <p
            className="text-xs leading-relaxed line-clamp-3 mb-3"
            style={{ color: 'var(--color-neutral-600)' }}
            dangerouslySetInnerHTML={{ __html: article.excerpt }}
          />
        )}

        {organLabel && (
          <p
            className="text-xs truncate"
            style={{ color: 'var(--color-neutral-500)' }}
          >
            {organLabel}
          </p>
        )}
      </article>
    </Link>
  );
}

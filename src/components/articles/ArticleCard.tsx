import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const organLabel =
    article.organ_level_2 || article.organ_level_1 || article.organ || 'Diário Oficial';

  return (
    <Link href={`/artigo/${encodeURIComponent(article.slug)}`}>
      <Card hover padding="md" className="cursor-pointer h-full">
        <CardContent>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant="blue">{formatDate(article.published_date)}</Badge>
            {article.section && (
              <Badge variant="default">
                {article.section.replace('Seção: ', 'Seção ')}
              </Badge>
            )}
          </div>

          {article.excerpt && (
            <p
              className="text-xs text-gray-500 line-clamp-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.excerpt }}
            />
          )}

          <p className="text-xs text-gray-400 mt-2 truncate">{organLabel}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

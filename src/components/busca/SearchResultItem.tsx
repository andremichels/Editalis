import Link from 'next/link';
import type { Article } from '@/lib/types';
import { KindTag, OpeningBadge } from '@/components/articles/ArticleRow';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import {
  articleKind,
  articleOrgan,
  articleTitle,
  formatDateShort,
  formatMoney,
  highlightSnippet,
  modalityLabel,
} from '@/lib/format';

interface SearchResultItemProps {
  article: Article;
  query: string;
}

export function SearchResultItem({ article, query }: SearchResultItemProps) {
  const nd = article.normalized_data;
  const ufs = nd?.ufs?.filter(Boolean) ?? [];
  const value = formatMoney(nd?.value);
  const snippet = nd?.summary || highlightSnippet(article.content || article.excerpt, query);

  return (
    <div className="grid grid-cols-[1fr_auto] gap-6 py-5 px-10" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <KindTag>{articleKind(article)}</KindTag>
          {nd?.modality && <KindTag>{modalityLabel(nd.modality)}</KindTag>}
          <span className="text-[12px]" style={{ color: 'var(--color-neutral-700)' }}>
            {nd?.process_number && `nº ${nd.process_number} · `}publicado em {formatDateShort(article.published_date)}
          </span>
        </div>
        <Link
          href={`/artigo/${article.slug}`}
          className="block text-[15px] font-bold leading-snug mb-1 hover:underline"
          style={{ color: 'var(--color-text)' }}
        >
          {articleTitle(article)}
        </Link>
        <div className="text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>
          {articleOrgan(article)}
          {ufs.length > 0 ? ` · ${ufs.join(', ')}` : ''}
        </div>
        {snippet && (
          <div
            className="text-[13px] mt-2 leading-[1.55]"
            style={{ color: 'var(--color-neutral-700)' }}
            dangerouslySetInnerHTML={{ __html: snippet }}
          />
        )}
      </div>
      <div className="text-right whitespace-nowrap flex flex-col items-end gap-1">
        <FavoriteButton articleId={article.id} />
        {value && <div className="text-lg font-black">{value}</div>}
        <OpeningBadge date={nd?.opening_date} />
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import type { Article } from '@/lib/types';
import { KindTag, NewMark, useArticleState } from '@/components/articles/ArticleRow';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import {
  articleKind,
  articleOrgan,
  articleTitle,
  articleUfs,
  daysUntil,
  deadlineText,
  formatDateShort,
  formatMoneyCompact,
  highlightSnippet,
  isUrgent,
  modalityLabel,
  openingWhen,
} from '@/lib/format';

interface SearchResultItemProps {
  article: Article;
  query: string;
}

/**
 * Item de lista completo (Busca): modalidade, tipo e nº em cima; objeto como
 * título; órgão + UF; trecho com o termo destacado. À direita, valor grande,
 * prazo como contagem (faixa vermelha com 7 dias ou menos) e a estrela.
 */
export function SearchResultItem({ article, query }: SearchResultItemProps) {
  const nd = article.normalized_data;
  const ufs = articleUfs(article);
  const value = formatMoneyCompact(nd?.value);
  const snippet = nd?.summary || highlightSnippet(article.content || article.excerpt, query);
  const days = daysUntil(nd?.opening_date);
  const hasDeadline = days != null && days >= 0;
  const urgent = isUrgent(days);
  const { read, isNew } = useArticleState(article);
  const muted = { color: 'var(--color-muted)' };

  return (
    <article className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px] gap-4 md:gap-8 py-[26px]" style={{ borderBottom: '1px solid var(--color-line)' }}>
      <div className="min-w-0 flex flex-col gap-2">
        <p className="flex items-center gap-x-2.5 gap-y-1 flex-wrap text-[13px]" style={muted}>
          {isNew && <NewMark />}
          {nd?.modality && <KindTag>{modalityLabel(nd.modality)}</KindTag>}
          <span>
            {articleKind(article)}
            {nd?.process_number && ` · nº ${nd.process_number}`} · publicado {formatDateShort(article.published_date)}
            {read && <> · <span className="font-semibold">Visto</span></>}
          </span>
        </p>
        <h3 className={`text-[19px] leading-[1.3] ${read ? 'font-semibold' : 'font-bold'}`}>
          <Link href={`/artigo/${article.slug}`} className="hover:underline" style={{ color: read ? 'var(--color-muted)' : 'var(--color-text)' }}>
            {articleTitle(article)}
          </Link>
        </h3>
        <p className="text-[14px] font-semibold" style={read ? muted : undefined}>
          {articleOrgan(article)}
          {ufs && <span className="font-normal" style={muted}> · {ufs}</span>}
        </p>
        {snippet && (
          <p className="text-[14px] leading-[1.55]" style={muted} dangerouslySetInnerHTML={{ __html: snippet }} />
        )}
      </div>
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:text-right">
        {value ? (
          <p className="text-[24px] font-extrabold whitespace-nowrap" style={read ? muted : undefined}>{value}</p>
        ) : (
          <p className="text-[15px] font-bold" style={muted}>Valor não informado</p>
        )}
        {hasDeadline && (
          <div className="pt-1.5" style={{ borderTop: `3px solid ${urgent ? 'var(--color-accent)' : 'var(--color-text)'}` }}>
            <p className="text-[15px] font-extrabold whitespace-nowrap" style={{ color: urgent ? 'var(--color-accent-text)' : undefined }}>
              {deadlineText(days!).replace(/^a/, 'A')}
            </p>
            {openingWhen(nd?.opening_date) && <p className="text-[13px] mt-0.5" style={muted}>{openingWhen(nd?.opening_date)}</p>}
          </div>
        )}
        <FavoriteButton articleId={article.id} boxed />
      </div>
    </article>
  );
}

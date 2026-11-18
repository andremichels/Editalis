import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Article } from '@/lib/types';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import {
  articleKind,
  articleOrgan,
  articleTitle,
  daysUntil,
  formatDateShort,
  formatMoney,
  openingLabel,
} from '@/lib/format';

/** Etiqueta pequena e neutra com o tipo do ato. */
export function KindTag({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase py-0.5 px-1.5"
      style={{ letterSpacing: '0.06em', border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-700)' }}
    >
      {children}
    </span>
  );
}

/** Prazo de abertura: vermelho só quando é urgente (até 3 dias). */
export function OpeningBadge({ date }: { date?: string | null }) {
  const days = daysUntil(date);
  if (days == null || days < 0) return null;
  const urgent = days <= 3;
  return (
    <span className="text-[12px] font-bold" style={{ color: urgent ? 'var(--color-accent)' : 'var(--color-neutral-700)' }}>
      {openingLabel(days)}
    </span>
  );
}

/**
 * Linha padrão de publicação em listas (Painel, Favoritos, Alertas,
 * Similares, CNPJ): o objeto é o título, o tipo do ato vira etiqueta e o órgão
 * fica logo abaixo. Valor, UF e prazo aparecem quando existem.
 */
export function ArticleRow({ article, showFavorite = true, extra }: { article: Article; showFavorite?: boolean; extra?: ReactNode }) {
  const nd = article.normalized_data;
  const ufs = nd?.ufs?.filter(Boolean) ?? [];
  const value = formatMoney(nd?.value);

  return (
    <div className="relative py-4 grid grid-cols-[1fr_auto] gap-4" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <KindTag>{articleKind(article)}</KindTag>
          <span className="text-[12px]" style={{ color: 'var(--color-neutral-700)' }}>
            {formatDateShort(article.published_date)}
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
        {extra}
      </div>
      <div className="flex flex-col items-end gap-1 text-right">
        {showFavorite && <FavoriteButton articleId={article.id} />}
        {value && <div className="text-[14px] font-black whitespace-nowrap">{value}</div>}
        <OpeningBadge date={nd?.opening_date} />
      </div>
    </div>
  );
}

/** Esqueleto com a mesma altura de uma ArticleRow. */
export function ArticleRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-4" style={{ borderBottom: '1px solid var(--color-divider)' }}>
          <div className="h-4 w-32 skeleton mb-2" />
          <div className="h-5 w-4/5 skeleton mb-1.5" />
          <div className="h-4 w-1/2 skeleton" />
        </div>
      ))}
    </div>
  );
}

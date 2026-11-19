'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Article } from '@/lib/types';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useIsRead } from '@/lib/useReads';
import { isNewSince, usePreviousVisit } from '@/lib/useLastVisit';
import {
  articleKind,
  articleOrgan,
  articleTitle,
  articleUfs,
  daysUntil,
  deadlineText,
  formatMoneyCompact,
  isUrgent,
  modalityLabel,
} from '@/lib/format';

/** Etiqueta com borda para a modalidade ("Pregão eletrônico"). */
export function KindTag({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block text-[12px] font-bold py-[3px] px-2 whitespace-nowrap"
      style={{ border: '1px solid var(--color-text)', color: 'var(--color-text)' }}
    >
      {children}
    </span>
  );
}

/** "● Novo" — chegou depois da visita anterior e ainda não foi aberta. */
export function NewMark() {
  return (
    <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: 'var(--color-accent-text)' }}>
      <span aria-hidden className="inline-block w-2 h-2" style={{ background: 'var(--color-accent)', borderRadius: '50%' }} />
      Novo
    </span>
  );
}

/** Estado de leitura de uma publicação: novo, visto (já aberto) ou nenhum. */
export function useArticleState(article: Article) {
  const read = useIsRead(article.id);
  const prev = usePreviousVisit();
  return { read, isNew: !read && isNewSince(article, prev) };
}

/** "abre em 3 dias" — vermelho e negrito com 7 dias ou menos. */
export function Deadline({ date, strong = false }: { date?: string | null; strong?: boolean }) {
  const days = daysUntil(date);
  if (days == null || days < 0) return null;
  const urgent = isUrgent(days);
  return (
    <span
      className={urgent || strong ? 'font-bold' : undefined}
      style={{ color: urgent ? 'var(--color-accent-text)' : 'var(--color-text)' }}
    >
      {deadlineText(days)}
    </span>
  );
}

const sep = <span aria-hidden style={{ color: 'var(--color-muted)' }}> · </span>;

/**
 * Item de lista compacto (Painel, Favoritos, Alertas, Similares, CNPJ): o
 * objeto é o título; tipo, órgão e UF numa linha discreta em cima; valor e
 * prazo embaixo; estrela à direita. Já aberto = cinza e "Visto".
 */
export function ArticleRow({
  article,
  showFavorite = true,
  extra,
  aside,
}: {
  article: Article;
  showFavorite?: boolean;
  extra?: ReactNode;
  /** coluna extra à direita, antes da estrela (ex.: valor e prazo no Painel) */
  aside?: ReactNode;
}) {
  const nd = article.normalized_data;
  const ufs = articleUfs(article);
  const value = formatMoneyCompact(nd?.value);
  const days = daysUntil(nd?.opening_date);
  const hasDeadline = days != null && days >= 0;
  const { read, isNew } = useArticleState(article);
  const kind = nd?.modality ? modalityLabel(nd.modality) : articleKind(article);

  return (
    <article
      className={`grid gap-4 sm:gap-6 items-start py-[18px] ${aside ? 'grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto]' : 'grid-cols-[minmax(0,1fr)_auto]'}`}
      style={{ borderBottom: '1px solid var(--color-line)' }}
    >
      <div className="min-w-0 flex flex-col gap-1.5">
        <p className="text-[12px]" style={{ color: 'var(--color-muted)' }}>
          {isNew && <><NewMark />{sep}</>}
          {kind}{sep}{articleOrgan(article)}{ufs && <>{sep}{ufs}</>}
          {read && <>{sep}<span className="font-semibold">Visto</span></>}
        </p>
        <h3 className={`text-[16px] leading-[1.35] ${read ? 'font-semibold' : 'font-bold'}`}>
          <Link href={`/artigo/${article.slug}`} className="hover:underline" style={{ color: read ? 'var(--color-muted)' : 'var(--color-text)' }}>
            {articleTitle(article)}
          </Link>
        </h3>
        {!aside && (value || hasDeadline) && (
          <p className="text-[13px]" style={{ color: read ? 'var(--color-muted)' : 'var(--color-text)' }}>
            {value ? <strong>{value}</strong> : <span style={{ color: 'var(--color-muted)' }}>Valor não informado</span>}
            {hasDeadline && <>{sep}<Deadline date={nd?.opening_date} /></>}
          </p>
        )}
        {extra}
      </div>
      {aside && <div className="hidden sm:block">{aside}</div>}
      {showFavorite ? <div className="-mt-2.5"><FavoriteButton articleId={article.id} /></div> : <span />}
    </article>
  );
}

/** Coluna de valor + prazo à direita (Painel). */
export function ValueDeadline({ article }: { article: Article }) {
  const nd = article.normalized_data;
  const value = formatMoneyCompact(nd?.value);
  const days = daysUntil(nd?.opening_date);
  return (
    <div className="text-right min-w-[110px]">
      {value ? (
        <p className="text-[15px] font-extrabold whitespace-nowrap">{value}</p>
      ) : (
        <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>Valor não informado</p>
      )}
      {days != null && days >= 0 && (
        <p className="text-[13px] mt-0.5 whitespace-nowrap"><Deadline date={nd?.opening_date} strong /></p>
      )}
    </div>
  );
}

/** Esqueleto com a mesma altura de uma ArticleRow. */
export function ArticleRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-[18px]" style={{ borderBottom: '1px solid var(--color-line)' }}>
          <div className="h-3.5 w-56 skeleton mb-2" />
          <div className="h-5 w-4/5 skeleton mb-2" />
          <div className="h-3.5 w-40 skeleton" />
        </div>
      ))}
    </div>
  );
}

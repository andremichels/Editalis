'use client';

import Link from 'next/link';
import type { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useFavorites } from '@/lib/useFavorites';

const TYPE_LABELS: Record<string, string> = {
  licitacao: 'Licitação',
  contrato: 'Contrato',
  aditivo: 'Aditivo',
  rescisao: 'Rescisão',
  dispensa: 'Dispensa',
  inexigibilidade: 'Inexigibilidade',
  adjudicacao: 'Adjudicação',
  homologacao: 'Homologação',
  suspensao: 'Suspensão',
  revogacao: 'Revogação',
  nomeacao: 'Nomeação',
  exoneracao: 'Exoneração',
  portaria: 'Portaria',
  acordo: 'Acordo',
  convenio: 'Convênio',
};

export function ArticleDetailHeader({ article }: { article: Article }) {
  const { isFavorite, toggle, loaded } = useFavorites();
  const favorita = loaded && isFavorite(article.id);

  const orgTrail = [article.organ_level_1, article.organ_level_2, article.organ_level_3]
    .filter(Boolean)
    .join(' › ');
  const n = article.normalized_data;
  const badgeLabel = (n?.doc_type && TYPE_LABELS[n.doc_type]) || article.organ_level_1 || 'DOU';

  return (
    <>
      <div className="py-4 px-10" style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <Link href="/dashboard" className="text-[13px] font-semibold" style={{ color: 'var(--color-neutral-700)' }}>
          ← Voltar ao painel
        </Link>
      </div>
      <div className="py-8 px-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start" style={{ borderBottom: '2px solid var(--color-text)' }}>
        <div>
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span
              className="text-[11px] font-bold uppercase py-1 px-2"
              style={{ letterSpacing: '0.08em', background: 'var(--color-accent)', color: '#fff' }}
            >
              {badgeLabel}
            </span>
            <span className="text-[13px]" style={{ color: 'var(--color-neutral-600)' }}>{formatDate(article.published_date)}</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-black tracking-[-0.03em] leading-[1.06] mb-3 max-w-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {article.title_marker || article.title}
          </h1>
          {n?.object_summary && (
            <p className="text-[15px] mb-3 max-w-3xl leading-[1.5]" style={{ color: 'var(--color-neutral-700)' }}>
              {n.object_summary}
            </p>
          )}
          {(orgTrail || article.organ) && (
            <div className="text-[15px]" style={{ color: 'var(--color-neutral-700)' }}>{orgTrail || article.organ}</div>
          )}
        </div>
        {loaded && (
          <button
            onClick={() => toggle(article.id)}
            className="text-left text-sm font-bold py-3 px-4 cursor-pointer whitespace-nowrap"
            style={favorita
              ? { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: 'var(--color-bg)' }
              : { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
          >
            {favorita ? '★ Nas favoritas' : '☆ Favoritar'}
          </button>
        )}
      </div>
    </>
  );
}

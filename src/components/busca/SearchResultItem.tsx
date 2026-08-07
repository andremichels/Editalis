import Link from 'next/link';
import type { Article } from '@/lib/types';

interface SearchResultItemProps {
  article: Article;
  favorita: boolean;
  onToggleFavorita: () => void;
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return '';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch { return iso; }
}

export function SearchResultItem({ article, favorita, onToggleFavorita }: SearchResultItemProps) {
  const nd = article.normalized_data;
  const modality = nd?.modality || (nd?.doc_type || 'publicação');
  const title = article.title_marker || article.title;
  const organ = article.organ_level_1 || article.organ || 'DOU';
  const uf = nd?.ufs?.join(', ') || '';
  const value = nd?.value;
  const openingDate = nd?.opening_date ? formatDate(nd.opening_date) : '';

  return (
    <div className="grid grid-cols-[1fr_auto] gap-7 py-[22px] px-10" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span
            className="text-[11px] font-bold uppercase py-[3px] px-[7px]"
            style={{ letterSpacing: '0.08em', background: 'var(--color-accent-200)', color: 'var(--color-accent-800)' }}
          >
            {modality.replace(/_/g, ' ')}
          </span>
          {nd?.doc_type && (
            <span
              className="text-[11px] font-bold uppercase py-0.5 px-[7px]"
              style={{ letterSpacing: '0.08em', border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-700)' }}
            >
              {nd.doc_type.replace(/_/g, ' ')}
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--color-neutral-600)' }}>
            {nd?.process_number && `nº ${nd.process_number} · `}publicado {formatDate(article.published_date)}
          </span>
        </div>
        <Link href={`/artigo/${article.slug}`} className="block text-[13px] font-extrabold leading-[1.4] mb-2 cursor-pointer no-underline uppercase tracking-[0.02em]" style={{ color: 'var(--color-text)' }}>
          {title}
        </Link>
        <div className="text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>
          {organ}{uf ? ` · ${uf}` : ''}
        </div>
      </div>
      <div className="text-right whitespace-nowrap flex flex-col items-end gap-2">
        {value != null && <div className="text-lg font-black">{formatCurrency(value)}</div>}
        {openingDate && <div className="text-xs" style={{ color: 'var(--color-neutral-600)' }}>abertura {openingDate}</div>}
        <button
          onClick={onToggleFavorita}
          className="text-xs font-bold py-[7px] px-3 cursor-pointer"
          style={favorita
            ? { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: 'var(--color-bg)' }
            : { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
        >
          {favorita ? '★ Favorita' : '☆ Favoritar'}
        </button>
      </div>
    </div>
  );
}

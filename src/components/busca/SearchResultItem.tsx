import Link from 'next/link';
import type { Bid } from '@/lib/bids';

interface SearchResultItemProps {
  bid: Bid;
  favorita: boolean;
  onToggleFavorita: () => void;
}

export function SearchResultItem({ bid, favorita, onToggleFavorita }: SearchResultItemProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-7 py-[22px] px-10" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span
            className="text-[11px] font-bold uppercase py-[3px] px-[7px]"
            style={{ letterSpacing: '0.08em', background: 'var(--color-accent-200)', color: 'var(--color-accent-800)' }}
          >
            {bid.modalidade}
          </span>
          <span
            className="text-[11px] font-bold uppercase py-0.5 px-[7px]"
            style={{ letterSpacing: '0.08em', border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-700)' }}
          >
            {bid.situacao}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-neutral-600)' }}>
            nº {bid.numero} · publicado {bid.publicadoEm}
          </span>
        </div>
        <Link href={`/licitacao/${bid.id}`} className="block text-lg font-extrabold leading-[1.3] mb-2 cursor-pointer">
          {bid.objeto}
        </Link>
        <div className="text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>
          {bid.orgao} · {bid.municipio}/{bid.uf}
        </div>
      </div>
      <div className="text-right whitespace-nowrap flex flex-col items-end gap-2">
        <div className="text-lg font-black">{bid.valor}</div>
        <div className="text-xs" style={{ color: 'var(--color-neutral-600)' }}>abertura {bid.abertura}</div>
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

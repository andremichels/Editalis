import Link from 'next/link';
import type { Bid } from '@/lib/bids';

interface BidListProps {
  title: string;
  bids: Bid[];
  viewAllHref: string;
  viewAllLabel: string;
}

export function BidList({ title, bids, viewAllHref, viewAllLabel }: BidListProps) {
  return (
    <div style={{ borderRight: '2px solid var(--color-text)' }} className="min-w-0">
      <div className="pt-6 px-10 pb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-black tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{title}</h2>
        <Link href={viewAllHref} className="text-[13px] font-bold" style={{ color: 'var(--color-accent)' }}>
          {viewAllLabel} →
        </Link>
      </div>
      <div className="px-10 pb-10">
        <div style={{ borderTop: '2px solid var(--color-text)' }}>
          {bids.map((bid) => (
            <Link
              key={bid.id}
              href={`/licitacao/${bid.id}`}
              className="grid grid-cols-[1fr_auto] gap-6 items-start py-[18px] cursor-pointer"
              style={{ borderBottom: '1px solid var(--color-divider)' }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span
                    className="text-[11px] font-bold uppercase py-[3px] px-[7px]"
                    style={{ letterSpacing: '0.08em', background: 'var(--color-accent-200)', color: 'var(--color-accent-800)' }}
                  >
                    {bid.modalidade}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-neutral-600)' }}>{bid.orgao} · {bid.uf}</span>
                </div>
                <div className="text-base font-bold leading-[1.3]">{bid.objeto}</div>
              </div>
              <div className="text-right whitespace-nowrap">
                <div className="text-base font-black">{bid.valor}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-neutral-600)' }}>abre {bid.abertura}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

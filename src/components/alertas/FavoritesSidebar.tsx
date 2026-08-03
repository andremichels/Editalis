import Link from 'next/link';
import { getBidById } from '@/lib/bids';
import { favoritasDestaque } from '@/lib/alertProfiles';

export function FavoritesSidebar() {
  return (
    <div className="py-7 px-6">
      <div className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
        Favoritas · 14
      </div>
      <div style={{ borderTop: '2px solid var(--color-text)' }}>
        {favoritasDestaque.map(({ bidId, prazo, urgente }) => {
          const bid = getBidById(bidId);
          if (!bid) return null;
          return (
            <Link
              key={bidId}
              href={`/licitacao/${bidId}`}
              className="block py-4 cursor-pointer"
              style={{ borderBottom: '1px solid var(--color-divider)' }}
            >
              <div className="text-[15px] font-bold leading-[1.3]">{bid.objeto}</div>
              <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--color-neutral-600)' }}>
                <span>{bid.orgao}</span>
                <span className="font-bold" style={{ color: urgente ? 'var(--color-accent)' : 'var(--color-neutral-700)' }}>{prazo}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import type { Bid } from '@/lib/bids';

interface BidDetailHeaderProps {
  bid: Bid;
  favorita: boolean;
  onToggleFavorita: () => void;
}

export function BidDetailHeader({ bid, favorita, onToggleFavorita }: BidDetailHeaderProps) {
  return (
    <>
      <div className="py-4 px-10" style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <Link href="/busca" className="text-[13px] font-semibold" style={{ color: 'var(--color-neutral-700)' }}>
          ← Voltar aos resultados
        </Link>
      </div>
      <div className="py-8 px-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-start" style={{ borderBottom: '2px solid var(--color-text)' }}>
        <div>
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className="text-[11px] font-bold uppercase py-1 px-2" style={{ letterSpacing: '0.08em', background: 'var(--color-accent)', color: '#fff' }}>
              {bid.modalidade}
            </span>
            <span className="text-[11px] font-bold uppercase py-[3px] px-2" style={{ letterSpacing: '0.08em', border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-700)' }}>
              {bid.situacao}
            </span>
            <span className="text-[13px]" style={{ color: 'var(--color-neutral-600)' }}>
              nº {bid.numero} · processo {bid.processo}
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-black tracking-[-0.03em] leading-[1.06] mb-3 max-w-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {bid.objeto}
          </h1>
          <div className="text-[15px]" style={{ color: 'var(--color-neutral-700)' }}>
            {bid.orgao}{bid.secretaria ? ` · ${bid.secretaria}` : ''} · {bid.municipio}/{bid.uf}
          </div>
        </div>
        <div className="flex flex-col gap-2.5 min-w-[200px]">
          <button
            onClick={onToggleFavorita}
            className="text-left text-sm font-bold py-3 px-4 cursor-pointer"
            style={favorita
              ? { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: 'var(--color-bg)' }
              : { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
          >
            {favorita ? '★ Nas favoritas' : '☆ Favoritar'}
          </button>
          <button className="text-left text-sm font-bold py-3 px-4 cursor-pointer" style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}>
            Criar alerta deste órgão
          </button>
          <button className="text-left text-sm font-bold py-3 px-4 cursor-pointer" style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}>
            Baixar edital (PDF)
          </button>
        </div>
      </div>
    </>
  );
}

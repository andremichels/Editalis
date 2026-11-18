import Link from 'next/link';
import { openingLabel } from '@/lib/format';

export interface DeadlineItem {
  slug: string;
  title: string;
  organ: string;
  /** dias até a abertura (0 = hoje) */
  days: number;
}

/** Vermelho só para o que é urgente (até 3 dias). */
function toneColor(days: number) {
  if (days <= 3) return 'var(--color-accent)';
  if (days <= 7) return 'var(--color-text)';
  return 'var(--color-neutral-700)';
}

/** Faixa no topo do Painel: o que abre primeiro, lado a lado. */
export function DeadlinesCard({ items }: { items: DeadlineItem[] | null }) {
  return (
    <div className="px-6 sm:px-10 py-5" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="flex items-baseline justify-between gap-3 mb-3.5">
        <h2 className="text-[12px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'var(--color-neutral-700)' }}>
          Prazos próximos
        </h2>
        {items && items.length > 0 && (
          <span className="text-[12px]" style={{ color: 'var(--color-neutral-700)' }}>aberturas nos próximos 30 dias</span>
        )}
      </div>
      {items === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-[14px]" style={{ color: 'var(--color-neutral-700)' }}>
          Nenhuma abertura de licitação nos próximos 30 dias entre as publicações recentes.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {items.slice(0, 4).map((item) => (
            <Link
              key={item.slug}
              href={`/artigo/${item.slug}`}
              className="block pl-3 hover:opacity-80 transition-opacity"
              style={{ borderLeft: `4px solid ${toneColor(item.days)}` }}
            >
              <div className="text-[13px] font-black" style={{ color: toneColor(item.days) }}>
                {openingLabel(item.days)}
              </div>
              <div className="text-[13px] font-bold mt-0.5 leading-snug line-clamp-2" style={{ color: 'var(--color-text)' }}>
                {item.title}
              </div>
              <div className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--color-neutral-700)' }}>
                {item.organ}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

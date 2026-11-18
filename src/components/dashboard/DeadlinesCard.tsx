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
  return 'var(--color-neutral-600)';
}

export function DeadlinesCard({ items }: { items: DeadlineItem[] | null }) {
  return (
    <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="text-[12px] font-bold uppercase mb-3.5" style={{ letterSpacing: '0.12em', color: 'var(--color-neutral-700)' }}>
        Prazos próximos
      </div>
      {items === null ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-[14px]" style={{ color: 'var(--color-neutral-700)' }}>
          Nenhuma abertura de licitação nos próximos 30 dias entre as publicações recentes.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/artigo/${item.slug}`}
              className="block pl-3 hover:opacity-80 transition-opacity"
              style={{ borderLeft: `4px solid ${toneColor(item.days)}` }}
            >
              <div className="text-[13px] font-black" style={{ color: toneColor(item.days) }}>
                {openingLabel(item.days)}
              </div>
              <div className="text-[13px] font-bold mt-0.5 leading-snug" style={{ color: 'var(--color-text)' }}>
                {item.title}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: 'var(--color-neutral-700)' }}>
                {item.organ}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

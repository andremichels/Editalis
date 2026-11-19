import Link from 'next/link';
import type { Article } from '@/lib/types';
import { articleOrgan, articleTitle, articleUfs, daysUntil, formatMoneyCompact, isUrgent, parseDate } from '@/lib/format';

function when(value?: string | null): string {
  const d = parseDate(value);
  if (!d) return '';
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const day = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const hasTime = typeof value === 'string' && /T\d{2}:\d{2}/.test(value) && !/T00:00/.test(value);
  return `${weekday} ${day}${hasTime ? `, ${d.getHours()}h${d.getMinutes() ? String(d.getMinutes()).padStart(2, '0') : ''}` : ''}`;
}

/** Os três prazos de abertura mais próximos, em cartões. */
export function DeadlinesCard({ items }: { items: Article[] | null }) {
  const weekOnly = (items ?? []).every((a) => (daysUntil(a.normalized_data?.opening_date) ?? 99) <= 7);
  return (
    <section className="mt-10 mx-4 sm:mx-12 flex flex-col gap-4" aria-labelledby="prazos-titulo">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 id="prazos-titulo" className="text-[22px] font-extrabold tracking-[-0.01em]">
          {items && items.length > 0 && weekOnly ? 'Prazos desta semana' : 'Próximos prazos'}
        </h2>
        <Link href="/favoritos" className="text-[14px] font-bold underline">Ver prazos dos favoritos</Link>
      </div>
      {items === null ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-44 skeleton" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
          Nenhuma abertura de licitação nos próximos 30 dias entre as publicações recentes.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {items.slice(0, 3).map((a) => {
            const days = daysUntil(a.normalized_data?.opening_date) ?? 0;
            const urgent = isUrgent(days);
            const tone = urgent ? 'var(--color-accent-text)' : 'var(--color-text)';
            const value = formatMoneyCompact(a.normalized_data?.value);
            const ufs = articleUfs(a);
            return (
              <Link
                key={a.id}
                href={`/artigo/${a.slug}`}
                className="flex flex-col gap-2.5 p-5 hover:no-underline"
                style={{ border: '2px solid var(--color-text)', borderTop: `6px solid ${urgent ? 'var(--color-accent)' : 'var(--color-text)'}`, background: 'var(--color-field)' }}
              >
                <span className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[40px] font-extrabold leading-none" style={{ color: tone }}>{days}</span>
                  <span className="text-[15px] font-bold" style={{ color: tone }}>
                    {days === 1 ? 'dia' : 'dias'} · {when(a.normalized_data?.opening_date)}
                  </span>
                </span>
                <span className="text-[16px] font-bold leading-[1.35] line-clamp-3" style={{ color: 'var(--color-text)' }}>{articleTitle(a, 140)}</span>
                <span className="text-[13px]" style={{ color: 'var(--color-muted)' }}>{articleOrgan(a)}{ufs ? ` · ${ufs}` : ''}</span>
                <span className="text-[14px] font-bold" style={{ color: value ? 'var(--color-text)' : 'var(--color-muted)' }}>{value || 'Valor não informado'}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

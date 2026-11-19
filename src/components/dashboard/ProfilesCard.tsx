import Link from 'next/link';
import type { AlertSummary } from '@/lib/useAccount';
import type { Article } from '@/lib/types';
import { articleOrgan, articleTitle, daysUntil, isUrgent } from '@/lib/format';

const sectionHead = 'flex items-baseline justify-between gap-3 pb-3';

/** Alertas no Painel: novos resultados em destaque; pausados em cinza. */
export function ProfilesCard({ alerts }: { alerts: AlertSummary[] | null }) {
  return (
    <section className="flex flex-col">
      <div className={sectionHead} style={{ borderBottom: '2px solid var(--color-text)' }}>
        <h2 className="text-[18px] font-extrabold">Seus alertas</h2>
        <Link href="/alertas" className="text-[13px] font-bold underline">Gerenciar</Link>
      </div>
      {alerts === null ? (
        <div className="flex flex-col gap-3 pt-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-10 skeleton" />)}
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-[14px] pt-4" style={{ color: 'var(--color-muted)' }}>
          Nenhum alerta ainda. Salve uma busca para ser avisado de novas publicações.
        </p>
      ) : (
        alerts.map((a) => (
          <Link
            key={a.id}
            href={`/alertas?abrir=${a.id}`}
            className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 py-4"
            style={{ borderBottom: '1px solid var(--color-line)' }}
          >
            <span className="text-[15px] font-bold leading-[1.3]" style={{ color: a.enabled ? 'var(--color-text)' : 'var(--color-muted)' }}>{a.name}</span>
            {a.enabled && a.match_count > 0 ? (
              <span className="self-start py-0.5 px-2 text-[13px] font-extrabold" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                +{a.match_count}
              </span>
            ) : (
              <span />
            )}
            <span className="text-[13px]" style={{ color: 'var(--color-muted)' }}>
              {!a.enabled ? 'Pausado' : a.match_count > 0 ? `${a.match_count} resultado${a.match_count === 1 ? '' : 's'}` : 'Nenhum resultado novo'}
            </span>
          </Link>
        ))
      )}
      <Link
        href="/alertas?novo=1"
        className="mt-4 h-11 flex items-center px-4 text-[14px] font-bold"
        style={{ border: '2px solid var(--color-text)' }}
      >
        + Novo alerta
      </Link>
    </section>
  );
}

/** Favoritos com abertura pela frente, do mais próximo ao mais distante. */
export function FavoriteDeadlines({ articles, total }: { articles: Article[] | null; total: number }) {
  const withDeadline = (articles ?? [])
    .map((a) => ({ a, days: daysUntil(a.normalized_data?.opening_date) }))
    .filter((x): x is { a: Article; days: number } => x.days != null && x.days >= 0)
    .sort((x, y) => x.days - y.days)
    .slice(0, 4);
  return (
    <section className="flex flex-col">
      <div className={sectionHead} style={{ borderBottom: '2px solid var(--color-text)' }}>
        <h2 className="text-[18px] font-extrabold">Favoritos com prazo</h2>
      </div>
      {articles === null ? (
        <div className="flex flex-col gap-3 pt-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-10 skeleton" />)}
        </div>
      ) : withDeadline.length === 0 ? (
        <p className="text-[14px] pt-4" style={{ color: 'var(--color-muted)' }}>
          {total === 0 ? 'Nenhum favorito ainda.' : 'Nenhum favorito com abertura pela frente.'}
        </p>
      ) : (
        withDeadline.map(({ a, days }) => (
          <Link key={a.id} href={`/artigo/${a.slug}`} className="flex flex-col gap-1 py-3.5" style={{ borderBottom: '1px solid var(--color-line)' }}>
            <span className="text-[14px] font-bold leading-[1.35] line-clamp-2">{articleTitle(a, 100)}</span>
            <span className="text-[13px]">
              <strong style={{ color: isUrgent(days) ? 'var(--color-accent-text)' : 'var(--color-text)' }}>
                {days === 0 ? 'hoje' : days === 1 ? 'amanhã' : `${days} dias`}
              </strong>
              <span style={{ color: 'var(--color-muted)' }}> · {articleOrgan(a)}</span>
            </span>
          </Link>
        ))
      )}
      {total > 0 && (
        <Link href="/favoritos" className="mt-3 text-[13px] font-bold underline">
          Ver {total === 1 ? 'o favorito' : `os ${total} favoritos`}
        </Link>
      )}
    </section>
  );
}

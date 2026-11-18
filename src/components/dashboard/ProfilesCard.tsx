import Link from 'next/link';
import type { AlertSummary } from '@/lib/useAccount';

/** Resumo dos alertas no Painel; cada linha abre os resultados daquele alerta. */
export function ProfilesCard({ alerts }: { alerts: AlertSummary[] | null }) {
  return (
    <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="text-[12px] font-bold uppercase mb-3.5" style={{ letterSpacing: '0.12em', color: 'var(--color-neutral-700)' }}>
        Seus alertas
      </div>
      {alerts === null ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-5 skeleton" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-[14px]" style={{ color: 'var(--color-neutral-700)' }}>
          Nenhum alerta criado ainda. Salve uma busca para ser avisado de novas publicações.
        </p>
      ) : (
        <div className="flex flex-col text-sm">
          {alerts.map((a) => (
            <Link
              key={a.id}
              href={`/alertas?abrir=${a.id}`}
              className="flex justify-between gap-3 py-2 hover:underline"
              style={{ color: a.enabled ? 'var(--color-text)' : 'var(--color-neutral-600)' }}
            >
              <span className="font-bold truncate">{a.name}{a.enabled ? '' : ' (pausado)'}</span>
              <span className="font-bold whitespace-nowrap">
                {a.match_count > 0 ? `${a.match_count} resultado${a.match_count === 1 ? '' : 's'}` : 'nenhum resultado'}
              </span>
            </Link>
          ))}
        </div>
      )}
      <Link
        href="/alertas"
        className="mt-4 block py-2.5 px-4 text-[13px] font-bold"
        style={{ border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
      >
        {alerts && alerts.length === 0 ? 'Criar alerta' : 'Gerenciar alertas'}
      </Link>
    </div>
  );
}

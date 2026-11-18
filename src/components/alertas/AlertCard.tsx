import { formatMoney } from '@/lib/utils';
import { modalityLabel } from '@/lib/format';
import type { Article } from '@/lib/types';
import { MatchesList } from './MatchesList';

export interface AlertProfile {
  id: number;
  name: string;
  keywords: string[];
  organs: string[];
  ufs: string[];
  modalities: string[];
  value_min: number | null;
  value_max: number | null;
  enabled: boolean;
  match_count: number;
  created_at: string;
}

interface AlertCardProps {
  alert: AlertProfile;
  expanded: boolean;
  matches: Article[];
  matchesLoading: boolean;
  onToggleMatches: () => void;
  onEdit: () => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
}

function Tag({ children, variant = 'outline' }: { children: React.ReactNode; variant?: 'outline' | 'neutral' | 'strong' }) {
  const styles = {
    outline: { border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-700)' },
    neutral: { background: 'var(--color-neutral-200)', color: 'var(--color-neutral-700)' },
    strong: { background: 'var(--color-text)', color: 'var(--color-bg)', fontWeight: 700 },
  } as const;
  return (
    <span className="text-xs py-0.5 px-2" style={styles[variant]}>
      {children}
    </span>
  );
}

export function AlertCard({ alert, expanded, matches, matchesLoading, onToggleMatches, onEdit, onToggleEnabled, onDelete }: AlertCardProps) {
  return (
    <div className="py-6" style={{ borderBottom: '1px solid var(--color-divider)', opacity: alert.enabled ? 1 : 0.6 }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
            <h3 className="text-lg font-extrabold" style={{ fontFamily: 'var(--font-heading)' }}>{alert.name}</h3>
            <button
              onClick={onToggleEnabled}
              className="text-xs font-bold py-1 px-2.5 cursor-pointer whitespace-nowrap"
              style={alert.enabled
                ? { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: 'var(--color-bg)' }
                : { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
            >
              {alert.enabled ? 'Ativo' : 'Pausado'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {alert.keywords.map((kw) => <Tag key={kw} variant="neutral">{kw}</Tag>)}
            {alert.organs.map((o) => <Tag key={o}>{o}</Tag>)}
            {alert.ufs.map((uf) => <Tag key={uf} variant="strong">{uf}</Tag>)}
            {alert.modalities.map((m) => <Tag key={m}>{modalityLabel(m)}</Tag>)}
            {alert.value_min !== null && <Tag>≥ {formatMoney(alert.value_min)}</Tag>}
            {alert.value_max !== null && <Tag>≤ {formatMoney(alert.value_max)}</Tag>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={onToggleMatches}
            className="text-[13px] font-bold py-2 px-3 cursor-pointer whitespace-nowrap"
            style={{ border: '2px solid var(--color-text)', background: expanded ? 'var(--color-text)' : 'transparent', color: expanded ? 'var(--color-bg)' : 'var(--color-text)' }}
          >
            {expanded ? 'Ocultar resultados' : `Ver ${alert.match_count || ''} resultado${alert.match_count === 1 ? '' : 's'}`.replace('Ver  ', 'Ver ')}
          </button>
          <button onClick={onEdit} className="text-[13px] font-bold py-2 px-3 cursor-pointer" style={{ color: 'var(--color-text)' }}>
            Editar
          </button>
          <span className="w-px h-6 mx-1" style={{ background: 'var(--color-divider)' }} aria-hidden />
          <button onClick={onDelete} className="text-[13px] font-semibold py-2 px-3 cursor-pointer underline" style={{ color: 'var(--color-neutral-700)' }}>
            Remover
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-divider)' }}>
          <MatchesList loading={matchesLoading} matches={matches} />
        </div>
      )}
    </div>
  );
}

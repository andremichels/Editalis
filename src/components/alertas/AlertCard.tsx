import { formatMoney } from '@/lib/utils';
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

interface MatchArticle {
  id: number;
  slug: string;
  title: string;
  title_marker?: string;
  published_date: string;
  organ_level_1?: string;
}

interface AlertCardProps {
  alert: AlertProfile;
  expanded: boolean;
  matches: MatchArticle[];
  matchesLoading: boolean;
  onToggleMatches: () => void;
  onEdit: () => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
}

function Tag({ children, variant = 'outline' }: { children: React.ReactNode; variant?: 'outline' | 'neutral' | 'accent' }) {
  const styles = {
    outline: { border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-700)' },
    neutral: { background: 'var(--color-neutral-200)', color: 'var(--color-neutral-700)' },
    accent: { background: 'var(--color-accent)', color: '#fff', fontWeight: 700 },
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
            {alert.ufs.map((uf) => <Tag key={uf} variant="accent">{uf}</Tag>)}
            {alert.modalities.map((m) => <Tag key={m}>{m}</Tag>)}
            {alert.value_min !== null && <Tag>≥ {formatMoney(alert.value_min)}</Tag>}
            {alert.value_max !== null && <Tag>≤ {formatMoney(alert.value_max)}</Tag>}
          </div>
        </div>
        <div className="flex gap-4 shrink-0">
          <button onClick={onToggleMatches} className="text-xs font-bold cursor-pointer" style={{ color: 'var(--color-neutral-700)' }}>
            {expanded ? 'Fechar' : `Matches${alert.match_count ? ` (${alert.match_count})` : ''}`}
          </button>
          <button onClick={onEdit} className="text-xs font-bold cursor-pointer" style={{ color: 'var(--color-neutral-700)' }}>
            Editar
          </button>
          <button onClick={onDelete} className="text-xs font-bold cursor-pointer" style={{ color: 'var(--color-accent)' }}>
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

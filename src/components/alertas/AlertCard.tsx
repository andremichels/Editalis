import { formatMoney } from '@/lib/utils';
import { modalityLabel } from '@/lib/format';
import type { Article } from '@/lib/types';
import type { AlertChannel } from '@/lib/notifications';
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
  channel?: AlertChannel;
}

const CHANNEL_LINE: Record<AlertChannel, string> = {
  email: 'Avisa no e-mail diário, às 6h30',
  whatsapp: 'Avisa na hora, por WhatsApp',
  app: 'Avisa só aqui no Editalis',
};

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

/** "Palavras obras, reforma · UFs SP · modalidade pregão · a partir de R$ 200.000" */
function Criteria({ alert }: { alert: AlertProfile }) {
  const parts: [string, string][] = [];
  if (alert.keywords.length) parts.push([alert.keywords.length === 1 ? 'Palavra' : 'Palavras', alert.keywords.join(', ')]);
  if (alert.ufs.length) parts.push([alert.ufs.length === 1 ? 'UF' : 'UFs', alert.ufs.join(', ')]);
  if (alert.organs.length) parts.push([alert.organs.length === 1 ? 'órgão' : 'órgãos', alert.organs.join(', ')]);
  if (alert.modalities.length) parts.push([alert.modalities.length === 1 ? 'modalidade' : 'modalidades', alert.modalities.map(modalityLabel).join(', ')]);
  if (alert.value_min !== null) parts.push(['a partir de', formatMoney(alert.value_min)]);
  if (alert.value_max !== null) parts.push(['até', formatMoney(alert.value_max)]);
  const strong = { color: 'var(--color-text)' };
  return (
    <p className="text-[14px] leading-[1.5]" style={{ color: 'var(--color-muted)' }}>
      {parts.length === 0
        ? 'Sem critérios — edite para definir o que acompanhar.'
        : parts.map(([label, value], i) => (
            <span key={label}>
              {i > 0 && ' · '}
              {label} <strong style={strong}>{value}</strong>
            </span>
          ))}
      {alert.modalities.length === 0 && alert.value_min === null && alert.value_max === null && parts.length > 0 && ' · qualquer modalidade e valor'}
    </p>
  );
}

/**
 * Cartão de alerta: critérios numa frase, quantas publicações novas o alerta
 * encontrou desde ontem (match_count, atualizado de hora em hora) em destaque
 * à direita, e as ações. Pausado = borda tracejada, cinza.
 */
export function AlertCard({ alert, expanded, matches, matchesLoading, onToggleMatches, onEdit, onToggleEnabled, onDelete }: AlertCardProps) {
  const n = alert.match_count || 0;
  const btn = 'h-11 px-4 text-[14px] font-bold cursor-pointer whitespace-nowrap';
  return (
    <article
      className="py-[22px] px-6"
      style={
        alert.enabled
          ? { background: 'var(--color-field)', border: '2px solid var(--color-text)' }
          : { background: 'transparent', border: '2px dashed #8c8783' }
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_150px] gap-6">
        <div className="flex flex-col gap-2.5 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-[20px] font-extrabold" style={{ color: alert.enabled ? 'var(--color-text)' : 'var(--color-muted)' }}>{alert.name}</h2>
            {/* Chave liga/desliga: pausar não apaga o alerta, só para os avisos */}
            <button
              type="button"
              role="switch"
              aria-checked={alert.enabled}
              aria-label={`${alert.enabled ? 'Pausar' : 'Ativar'} o alerta ${alert.name}`}
              onClick={onToggleEnabled}
              className="flex items-center gap-2 h-8 cursor-pointer"
            >
              <span
                className="relative inline-block w-9 h-5 shrink-0"
                style={{ background: alert.enabled ? 'var(--color-text)' : 'var(--color-neutral-300)', border: '2px solid var(--color-text)' }}
              >
                <span
                  className="absolute top-0 w-4 h-4"
                  style={{ left: alert.enabled ? 16 : 0, background: alert.enabled ? 'var(--color-bg)' : 'var(--color-text)', transition: 'left 0.15s ease' }}
                />
              </span>
              <span className="text-[13px] font-bold" style={{ color: 'var(--color-text)' }}>{alert.enabled ? 'Ativo' : 'Pausado'}</span>
            </button>
          </div>
          <Criteria alert={alert} />
          <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>
            {alert.enabled
              ? `Verificado de hora em hora · ${CHANNEL_LINE[alert.channel ?? 'app']}`
              : 'Pausado · não envia avisos'}
          </p>
          <div className="flex gap-2 flex-wrap pt-1">
            <button
              type="button"
              onClick={onToggleMatches}
              aria-expanded={expanded}
              className={btn}
              style={expanded || !alert.enabled ? { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' } : { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: '#fff' }}
            >
              {expanded ? 'Ocultar resultados' : n > 0 ? `Ver ${n} ${n === 1 ? 'novo' : 'novos'}` : 'Ver resultados'}
            </button>
            <button type="button" onClick={onEdit} className={btn} style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}>
              Editar
            </button>
            <button type="button" onClick={onDelete} className="h-11 px-3 text-[14px] font-semibold underline cursor-pointer" style={{ color: 'var(--color-muted)' }}>
              Remover
            </button>
          </div>
        </div>
        <div className="sm:text-right">
          {alert.enabled ? (
            <>
              <p className="text-[44px] font-extrabold leading-none" style={{ color: n > 0 ? 'var(--color-accent-text)' : 'var(--color-muted)' }}>
                {n > 0 ? `+${n}` : '0'}
              </p>
              <p className="mt-1.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>novos desde ontem</p>
            </>
          ) : (
            <>
              <p className="text-[28px] font-extrabold leading-none" style={{ color: 'var(--color-muted)' }}>—</p>
              <p className="mt-1.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>em pausa</p>
            </>
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-5" style={{ borderTop: '2px solid var(--color-text)' }}>
          <MatchesList loading={matchesLoading} matches={matches} />
        </div>
      )}
    </article>
  );
}

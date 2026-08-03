import type { Bid } from '@/lib/bids';

const sectionLabel = 'text-[11px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-600)' };

const andamentoDotStyle = {
  done: { background: 'var(--color-text)' },
  current: { background: 'var(--color-accent)' },
  pending: { border: '2px solid var(--color-neutral-400)' },
} as const;

export function BidSidebar({ bid }: { bid: Bid }) {
  return (
    <div>
      <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
        <div className={sectionLabel} style={{ ...sectionLabelStyle, marginBottom: 6 }}>Valor total estimado</div>
        <div className="text-[32px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)' }}>{bid.valor}</div>
      </div>

      <div className="p-6 text-sm" style={{ borderBottom: '2px solid var(--color-text)' }}>
        {[
          ['Publicação', bid.publicadoCompleto, undefined],
          ['Abertura', bid.aberturaCompleta, 'var(--color-accent)'],
          ['Impugnação até', bid.impugnacao, undefined],
          ['Regime', bid.regime, undefined],
        ].map(([label, value, color], i, arr) => (
          <div
            key={label}
            className="flex justify-between py-2.5"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
          >
            <span style={{ color: 'var(--color-neutral-700)' }}>{label}</span>
            <span className="font-bold" style={color ? { color } : undefined}>{value}</span>
          </div>
        ))}
      </div>

      <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
        <div className={sectionLabel} style={{ ...sectionLabelStyle, marginBottom: 14 }}>Andamento</div>
        <div className="flex flex-col gap-3.5 text-[13px]">
          {bid.andamento.map((step) => (
            <div key={step.label} className="flex gap-3">
              <div className="w-2.5 h-2.5 mt-1 shrink-0" style={andamentoDotStyle[step.state]} />
              <div>
                <div className="font-extrabold" style={step.state === 'pending' ? { color: 'var(--color-neutral-600)' } : undefined}>{step.label}</div>
                <div style={{ color: 'var(--color-neutral-600)' }}>{step.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className={sectionLabel} style={{ ...sectionLabelStyle, marginBottom: 10 }}>Histórico do órgão</div>
        <div className="text-sm leading-[1.6]" style={{ color: 'var(--color-neutral-800)' }}>{bid.historicoOrgao}</div>
      </div>
    </div>
  );
}

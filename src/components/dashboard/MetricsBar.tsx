interface Metric {
  label: string;
  value: string;
  accent?: boolean;
}

export function MetricsBar({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-4" style={{ borderBottom: '2px solid var(--color-text)' }}>
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={`py-7 ${i === 0 ? 'px-10' : 'px-6'}`}
          style={{ borderRight: i < metrics.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
        >
          <div className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
            {m.label}
          </div>
          <div
            className="text-[38px] font-black tracking-[-0.03em] mt-2"
            style={{ color: m.accent ? 'var(--color-accent)' : 'var(--color-text)' }}
          >
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}

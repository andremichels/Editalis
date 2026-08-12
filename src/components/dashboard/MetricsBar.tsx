interface Metric {
  label: string;
  value: string;
  accent?: boolean;
}

export function MetricsBar({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ borderBottom: '2px solid var(--color-text)' }}>
      {metrics.map((m, i) => {
        const mobileRight = i % 2 === 0;
        const desktopRight = i < metrics.length - 1;
        const mobileBottom = i < 2;
        const rightBorder = mobileRight && desktopRight ? 'border-r' : !mobileRight && desktopRight ? 'lg:border-r' : mobileRight && !desktopRight ? 'border-r lg:border-r-0' : '';
        const bottomBorder = mobileBottom ? 'border-b lg:border-b-0' : '';

        return (
          <div
            key={m.label}
            className={`py-5 lg:py-7 min-w-0 ${i === 0 ? 'px-5 lg:px-10' : 'px-5 lg:px-6'} ${rightBorder} ${bottomBorder}`}
            style={{ borderColor: 'var(--color-divider)' }}
          >
            <div className="text-[11px] font-bold uppercase truncate" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
              {m.label}
            </div>
            <div
              className="text-[26px] lg:text-[38px] font-black tracking-[-0.03em] mt-2 truncate"
              style={{ color: m.accent ? 'var(--color-accent)' : 'var(--color-text)' }}
            >
              {m.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

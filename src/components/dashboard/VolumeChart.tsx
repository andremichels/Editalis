interface VolumeChartProps {
  values: number[];
  startLabel: string;
  endLabel: string;
}

export function VolumeChart({ values, startLabel, endLabel }: VolumeChartProps) {
  return (
    <div className="p-6">
      <div className="text-[11px] font-bold uppercase mb-3.5" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
        Volume por dia
      </div>
      <div className="flex items-end gap-1.5 h-[88px]">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ height: `${v}%`, background: i === values.length - 1 ? 'var(--color-accent)' : 'var(--color-neutral-400)' }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11px] mt-2" style={{ color: 'var(--color-neutral-600)' }}>
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  );
}

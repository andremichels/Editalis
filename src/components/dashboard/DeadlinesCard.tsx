interface Deadline {
  title: string;
  days: string;
  tone: 'urgent' | 'default' | 'later';
}

const toneColor = {
  urgent: 'var(--color-accent)',
  default: 'var(--color-text)',
  later: 'var(--color-neutral-400)',
} as const;

export function DeadlinesCard({ items }: { items: Deadline[] }) {
  return (
    <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="text-[11px] font-bold uppercase mb-3.5" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
        Prazos desta semana
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="pl-3" style={{ borderLeft: `4px solid ${toneColor[item.tone]}` }}>
            <div className="text-[13px] font-extrabold">{item.title}</div>
            <div className="text-xs" style={{ color: 'var(--color-neutral-700)' }}>{item.days}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

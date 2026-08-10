interface Deadline {
  id?: number;
  slug?: string;
  title: string;
  organ?: string;
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
        Prazos próximos
      </div>
      {items.length === 0 ? (
        <p className="text-[13px]" style={{ color: 'var(--color-neutral-500)' }}>
          Nenhum prazo de abertura encontrado nos artigos recentes.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.slug ? `/artigo/${item.slug}` : undefined}
              className="block pl-3 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ borderLeft: `4px solid ${toneColor[item.tone]}`, textDecoration: 'none' }}
            >
              <div className="text-[13px] font-extrabold" style={{ color: 'var(--color-text)' }}>
                {item.title}
              </div>
              {item.organ && (
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-neutral-600)' }}>
                  {item.organ}
                </div>
              )}
              <div className="text-xs mt-0.5 font-bold" style={{ color: toneColor[item.tone] }}>
                {item.days}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

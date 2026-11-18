interface Profile {
  name: string;
  count: string;
}

export function ProfilesCard({ items, onManage }: { items: Profile[] | null; onManage: () => void }) {
  return (
    <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="text-[11px] font-bold uppercase mb-3.5" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
        Perfis monitorados
      </div>
      {items === null ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-5 skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-[13px]" style={{ color: 'var(--color-neutral-500)' }}>
          Nenhum alerta criado ainda.
        </p>
      ) : (
      <div className="flex flex-col gap-2.5 text-sm">
        {items.map((p) => (
          <div key={p.name} className="flex justify-between">
            <span className="font-bold">{p.name}</span>
            <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{p.count}</span>
          </div>
        ))}
      </div>
      )}
      <button
        onClick={onManage}
        className="mt-4 w-full text-left py-2.5 px-4 text-[13px] font-bold cursor-pointer"
        style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
      >
        {items && items.length === 0 ? 'Criar alerta' : 'Gerenciar alertas'}
      </button>
    </div>
  );
}

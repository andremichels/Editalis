export type PerfilTab = 'conta' | 'empresa' | 'assinatura' | 'pagamentos' | 'equipe';

const TABS: { id: PerfilTab; label: string }[] = [
  { id: 'conta', label: 'Conta' },
  { id: 'empresa', label: 'Empresa e faturamento' },
  { id: 'assinatura', label: 'Assinatura' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'equipe', label: 'Equipe e segurança' },
];

interface AccountHeaderProps {
  initials: string;
  name: string;
  subtitle: string;
  stats: { perfis: string; favoritas: number; usuarios: number };
  activeTab: PerfilTab;
  onTabChange: (tab: PerfilTab) => void;
}

export function AccountHeader({ initials, name, subtitle, stats, activeTab, onTabChange }: AccountHeaderProps) {
  return (
    <div className="pt-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="flex items-center gap-5">
        <div
          className="shrink-0 flex items-center justify-center text-2xl font-black"
          style={{ width: 68, height: 68, background: 'var(--color-text)', color: '#fff', letterSpacing: '-0.02em' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            {name}
          </h1>
          <div className="text-sm mt-1" style={{ color: 'var(--color-neutral-700)' }}>{subtitle}</div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-2xl font-black">{stats.perfis}</div>
            <div className="text-[11px] uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-neutral-600)' }}>perfis</div>
          </div>
          <div>
            <div className="text-2xl font-black">{stats.favoritas}</div>
            <div className="text-[11px] uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-neutral-600)' }}>favoritas</div>
          </div>
          <div>
            <div className="text-2xl font-black">{stats.usuarios}</div>
            <div className="text-[11px] uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-neutral-600)' }}>usuários</div>
          </div>
        </div>
      </div>
      <div className="flex mt-6">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="text-[13px] font-bold py-3 px-5 cursor-pointer"
              style={{ letterSpacing: '0.02em', background: active ? 'var(--color-text)' : 'transparent', color: active ? 'var(--color-bg)' : 'var(--color-text)' }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

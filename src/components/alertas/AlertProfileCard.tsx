import type { AlertProfile } from '@/lib/alertProfiles';

export function AlertProfileCard({ profile }: { profile: AlertProfile }) {
  return (
    <div className="py-[22px]" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <div className="flex justify-between items-start gap-6">
        <div className="min-w-0">
          <div className="text-lg font-extrabold">{profile.name}</div>
          <div className="text-[13px] mt-1.5" style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--color-neutral-700)' }}>
            {profile.query}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {profile.channels.map((c) => (
              <span key={c} className="text-xs font-bold py-1 px-2" style={{ border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-700)' }}>
                {c}
              </span>
            ))}
            <span className="text-xs font-bold py-1 px-2" style={{ background: 'var(--color-accent-200)', color: 'var(--color-accent-800)' }}>
              {profile.newCount} novas
            </span>
          </div>
        </div>
        <button
          className="text-xs font-bold py-2 px-3.5 whitespace-nowrap cursor-pointer"
          style={profile.active
            ? { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: 'var(--color-bg)' }
            : { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
        >
          {profile.active ? 'Ativo' : 'Pausado'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { REGIONS } from '@/lib/regions';

/**
 * Seletor de UFs agrupado por região. O nome da região marca/desmarca todas
 * as UFs dela de uma vez.
 */
export function UfPicker({
  value,
  onChange,
  compact = false,
}: {
  value: string[];
  onChange: (ufs: string[]) => void;
  compact?: boolean;
}) {
  const toggle = (uf: string) => onChange(value.includes(uf) ? value.filter((u) => u !== uf) : [...value, uf]);
  const toggleRegion = (ufs: string[]) => {
    const all = ufs.every((u) => value.includes(u));
    onChange(all ? value.filter((u) => !ufs.includes(u)) : Array.from(new Set([...value, ...ufs])));
  };

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-4'}>
      {REGIONS.map((r) => {
        const all = r.ufs.every((u) => value.includes(u));
        return (
          <div key={r.name}>
            <button
              type="button"
              onClick={() => toggleRegion(r.ufs)}
              className="text-[12px] font-bold uppercase mb-1.5 cursor-pointer underline-offset-2 hover:underline"
              style={{ letterSpacing: '0.08em', color: 'var(--color-neutral-700)', background: 'none', border: 'none', padding: 0 }}
              aria-pressed={all}
            >
              {r.name} {all ? '· todas' : ''}
            </button>
            <div className="flex flex-wrap gap-1.5">
              {r.ufs.map((uf) => {
                const active = value.includes(uf);
                return (
                  <button
                    key={uf}
                    type="button"
                    onClick={() => toggle(uf)}
                    aria-pressed={active}
                    className={`${compact ? 'min-w-9 h-8 px-2 text-[12px]' : 'min-w-11 h-9 px-3 text-[13px]'} font-bold cursor-pointer`}
                    style={{
                      background: active ? 'var(--color-text)' : 'transparent',
                      color: active ? 'var(--color-bg)' : 'var(--color-text)',
                      border: `2px solid ${active ? 'var(--color-text)' : 'var(--color-neutral-400)'}`,
                    }}
                  >
                    {uf}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

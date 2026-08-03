'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface SavedProfile {
  label: string;
  active?: boolean;
}

const savedProfiles: SavedProfile[] = [
  { label: 'Obras civis SP/MG', active: true },
  { label: 'Manutenção predial' },
  { label: 'Reformas escolares' },
];

export function SearchHeader({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div className="py-6 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="flex" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}>
        <div className="flex items-center px-3.5" style={{ color: 'var(--color-neutral-600)' }}>
          <Search size={18} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-0 bg-transparent py-4 text-base outline-none"
        />
        <button
          className="text-sm font-bold text-white px-6 cursor-pointer"
          style={{ borderLeft: '2px solid var(--color-text)', background: 'var(--color-text)' }}
        >
          Buscar
        </button>
      </div>
      <div className="flex items-center gap-2.5 mt-3.5 flex-wrap">
        <span className="text-xs font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-neutral-600)' }}>
          Perfis salvos
        </span>
        {savedProfiles.map((p) => (
          <span
            key={p.label}
            className="text-[13px] font-bold py-1.5 px-2.5"
            style={p.active
              ? { border: '2px solid var(--color-accent)', color: 'var(--color-accent-700)' }
              : { border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-700)', fontWeight: 600 }}
          >
            {p.label}
          </span>
        ))}
        <span
          className="text-[13px] font-semibold py-1.5 px-2.5"
          style={{ border: '1px dashed var(--color-neutral-500)', color: 'var(--color-neutral-600)' }}
        >
          + salvar busca atual
        </span>
      </div>
    </div>
  );
}

'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export function SearchHeader({ onSearch, loading }: { onSearch: (q: string) => void; loading: boolean }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) onSearch(query.trim());
  };

  return (
    <div className="py-6 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <form onSubmit={handleSubmit} className="flex" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}>
        <div className="flex items-center px-3.5" style={{ color: 'var(--color-neutral-600)' }}>
          <Search size={18} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-0 bg-transparent py-4 text-base outline-none"
          placeholder="Buscar por palavra-chave, órgão, modalidade..."
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="text-sm font-bold text-white px-6 cursor-pointer disabled:opacity-50"
          style={{ borderLeft: '2px solid var(--color-text)', background: 'var(--color-text)' }}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
    </div>
  );
}

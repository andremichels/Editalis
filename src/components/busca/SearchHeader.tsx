'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export function SearchHeader({
  onSearch,
  loading,
  booleanMode,
  onToggleMode,
  semanticMode,
  onToggleSemantic,
}: {
  onSearch: (q: string) => void;
  loading: boolean;
  booleanMode: boolean;
  onToggleMode: (v: boolean) => void;
  semanticMode: boolean;
  onToggleSemantic: (v: boolean) => void;
}
) {
  const [query, setQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);

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
          placeholder={booleanMode
            ? 'pregão OR concorrência "são paulo" -dispensa'
            : 'Buscar por palavra-chave, órgão, modalidade...'}
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

      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {/* Boolean toggle */}
        <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--color-neutral-600)' }}>
          <input
            type="checkbox"
            checked={booleanMode}
            onChange={(e) => onToggleMode(e.target.checked)}
            className="cursor-pointer"
          />
          Operadores booleanos
        </label>

        {/* Help toggle */}
        <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: semanticMode ? "var(--color-accent)" : "var(--color-neutral-600)" }}>
          <input type="checkbox" checked={semanticMode} onChange={(e) => onToggleSemantic(e.target.checked)} className="cursor-pointer" />
          ✨ Busca semântica
        </label>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs underline cursor-pointer"
          style={{ color: 'var(--color-neutral-500)' }}
        >
          {showHelp ? 'Ocultar ajuda' : 'Como usar?'}
        </button>
      </div>

      {showHelp && (
        <div className="mt-2 p-3 text-xs leading-relaxed" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', fontFamily: 'ui-monospace, monospace' }}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div><b style={{ color: 'var(--color-accent)' }}>termo1 termo2</b> → ambos obrigatórios (AND)</div>
            <div><b style={{ color: 'var(--color-accent)' }}>termo1 OR termo2</b> → qualquer um (OR)</div>
            <div><b style={{ color: 'var(--color-accent)' }}>-termo</b> → exclui artigos com este termo (NOT)</div>
            <div><b style={{ color: 'var(--color-accent)' }}>"frase exata"</b> → busca pela frase inteira</div>
          </div>
          <div className="mt-1.5" style={{ color: 'var(--color-neutral-500)' }}>
            Ex: <b>pregão OR concorrência "são paulo" -dispensa</b>
          </div>
        </div>
      )}
    </div>
  );
}

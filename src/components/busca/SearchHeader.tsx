'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export type SearchMode = 'palavras' | 'semantica' | 'ia';

const MODES: { id: SearchMode; label: string; hint: string; placeholder: string }[] = [
  {
    id: 'palavras',
    label: 'Palavras-chave',
    hint: 'Encontra os termos exatos. Aceita OR, -excluir e "frase exata".',
    placeholder: 'Ex.: merenda escolar',
  },
  {
    id: 'semantica',
    label: 'Por assunto',
    hint: 'Encontra publicações sobre o mesmo assunto, mesmo com outras palavras.',
    placeholder: 'Ex.: compra de alimentos para escolas',
  },
  {
    id: 'ia',
    label: 'Pergunta livre',
    hint: 'Escreva como falaria: a IA transforma em termos e filtros.',
    placeholder: 'Ex.: pregões de software em SP acima de 100 mil',
  },
];

export function SearchHeader({
  onSearch,
  loading,
  mode,
  onModeChange,
  onSmartSearch,
  sectorOnly,
  onSectorOnly,
  initialQuery = '',
}: {
  onSearch: (q: string) => void;
  loading: boolean;
  mode: SearchMode;
  onModeChange: (m: SearchMode) => void;
  onSmartSearch: (q: string) => void;
  sectorOnly: boolean;
  onSectorOnly: (v: boolean) => void;
  /** texto restaurado da última busca (ao voltar de uma publicação) */
  initialQuery?: string;
}
) {
  const [query, setQuery] = useState(initialQuery);
  const [syncedInitial, setSyncedInitial] = useState(initialQuery);
  if (initialQuery !== syncedInitial) {
    // ajuste de estado durante o render (padrão do React para props que mudam)
    setSyncedInitial(initialQuery);
    setQuery(initialQuery);
  }
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      if (mode === 'ia') onSmartSearch(query.trim());
      else onSearch(query.trim());
    }
  };

  return (
    <div className="py-6 px-6 sm:px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <form onSubmit={handleSubmit} className="flex" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}>
        <div className="flex items-center px-3.5" style={{ color: 'var(--color-neutral-700)' }}>
          <Search size={18} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-0 bg-transparent py-4 text-base outline-none"
          placeholder={current.placeholder}
          aria-label="Buscar no Diário Oficial"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="text-sm font-bold text-white px-6 cursor-pointer disabled:opacity-50"
          style={{ borderLeft: '2px solid var(--color-text)', background: 'var(--color-text)' }}
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      <div className="flex items-center gap-x-5 gap-y-2 mt-3 flex-wrap">
        <div role="radiogroup" aria-label="Modo de busca" className="flex" style={{ border: '2px solid var(--color-text)' }}>
          {MODES.map((m, i) => {
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onModeChange(m.id)}
                className="text-[13px] font-bold py-1.5 px-3 cursor-pointer"
                style={{
                  background: active ? 'var(--color-text)' : 'transparent',
                  color: active ? 'var(--color-bg)' : 'var(--color-text)',
                  borderLeft: i > 0 ? '2px solid var(--color-text)' : 'none',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-[13px] cursor-pointer py-1" style={{ color: 'var(--color-text)', fontWeight: sectorOnly ? 800 : 400 }}>
          <input type="checkbox" checked={sectorOnly} onChange={(e) => onSectorOnly(e.target.checked)} className="cursor-pointer w-4 h-4" style={{ accentColor: 'var(--color-text)' }} />
          Somente meu setor
        </label>
      </div>

      <div className="text-[13px] mt-2" style={{ color: 'var(--color-neutral-700)' }}>
        {current.hint}{' '}
        {mode === 'palavras' && (
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="underline cursor-pointer"
            style={{ color: 'var(--color-text)' }}
          >
            {showHelp ? 'Ocultar exemplos' : 'Ver exemplos'}
          </button>
        )}
      </div>

      {showHelp && mode === 'palavras' && (
        <div className="mt-2 p-3 text-[13px] leading-relaxed max-w-2xl" style={{ background: 'var(--color-neutral-100)', border: '1px solid var(--color-divider)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <div><b style={{ color: 'var(--color-text)' }}>termo1 termo2</b> → precisa ter os dois</div>
            <div><b style={{ color: 'var(--color-text)' }}>termo1 OR termo2</b> → qualquer um dos dois</div>
            <div><b style={{ color: 'var(--color-text)' }}>-termo</b> → exclui quem tiver este termo</div>
            <div><b style={{ color: 'var(--color-text)' }}>&quot;frase exata&quot;</b> → a frase inteira, nessa ordem</div>
          </div>
          <div className="mt-1.5" style={{ color: 'var(--color-neutral-700)' }}>
            Ex.: <b>pregão OR concorrência &quot;são paulo&quot; -dispensa</b>
          </div>
        </div>
      )}
    </div>
  );
}

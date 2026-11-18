'use client';

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
  initialQuery = '',
}: {
  onSearch: (q: string) => void;
  loading: boolean;
  mode: SearchMode;
  onModeChange: (m: SearchMode) => void;
  onSmartSearch: (q: string) => void;
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
    <header className="flex flex-col gap-3.5 pt-7 pb-5 px-4 sm:px-12" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="flex gap-3 flex-wrap">
        <div role="radiogroup" aria-label="Modo de busca" className="flex h-[52px] box-border" style={{ border: '2px solid var(--color-text)' }}>
          {MODES.map((m, i) => {
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onModeChange(m.id)}
                title={m.hint}
                className={`text-[13px] px-3.5 cursor-pointer ${active ? 'font-bold' : 'font-semibold'}`}
                style={{
                  background: active ? 'var(--color-text)' : 'var(--color-field)',
                  color: active ? '#fff' : 'var(--color-text)',
                  borderLeft: i > 0 ? '2px solid var(--color-text)' : 'none',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} role="search" className="flex flex-[1_1_420px] min-w-0">
          <label htmlFor="busca-q" className="sr-only-text">Buscar no Diário Oficial</label>
          <input
            id="busca-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-0 h-[52px] box-border px-4 text-[16px] font-medium"
            style={{ border: '2px solid var(--color-text)', borderRight: 0, background: 'var(--color-field)', color: 'var(--color-text)' }}
            placeholder={current.placeholder}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="h-[52px] px-[26px] text-[15px] font-bold cursor-pointer disabled:opacity-60"
            style={{ border: '2px solid var(--color-text)', background: 'var(--color-text)', color: '#fff' }}
          >
            {loading ? 'Buscando…' : 'Buscar'}
          </button>
        </form>
      </div>

      <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>
        {mode === 'palavras' ? (
          <>
            Dica: use aspas para frase exata e <strong style={{ color: 'var(--color-text)' }}>-</strong> para excluir —{' '}
            <span className="font-mono" style={{ color: 'var(--color-text)' }}>&quot;fábrica de software&quot; -manutenção</span> ·{' '}
            <button type="button" onClick={() => setShowHelp(!showHelp)} className="underline font-semibold cursor-pointer" style={{ color: 'var(--color-text)' }}>
              {showHelp ? 'Ocultar operadores' : 'Ver todos os operadores'}
            </button>
          </>
        ) : (
          current.hint
        )}
      </p>

      {showHelp && mode === 'palavras' && (
        <div className="p-3 text-[13px] leading-relaxed max-w-2xl" style={{ background: 'var(--color-field)', border: '1px solid var(--color-line)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <div><b>termo1 termo2</b> → precisa ter os dois</div>
            <div><b>termo1 OR termo2</b> → qualquer um dos dois</div>
            <div><b>-termo</b> → exclui quem tiver este termo</div>
            <div><b>&quot;frase exata&quot;</b> → a frase inteira, nessa ordem</div>
          </div>
        </div>
      )}
    </header>
  );
}

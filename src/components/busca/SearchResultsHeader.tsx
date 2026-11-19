import type { ReactNode } from 'react';

interface SearchResultsHeaderProps {
  total: string;
  query: string;
  elapsed: string;
  sortBy: 'relevance' | 'date';
  onSortChange: (s: 'relevance' | 'date') => void;
  onExportCsv: () => void;
  onSaveAlert: () => void;
  /** chips dos filtros ativos (removíveis) */
  chips?: ReactNode;
}

export function SearchResultsHeader({ total, query, elapsed, sortBy, onSortChange, onExportCsv, onSaveAlert, chips }: SearchResultsHeaderProps) {
  return (
    <div style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="flex items-center justify-between gap-4 flex-wrap pt-5 pb-3.5">
        <p className="text-[15px]">
          <strong>{total}</strong> resultados{query && <> para <strong>“{query}”</strong></>}
          {elapsed && <span style={{ color: 'var(--color-muted)' }}> · {elapsed}</span>}
        </p>
        <div className="flex items-center gap-2.5 flex-wrap">
          <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-muted)' }}>
            Ordenar
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'relevance' | 'date')}
              className="h-11 px-3 text-[14px] font-semibold cursor-pointer"
              style={{ border: '1px solid var(--color-text)', background: 'var(--color-field)', color: 'var(--color-text)' }}
            >
              <option value="relevance">Relevância</option>
              <option value="date">Mais recentes</option>
            </select>
          </label>
          <button
            onClick={onSaveAlert}
            className="h-11 px-4 text-[14px] font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: 0, color: '#fff' }}
            title="Receba as novas publicações desta busca"
          >
            Salvar como alerta
          </button>
          <button
            onClick={onExportCsv}
            className="h-11 px-3.5 text-[14px] font-bold cursor-pointer"
            style={{ background: 'var(--color-field)', border: '1px solid var(--color-text)', color: 'var(--color-text)' }}
          >
            Exportar CSV
          </button>
        </div>
      </div>
      {chips && <div className="flex gap-2 flex-wrap pb-4">{chips}</div>}
    </div>
  );
}

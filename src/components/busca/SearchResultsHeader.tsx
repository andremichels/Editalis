interface SearchResultsHeaderProps {
  total: string;
  elapsed: string;
}

export function SearchResultsHeader({ total, elapsed }: SearchResultsHeaderProps) {
  return (
    <div className="py-[18px] px-10 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <div className="text-sm">
        <strong className="font-black">{total}</strong> resultados ·{' '}
        <span style={{ color: 'var(--color-neutral-600)' }}>{elapsed}</span>
      </div>
      <div className="flex items-center gap-3">
        <select className="py-2 px-2.5 text-[13px]" style={{ border: '1px solid var(--color-neutral-400)', background: 'var(--color-neutral-100)' }}>
          <option>Mais recentes</option>
          <option>Maior valor</option>
          <option>Abertura mais próxima</option>
        </select>
        <button
          className="text-[13px] font-bold py-2 px-3.5 cursor-pointer"
          style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
        >
          Exportar CSV
        </button>
      </div>
    </div>
  );
}

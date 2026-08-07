export function Pagination({ pages, current, onPage }: { pages: number; current: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;

  // Show: first, current-1, current, current+1, last — with ellipsis
  const visible = new Set<number>();
  visible.add(1);
  visible.add(pages);
  for (let i = Math.max(2, current - 1); i <= Math.min(pages - 1, current + 1); i++) {
    visible.add(i);
  }
  const sorted = [...visible].sort((a, b) => a - b);

  // Build array with nulls for ellipsis
  const items: (number | null)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    items.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      items.push(null);
    }
  }

  return (
    <div className="py-6 px-10 flex gap-2 items-center">
      {current > 1 && (
        <button
          onClick={() => onPage(current - 1)}
          className="text-[13px] font-bold py-2 px-3.5 cursor-pointer"
          style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
        >
          ← Anterior
        </button>
      )}
      {items.map((page, i) =>
        page === null ? (
          <span key={`e${i}`} className="text-[13px] mx-1" style={{ color: 'var(--color-neutral-600)' }}>…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPage(page)}
            className="text-[13px] font-bold py-2 px-3.5 cursor-pointer"
            style={page === current
              ? { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: '#fff' }
              : { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
          >
            {page}
          </button>
        )
      )}
      {current < pages && (
        <button
          onClick={() => onPage(current + 1)}
          className="text-[13px] font-bold py-2 px-3.5 cursor-pointer"
          style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
        >
          Próxima →
        </button>
      )}
    </div>
  );
}

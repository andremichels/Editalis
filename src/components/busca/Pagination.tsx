export function Pagination({ pages, current }: { pages: number; current: number }) {
  return (
    <div className="py-6 px-10 flex gap-2 items-center">
      {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className="text-[13px] font-bold py-2 px-3.5 cursor-pointer"
          style={page === current
            ? { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: '#fff' }
            : { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
        >
          {page}
        </button>
      ))}
      <span className="text-[13px] mx-2" style={{ color: 'var(--color-neutral-600)' }}>…</span>
      <button
        className="text-[13px] font-bold py-2 px-3.5 cursor-pointer"
        style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
      >
        Próxima →
      </button>
    </div>
  );
}

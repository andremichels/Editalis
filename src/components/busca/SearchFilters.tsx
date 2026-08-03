const inputStyle = { border: '1px solid var(--color-neutral-400)', background: 'var(--color-neutral-100)' };
const selectStyle = { border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' };

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4" style={{ borderTop: '1px solid var(--color-divider)' }}>
      <div className="text-[13px] font-extrabold mb-2.5">{title}</div>
      {children}
    </div>
  );
}

const modalidades = ['Pregão eletrônico', 'Concorrência', 'Dispensa', 'Inexigibilidade'];
const situacoes = ['Aberta', 'Suspensa', 'Homologada'];

export function SearchFilters() {
  return (
    <div className="py-6 px-5" style={{ borderRight: '2px solid var(--color-text)' }}>
      <div className="flex justify-between items-baseline mb-5">
        <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.14em' }}>Filtros</span>
        <a href="#limpar" className="text-xs" style={{ color: 'var(--color-neutral-700)' }}>limpar</a>
      </div>

      <FilterGroup title="UF / município">
        <select className="w-full p-2.5 text-[13px]" style={selectStyle}>
          <option>SP, MG (2 selecionados)</option>
        </select>
        <input placeholder="Município" className="w-full mt-2 p-2.5 text-[13px]" style={inputStyle} />
      </FilterGroup>

      <FilterGroup title="Modalidade">
        {modalidades.map((m) => (
          <label key={m} className="flex items-center gap-2 text-[13px] py-1 cursor-pointer">
            <input type="checkbox" style={{ accentColor: 'var(--color-accent)' }} />
            {m}
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Órgão comprador">
        <input placeholder="Prefeitura, autarquia…" className="w-full p-2.5 text-[13px]" style={inputStyle} />
      </FilterGroup>

      <FilterGroup title="Valor estimado">
        <div className="flex gap-2">
          <input placeholder="mín." className="w-full p-2.5 text-[13px]" style={inputStyle} />
          <input placeholder="máx." className="w-full p-2.5 text-[13px]" style={inputStyle} />
        </div>
      </FilterGroup>

      <FilterGroup title="Data de abertura">
        <select className="w-full p-2.5 text-[13px]" style={selectStyle}>
          <option>Próximos 30 dias</option>
        </select>
      </FilterGroup>

      <FilterGroup title="CNAE / objeto">
        <input placeholder="41.20-4 · Construção" className="w-full p-2.5 text-[13px]" style={inputStyle} />
      </FilterGroup>

      <div className="py-4" style={{ borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="text-[13px] font-extrabold mb-2.5">Situação</div>
        {situacoes.map((s) => (
          <label key={s} className="flex items-center gap-2 text-[13px] py-1 cursor-pointer">
            <input type="checkbox" style={{ accentColor: 'var(--color-accent)' }} />
            {s}
          </label>
        ))}
      </div>
    </div>
  );
}

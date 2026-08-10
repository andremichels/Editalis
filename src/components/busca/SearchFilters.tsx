'use client';

import { useState } from 'react';

interface SearchFiltersProps {
  organs: string[];
  setOrgans: (v: string[]) => void;
  modalities: string[];
  setModalities: (v: string[]) => void;
  ufs: string[];
  setUfs: (v: string[]) => void;
  valueMin: string;
  setValueMin: (v: string) => void;
  valueMax: string;
  setValueMax: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}

const inputStyle = { border: '1px solid var(--color-neutral-400)', background: 'var(--color-neutral-100)' };

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4" style={{ borderTop: '1px solid var(--color-divider)' }}>
      <div className="text-[13px] font-extrabold mb-2.5">{title}</div>
      {children}
    </div>
  );
}

const ALL_MODALIDADES = ['pregao', 'pregao_eletronico', 'concorrencia', 'dispensa', 'inexigibilidade', 'tomada_precos', 'concurso', 'leilao', 'rdc'];
const ALL_UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

function CheckboxGroup({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="max-h-[180px] overflow-y-auto">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <label key={opt} className="flex items-center gap-2 text-[13px] py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              style={{ accentColor: 'var(--color-accent)' }}
              onChange={() => {
                onChange(checked ? selected.filter((s) => s !== opt) : [...selected, opt]);
              }}
            />
            {opt.replace(/_/g, ' ')}
          </label>
        );
      })}
    </div>
  );
}

export function SearchFilters({
  organs, setOrgans,
  modalities, setModalities,
  ufs, setUfs,
  valueMin, setValueMin,
  valueMax, setValueMax,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  onApply, onClear,
}: SearchFiltersProps) {

  const [orgInput, setOrgInput] = useState('');

  const addOrgan = () => {
    const v = orgInput.trim();
    if (v && !organs.includes(v)) {
      setOrgans([...organs, v]);
      setOrgInput('');
    }
  };

  return (
    <div className="py-6 px-5" style={{ borderRight: '2px solid var(--color-text)' }}>
      <div className="flex justify-between items-baseline mb-5">
        <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.14em' }}>Filtros</span>
        <button onClick={onClear} className="text-xs border-0 bg-transparent cursor-pointer" style={{ color: 'var(--color-neutral-700)' }}>limpar</button>
      </div>

      <FilterGroup title="UF">
        <CheckboxGroup options={ALL_UFS} selected={ufs} onChange={setUfs} />
      </FilterGroup>

      <FilterGroup title="Modalidade">
        <CheckboxGroup options={ALL_MODALIDADES} selected={modalities} onChange={setModalities} />
      </FilterGroup>

      <FilterGroup title="Órgão">
        <div className="flex gap-1 mb-2">
          <input
            value={orgInput}
            onChange={(e) => setOrgInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addOrgan()}
            placeholder="Prefeitura, ministério..."
            className="flex-1 p-2 text-[13px]"
            style={inputStyle}
          />
          <button onClick={addOrgan} className="text-[13px] px-3 border-0 cursor-pointer font-bold" style={{ background: 'var(--color-text)', color: '#fff' }}>+</button>
        </div>
        {organs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {organs.map((o) => (
              <span key={o} className="text-[11px] px-1.5 py-0.5 flex items-center gap-1" style={{ background: 'var(--color-neutral-200)' }}>
                {o}
                <button onClick={() => setOrgans(organs.filter((x) => x !== o))} className="text-[11px] border-0 bg-transparent cursor-pointer" style={{ color: 'var(--color-neutral-700)' }}>×</button>
              </span>
            ))}
          </div>
        )}
      </FilterGroup>

      <FilterGroup title="Valor estimado (R$)">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="mín."
            value={valueMin}
            onChange={(e) => setValueMin(e.target.value)}
            className="w-full p-2 text-[13px]"
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="máx."
            value={valueMax}
            onChange={(e) => setValueMax(e.target.value)}
            className="w-full p-2 text-[13px]"
            style={inputStyle}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Período">
        <div className="flex gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="w-full p-2 text-[13px]" style={inputStyle} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="w-full p-2 text-[13px]" style={inputStyle} />
        </div>
      </FilterGroup>

      <div className="pt-4" style={{ borderTop: '1px solid var(--color-divider)' }}>
        <button
          onClick={onApply}
          className="w-full py-2.5 text-sm font-bold cursor-pointer"
          style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
        >
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}

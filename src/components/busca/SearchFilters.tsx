'use client';

import { useState } from 'react';
import type { Vertical } from '@/lib/types';
import { modalityLabel } from '@/lib/format';
import { UfPicker } from '@/components/ui/UfPicker';

interface SearchFiltersProps {
  organs: string[];
  setOrgans: (v: string[]) => void;
  modalities: string[];
  setModalities: (v: string[]) => void;
  ufs: string[];
  setUfs: (v: string[]) => void;
  verticals: string[];
  setVerticals: (v: string[]) => void;
  /** null = carregando */
  availableVerticals: Vertical[] | null;
  valueMin: string;
  setValueMin: (v: string) => void;
  valueMax: string;
  setValueMax: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  /** só no celular: fecha a gaveta de filtros */
  onDone?: () => void;
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

function CheckboxGroup({ options, selected, onChange, labelFor }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; labelFor?: (v: string) => string }) {
  return (
    <div className="max-h-[180px] overflow-y-auto">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <label key={opt} className="flex items-center gap-2 text-[13px] py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              style={{ accentColor: 'var(--color-text)' }}
              onChange={() => {
                onChange(checked ? selected.filter((s) => s !== opt) : [...selected, opt]);
              }}
            />
            {labelFor ? labelFor(opt) : opt}
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
  verticals, setVerticals,
  availableVerticals,
  valueMin, setValueMin,
  valueMax, setValueMax,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  onDone, onClear,
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
    <div className="py-6 px-5">
      <div className="flex justify-between items-baseline mb-5">
        <span className="text-[12px] font-bold uppercase" style={{ letterSpacing: '0.14em' }}>Filtros</span>
        <button onClick={onClear} className="text-[13px] underline border-0 bg-transparent cursor-pointer py-1" style={{ color: 'var(--color-text)' }}>limpar tudo</button>
      </div>

      <FilterGroup title="Setores">
        {availableVerticals === null ? (
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-7 w-20 skeleton" />)}
          </div>
        ) : availableVerticals.length === 0 ? (
          <div className="text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>Não foi possível carregar os setores.</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {availableVerticals.map((v) => {
              const active = verticals.includes(v.slug);
              return (
                <button
                  key={v.slug}
                  type="button"
                  onClick={() => setVerticals(active ? verticals.filter((s) => s !== v.slug) : [...verticals, v.slug])}
                  className="text-[12px] px-2.5 py-1.5 font-bold cursor-pointer transition-all"
                  style={{
                    background: active ? 'var(--color-text)' : 'transparent',
                    color: active ? '#fff' : 'var(--color-text)',
                    border: `2px solid ${active ? 'var(--color-text)' : 'var(--color-neutral-400)'}`,
                  }}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        )}
      </FilterGroup>

      <FilterGroup title="UF">
        <UfPicker value={ufs} onChange={setUfs} compact />
      </FilterGroup>

      <FilterGroup title="Modalidade">
        <CheckboxGroup options={ALL_MODALIDADES} selected={modalities} onChange={setModalities} labelFor={modalityLabel} />
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
              <span key={o} className="text-[12px] pl-2 flex items-center gap-1" style={{ background: 'var(--color-neutral-200)' }}>
                {o}
                <button onClick={() => setOrgans(organs.filter((x) => x !== o))} className="w-7 h-7 text-[15px] border-0 bg-transparent cursor-pointer" style={{ color: 'var(--color-text)' }} aria-label={`Remover ${o}`}>×</button>
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

      <p className="text-[12px] pt-3" style={{ color: 'var(--color-neutral-700)' }}>
        Os resultados atualizam sozinhos ao mudar um filtro.
      </p>
      {onDone && (
        <button
          onClick={onDone}
          className="w-full mt-3 py-3 text-sm font-bold cursor-pointer text-left px-4"
          style={{ background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none' }}
        >
          Ver resultados
        </button>
      )}
    </div>
  );
}

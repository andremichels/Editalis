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
  /** Escopo: só os setores/UFs do perfil × todo o Diário */
  sectorOnly: boolean;
  onSectorOnly: (v: boolean) => void;
  /** "Comunicação, Tecnologia · DF, SP" — resumo do perfil, quando há */
  scopeSummary?: string;
  /** só no celular: fecha a gaveta de filtros */
  onDone?: () => void;
  onClear: () => void;
  /** Contagens da busca atual por UF/modalidade (só na busca por palavra-chave) */
  facets?: { ufs: Record<string, number>; modalities: Record<string, number> } | null;
}

const inputStyle = { border: '1px solid var(--color-text)', background: 'var(--color-field)', color: 'var(--color-text)' };
const boxStyle = { width: 18, height: 18, accentColor: 'var(--color-text)' } as const;

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 p-0 border-0 flex flex-col gap-2.5 min-w-0">
      <legend className="p-0 pb-2.5 text-[14px] font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

/** "AAAA-MM-DD" de N dias atrás */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const PERIODS = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '12 meses', days: 365 },
];

const ALL_MODALIDADES = ['pregao', 'pregao_eletronico', 'concorrencia', 'dispensa', 'inexigibilidade', 'tomada_precos', 'concurso', 'leilao', 'rdc'];

function CheckboxGroup({ options, selected, onChange, labelFor, counts }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; labelFor?: (v: string) => string; counts?: Record<string, number> | null }) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <label key={opt} className="flex items-center gap-2.5 text-[14px] cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              style={boxStyle}
              onChange={() => {
                onChange(checked ? selected.filter((s) => s !== opt) : [...selected, opt]);
              }}
            />
            <span className="flex-1">{labelFor ? labelFor(opt) : opt}</span>
            {counts && (
              <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-muted)' }}>{(counts[opt] ?? 0).toLocaleString('pt-BR')}</span>
            )}
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
  sectorOnly, onSectorOnly, scopeSummary,
  onDone, onClear, facets,
}: SearchFiltersProps) {

  const [orgInput, setOrgInput] = useState('');
  const [customPeriod, setCustomPeriod] = useState(false);
  const activePeriod = !dateTo ? PERIODS.find((p) => dateFrom === daysAgo(p.days)) : undefined;
  const showDates = customPeriod || (!!(dateFrom || dateTo) && !activePeriod);

  const addOrgan = () => {
    const v = orgInput.trim();
    if (v && !organs.includes(v)) {
      setOrgans([...organs, v]);
      setOrgInput('');
    }
  };

  return (
    <div className="pt-6 pb-12 px-5 lg:pl-12 lg:pr-6 flex flex-col gap-7">
      <div className="flex justify-between items-baseline">
        <h2 className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.14em' }}>Filtros</h2>
        <button onClick={onClear} className="h-8 text-[13px] font-semibold underline border-0 bg-transparent cursor-pointer" style={{ color: 'var(--color-text)' }}>Limpar</button>
      </div>

      <FilterGroup title="Escopo">
        <label className="flex items-center gap-2.5 text-[14px] cursor-pointer">
          <input type="radio" name="escopo" checked={sectorOnly} onChange={() => onSectorOnly(true)} style={boxStyle} /> Meus setores e UFs
        </label>
        <label className="flex items-center gap-2.5 text-[14px] cursor-pointer">
          <input type="radio" name="escopo" checked={!sectorOnly} onChange={() => onSectorOnly(false)} style={boxStyle} /> Todo o Diário Oficial
        </label>
        <p className="text-[12px] leading-[1.45]" style={{ color: 'var(--color-muted)' }}>
          {scopeSummary ? `${scopeSummary} · ` : ''}
          <a href="/setores" className="underline" style={{ color: 'var(--color-muted)' }}>editar</a>
        </p>
      </FilterGroup>

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
                  aria-pressed={active}
                  className={`h-8 text-[13px] px-2.5 cursor-pointer ${active ? 'font-bold' : 'font-semibold'}`}
                  style={{
                    background: active ? 'var(--color-text)' : 'transparent',
                    color: active ? '#fff' : 'var(--color-text)',
                    border: `1px solid ${active ? 'var(--color-text)' : 'var(--color-neutral-400)'}`,
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
        <UfPicker value={ufs} onChange={setUfs} compact counts={facets?.ufs} />
      </FilterGroup>

      <FilterGroup title="Modalidade">
        <CheckboxGroup options={ALL_MODALIDADES} selected={modalities} onChange={setModalities} labelFor={modalityLabel} counts={facets?.modalities} />
      </FilterGroup>

      <FilterGroup title="Órgão">
        {organs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {organs.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOrgans(organs.filter((x) => x !== o))}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 text-[13px] font-bold cursor-pointer text-left"
                style={{ background: 'var(--color-text)', color: '#fff', border: 0 }}
                aria-label={`Remover ${o}`}
              >
                {o} <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex">
          <label htmlFor="filtro-orgao" className="sr-only-text">Adicionar órgão</label>
          <input
            id="filtro-orgao"
            value={orgInput}
            onChange={(e) => setOrgInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOrgan(); } }}
            placeholder="Prefeitura, ministério…"
            className="flex-1 min-w-0 h-11 px-3 text-[14px]"
            style={inputStyle}
          />
          <button onClick={addOrgan} className="h-11 px-3.5 text-[14px] cursor-pointer font-bold" style={{ background: 'var(--color-text)', color: '#fff', border: '1px solid var(--color-text)' }} aria-label="Adicionar órgão">+</button>
        </div>
      </FilterGroup>

      <FilterGroup title="Valor estimado">
        <div className="flex gap-2">
          <label className="flex-1 flex flex-col gap-1 text-[12px]" style={{ color: 'var(--color-muted)' }}>
            Mínimo
            <input type="number" inputMode="numeric" placeholder="R$ 0" value={valueMin} onChange={(e) => setValueMin(e.target.value)} className="h-11 min-w-0 px-2.5 text-[14px]" style={inputStyle} />
          </label>
          <label className="flex-1 flex flex-col gap-1 text-[12px]" style={{ color: 'var(--color-muted)' }}>
            Máximo
            <input type="number" inputMode="numeric" placeholder="sem limite" value={valueMax} onChange={(e) => setValueMax(e.target.value)} className="h-11 min-w-0 px-2.5 text-[14px]" style={inputStyle} />
          </label>
        </div>
      </FilterGroup>

      <FilterGroup title="Publicado">
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => {
            const active = activePeriod?.days === p.days && !customPeriod;
            return (
              <button
                key={p.days}
                type="button"
                aria-pressed={active}
                onClick={() => { setCustomPeriod(false); setDateTo(''); setDateFrom(active ? '' : daysAgo(p.days)); }}
                className={`h-8 px-2.5 text-[13px] cursor-pointer ${active ? 'font-bold' : 'font-semibold'}`}
                style={{ border: '1px solid var(--color-text)', background: active ? 'var(--color-text)' : 'transparent', color: active ? '#fff' : 'var(--color-text)' }}
              >
                {p.label}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={showDates}
            onClick={() => setCustomPeriod(!showDates)}
            className={`h-8 px-2.5 text-[13px] cursor-pointer ${showDates ? 'font-bold' : 'font-semibold'}`}
            style={{ border: '1px solid var(--color-text)', background: showDates ? 'var(--color-text)' : 'transparent', color: showDates ? '#fff' : 'var(--color-text)' }}
          >
            Período…
          </button>
        </div>
        {showDates && (
          <div className="flex gap-2">
            <label className="flex-1 flex flex-col gap-1 text-[12px]" style={{ color: 'var(--color-muted)' }}>
              De
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11 min-w-0 px-2 text-[13px]" style={inputStyle} />
            </label>
            <label className="flex-1 flex flex-col gap-1 text-[12px]" style={{ color: 'var(--color-muted)' }}>
              Até
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11 min-w-0 px-2 text-[13px]" style={inputStyle} />
            </label>
          </div>
        )}
      </FilterGroup>

      <p className="text-[12px]" style={{ color: 'var(--color-muted)' }}>
        Os filtros se aplicam na hora.
      </p>
      {onDone && (
        <button
          onClick={onDone}
          className="w-full h-12 text-sm font-bold cursor-pointer text-left px-4"
          style={{ background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none' }}
        >
          Ver resultados
        </button>
      )}
    </div>
  );
}

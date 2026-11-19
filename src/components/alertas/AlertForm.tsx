'use client';

import { useState } from 'react';
import { UfPicker } from '@/components/ui/UfPicker';
import { modalityLabel } from '@/lib/format';

export interface AlertFormState {
  name: string;
  keywords: string;
  organs: string;
  ufs: string;
  modalities: string;
  value_min: string;
  value_max: string;
}

interface AlertFormProps {
  form: AlertFormState;
  onChange: (form: AlertFormState) => void;
  isEditing: boolean;
  editingName?: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const MODALITIES = ['pregao_eletronico', 'pregao', 'concorrencia', 'dispensa', 'inexigibilidade', 'credenciamento', 'tomada_precos', 'leilao', 'rdc'];

const split = (csv: string) => csv.split(',').map((s) => s.trim()).filter(Boolean);
const join = (list: string[]) => list.join(', ');

const fieldStyle = { border: '1px solid var(--color-text)', background: '#fff', color: 'var(--color-text)' };
const labelClass = 'text-[13px] font-bold';

/** Campo de palavras em chips: Enter (ou vírgula) adiciona, × remove. */
function KeywordChips({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const words = split(draft).filter((w) => !value.includes(w));
    if (words.length) onChange([...value, ...words]);
    setDraft('');
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-11 py-1.5 px-2 box-border" style={fieldStyle}>
      {value.map((w) => (
        <button
          key={w}
          type="button"
          onClick={() => onChange(value.filter((x) => x !== w))}
          className="inline-flex items-center gap-1.5 h-[30px] px-2 text-[13px] font-semibold cursor-pointer"
          style={{ background: 'var(--color-chip)', color: 'var(--color-text)', border: 0 }}
          aria-label={`Remover palavra ${w}`}
        >
          {w} <span aria-hidden>×</span>
        </button>
      ))}
      <label className="flex-1 min-w-[120px]">
        <span className="sr-only-text">Adicionar palavra-chave</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
            else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          placeholder={value.length ? 'Enter para adicionar' : 'Ex.: obras, reforma'}
          className="w-full h-[30px] border-0 bg-transparent text-[14px] outline-none"
        />
      </label>
    </div>
  );
}

/** Formulário de alerta (painel lateral): nome, palavras, UFs, órgãos, modalidades e valor. */
export function AlertForm({ form, onChange, isEditing, editingName, onSubmit, onCancel }: AlertFormProps) {
  const set = (field: keyof AlertFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...form, [field]: e.target.value });
  const modalities = split(form.modalities);
  const toggleModality = (m: string) =>
    onChange({ ...form, modalities: join(modalities.includes(m) ? modalities.filter((x) => x !== m) : [...modalities, m]) });

  return (
    <section
      aria-label={isEditing ? 'Editar alerta' : 'Novo alerta'}
      className="p-6 sm:p-[26px] flex flex-col gap-5"
      style={{ border: '2px solid var(--color-text)', background: 'var(--color-field)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-extrabold">{isEditing ? `Editar “${editingName}”` : 'Novo alerta'}</h2>
        <button type="button" onClick={onCancel} aria-label="Fechar" className="w-10 h-10 text-[24px] cursor-pointer" style={{ color: 'var(--color-text)' }}>
          ×
        </button>
      </div>

      <label className={`flex flex-col gap-1.5 ${labelClass}`}>
        Nome
        <input value={form.name} onChange={set('name')} placeholder="Ex.: Obras em SP" className="h-11 px-3 text-[15px] font-normal" style={fieldStyle} />
      </label>

      <div className="flex flex-col gap-1.5">
        <p className={labelClass}>Palavras-chave</p>
        <KeywordChips value={split(form.keywords)} onChange={(v) => onChange({ ...form, keywords: join(v) })} />
        <p className="text-[12px]" style={{ color: 'var(--color-muted)' }}>Qualquer uma das palavras.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className={labelClass}>UFs</p>
        <UfPicker value={split(form.ufs).map((u) => u.toUpperCase())} onChange={(v) => onChange({ ...form, ufs: join(v) })} compact />
      </div>

      <label className={`flex flex-col gap-1.5 ${labelClass}`}>
        <span>Órgãos <span className="font-normal" style={{ color: 'var(--color-muted)' }}>(opcional, separados por vírgula)</span></span>
        <input value={form.organs} onChange={set('organs')} placeholder="Ministério da Defesa" className="h-11 px-3 text-[14px] font-normal" style={fieldStyle} />
      </label>

      <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
        <legend className={`p-0 pb-2 ${labelClass}`}>Modalidades</legend>
        <div className="flex flex-wrap gap-1.5">
          {MODALITIES.map((m) => {
            const on = modalities.includes(m);
            return (
              <label
                key={m}
                className={`inline-flex items-center gap-1.5 h-[34px] px-2.5 text-[13px] cursor-pointer ${on ? 'font-bold' : 'font-semibold'}`}
                style={{ border: '1px solid var(--color-text)', background: on ? 'var(--color-text)' : 'transparent', color: on ? '#fff' : 'var(--color-text)' }}
              >
                <input type="checkbox" checked={on} onChange={() => toggleModality(m)} style={{ accentColor: on ? '#fff' : 'var(--color-text)' }} />
                {modalityLabel(m)}
              </label>
            );
          })}
        </div>
        <p className="text-[12px]" style={{ color: 'var(--color-muted)' }}>Nenhuma marcada = qualquer modalidade.</p>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className={`flex flex-col gap-1.5 ${labelClass}`}>
          Valor mínimo (R$)
          <input type="number" inputMode="numeric" value={form.value_min} onChange={set('value_min')} placeholder="0" className="h-11 px-3 text-[15px] font-normal" style={fieldStyle} />
        </label>
        <label className={`flex flex-col gap-1.5 ${labelClass}`}>
          Valor máximo (R$)
          <input type="number" inputMode="numeric" value={form.value_max} onChange={set('value_max')} placeholder="sem limite" className="h-11 px-3 text-[15px] font-normal" style={fieldStyle} />
        </label>
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!form.name.trim()}
          className="h-12 px-[22px] text-[15px] font-bold cursor-pointer disabled:opacity-50"
          style={{ background: 'var(--color-accent)', border: 0, color: '#fff' }}
        >
          {isEditing ? 'Salvar alterações' : 'Criar alerta'}
        </button>
        <button type="button" onClick={onCancel} className="h-12 px-[18px] text-[15px] font-semibold underline cursor-pointer" style={{ color: 'var(--color-text)' }}>
          Cancelar
        </button>
      </div>
    </section>
  );
}

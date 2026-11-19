'use client';

import { useState } from 'react';

export type FavoriteStatus = '' | 'analisando' | 'vou_participar' | 'proposta_enviada' | 'referencia';

export interface FavoriteItemMeta {
  note: string;
  folder: string;
  status: FavoriteStatus;
}

export interface FavoritesMeta {
  folders: string[];
  items: Record<string, FavoriteItemMeta>;
}

export const EMPTY_META: FavoritesMeta = { folders: [], items: {} };
const EMPTY_ITEM: FavoriteItemMeta = { note: '', folder: '', status: '' };

export const STATUSES: { id: Exclude<FavoriteStatus, ''>; label: string }[] = [
  { id: 'analisando', label: 'Analisando' },
  { id: 'vou_participar', label: 'Vou participar' },
  { id: 'proposta_enviada', label: 'Proposta enviada' },
  { id: 'referencia', label: 'Só referência' },
];

export function itemOf(meta: FavoritesMeta, articleId: number): FavoriteItemMeta {
  return { ...EMPTY_ITEM, ...meta.items[String(articleId)] };
}

/** Atualiza (ou remove, se vazio) a nota/pasta/status de um favorito. */
export function withItem(meta: FavoritesMeta, articleId: number, patch: Partial<FavoriteItemMeta>): FavoritesMeta {
  const key = String(articleId);
  const next = { ...itemOf(meta, articleId), ...patch };
  const items = { ...meta.items };
  if (next.note.trim() || next.folder || next.status) items[key] = next;
  else delete items[key];
  return { ...meta, items };
}

/** Normaliza o que veio da API (itens antigos não têm status). */
export function normalizeMeta(m: Partial<FavoritesMeta> | null | undefined): FavoritesMeta {
  const items: Record<string, FavoriteItemMeta> = {};
  for (const [k, v] of Object.entries(m?.items ?? {})) items[k] = { ...EMPTY_ITEM, ...v };
  return { folders: m?.folders ?? [], items };
}

const fieldStyle = { border: '1px solid var(--color-text)', background: 'var(--color-field)', color: 'var(--color-text)' };

/** Nota do favorito: bloco cinza com "editar nota", ou "+ Adicionar nota". */
export function FavoriteNote({ articleId, meta, onChange }: { articleId: number; meta: FavoritesMeta; onChange: (next: FavoritesMeta) => void }) {
  const item = itemOf(meta, articleId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.note);

  const save = () => {
    onChange(withItem(meta, articleId, { note: draft.trim() }));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="mt-1 max-w-xl">
        <label htmlFor={`nota-${articleId}`} className="sr-only-text">Nota sobre esta publicação</label>
        <textarea
          id={`nota-${articleId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={2000}
          autoFocus
          placeholder="Ex.: conferir se aceita atestado de outro estado"
          className="w-full p-2.5 text-[14px] leading-snug"
          style={fieldStyle}
        />
        <div className="flex gap-2 mt-1.5">
          <button type="button" onClick={save} className="h-9 px-3 text-[13px] font-bold cursor-pointer" style={{ background: 'var(--color-text)', color: '#fff', border: '1px solid var(--color-text)' }}>
            Salvar nota
          </button>
          <button type="button" onClick={() => setEditing(false)} className="h-9 px-3 text-[13px] font-semibold underline cursor-pointer" style={{ color: 'var(--color-text)' }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (!item.note) {
    return (
      <button
        type="button"
        onClick={() => { setDraft(''); setEditing(true); }}
        className="self-start h-7 text-[13px] font-semibold underline cursor-pointer"
        style={{ color: 'var(--color-muted)' }}
      >
        + Adicionar nota
      </button>
    );
  }

  return (
    <div className="mt-1 py-2 px-2.5 text-[13px] leading-[1.45] whitespace-pre-line" style={{ background: 'var(--color-chip)' }}>
      {item.note}{' '}
      <button
        type="button"
        onClick={() => { setDraft(item.note); setEditing(true); }}
        className="font-semibold underline cursor-pointer"
        style={{ color: 'var(--color-text)' }}
      >
        editar nota
      </button>
    </div>
  );
}

/** Seletor de status; o escuro marca "Vou participar". */
export function StatusSelect({ articleId, meta, onChange }: { articleId: number; meta: FavoritesMeta; onChange: (next: FavoritesMeta) => void }) {
  const { status } = itemOf(meta, articleId);
  const style =
    status === 'vou_participar'
      ? { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: '#fff' }
      : status === 'analisando' || status === 'proposta_enviada'
        ? { border: '2px solid var(--color-text)', background: 'var(--color-field)', color: 'var(--color-text)' }
        : { border: '1px solid #8c8783', background: 'var(--color-field)', color: 'var(--color-muted)' };
  return (
    <label className="block">
      <span className="sr-only-text">Status</span>
      <select
        value={status}
        onChange={(e) => onChange(withItem(meta, articleId, { status: e.target.value as FavoriteStatus }))}
        className={`w-full h-10 px-2.5 text-[13px] cursor-pointer ${status && status !== 'referencia' ? 'font-bold' : 'font-semibold'}`}
        style={style}
      >
        <option value="">Sem status</option>
        {STATUSES.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
    </label>
  );
}

/** Pasta do favorito (só aparece quando existem pastas). */
export function FolderSelect({ articleId, meta, onChange }: { articleId: number; meta: FavoritesMeta; onChange: (next: FavoritesMeta) => void }) {
  if (meta.folders.length === 0) return null;
  const { folder } = itemOf(meta, articleId);
  return (
    <label className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--color-muted)' }}>
      Pasta
      <select
        value={folder}
        onChange={(e) => onChange(withItem(meta, articleId, { folder: e.target.value }))}
        className="h-8 px-1.5 text-[13px] font-semibold cursor-pointer"
        style={fieldStyle}
      >
        <option value="">Sem pasta</option>
        {meta.folders.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </label>
  );
}

'use client';

import { useState } from 'react';

export interface FavoritesMeta {
  folders: string[];
  items: Record<string, { note: string; folder: string }>;
}

export const EMPTY_META: FavoritesMeta = { folders: [], items: {} };

/** Atualiza (ou remove, se vazio) a nota/pasta de um favorito. */
export function withItem(meta: FavoritesMeta, articleId: number, patch: Partial<{ note: string; folder: string }>): FavoritesMeta {
  const key = String(articleId);
  const current = meta.items[key] ?? { note: '', folder: '' };
  const next = { ...current, ...patch };
  const items = { ...meta.items };
  if (next.note.trim() || next.folder) items[key] = next;
  else delete items[key];
  return { ...meta, items };
}

const fieldStyle = { border: '2px solid var(--color-text)', background: 'var(--color-bg)', color: 'var(--color-text)' };

/** Pasta + nota de um favorito, mostrados embaixo da linha da publicação. */
export function FavoriteMetaControls({
  articleId,
  meta,
  onChange,
}: {
  articleId: number;
  meta: FavoritesMeta;
  onChange: (next: FavoritesMeta) => void;
}) {
  const item = meta.items[String(articleId)] ?? { note: '', folder: '' };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.note);

  const saveNote = () => {
    onChange(withItem(meta, articleId, { note: draft.trim() }));
    setEditing(false);
  };

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {meta.folders.length > 0 && (
          <label className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>
            Pasta
            <select
              value={item.folder}
              onChange={(e) => onChange(withItem(meta, articleId, { folder: e.target.value }))}
              className="py-1 px-1.5 text-[13px] font-bold cursor-pointer"
              style={fieldStyle}
            >
              <option value="">Sem pasta</option>
              {meta.folders.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
        )}
        {!editing && (
          <button
            type="button"
            onClick={() => { setDraft(item.note); setEditing(true); }}
            className="text-[13px] font-bold underline cursor-pointer py-1"
            style={{ color: 'var(--color-text)' }}
          >
            {item.note ? 'Editar nota' : 'Adicionar nota'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="max-w-xl">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={2000}
            autoFocus
            placeholder="Ex.: conferir habilitação técnica até sexta"
            aria-label="Nota sobre esta publicação"
            className="w-full p-2.5 text-[14px] leading-snug"
            style={fieldStyle}
          />
          <div className="flex gap-2 mt-1.5">
            <button
              type="button"
              onClick={saveNote}
              className="py-1.5 px-3 text-[13px] font-bold cursor-pointer"
              style={{ background: 'var(--color-text)', color: 'var(--color-bg)', border: '2px solid var(--color-text)' }}
            >
              Salvar nota
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="py-1.5 px-3 text-[13px] font-bold cursor-pointer"
              style={{ border: '2px solid var(--color-neutral-400)', color: 'var(--color-text)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        item.note && (
          <p className="text-[14px] leading-snug pl-3 max-w-xl whitespace-pre-line" style={{ borderLeft: '3px solid var(--color-neutral-400)', color: 'var(--color-neutral-800)' }}>
            {item.note}
          </p>
        )
      )}
    </div>
  );
}

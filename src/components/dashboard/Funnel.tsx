'use client';

import { useEffect, useState } from 'react';
import { getProcessos } from '@/lib/api';
import type { Processo } from '@/lib/types';

const STAGES = [
  { key: 'aberto', label: 'Abertos', hint: 'propostas' },
  { key: 'homologado', label: 'Homologados', hint: 'aguardando contrato' },
  { key: 'contratado', label: 'Contratados', hint: 'em execução' },
];

function formatMoney(v?: number): string {
  if (v == null) return '';
  return `R$ ${v.toLocaleString('pt-BR')}`;
}

function deadlineHint(dateStr?: string) {
  if (!dateStr) return null;
  const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (d < 0) return null; // já passou
  const label = d === 0 ? 'abertura hoje' : d === 1 ? 'abertura amanhã' : `abertura em ${d} dias`;
  return (
    <div className="text-[11px] font-bold mt-0.5" style={{ color: d <= 3 ? 'var(--color-accent)' : 'var(--color-neutral-500)' }}>
      {label}
    </div>
  );
}

export function Funnel() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProcessos(300)
      .then(setProcessos)
      .catch(() => setProcessos([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const byStatus = (s: string) => processos.filter((p) => p.status === s);

  return (
    <div className="px-10 pt-7">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-black tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
          Processo licitatório
        </h2>
        <span className="text-[12px] font-bold" style={{ color: 'var(--color-neutral-500)' }}>
          {processos.length} processos acompanhados
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAGES.map((stage) => {
          const items = byStatus(stage.key);
          return (
            <div key={stage.key} style={{ border: '2px solid var(--color-divider)' }}>
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  background: stage.key === 'aberto' ? 'var(--color-accent)' : 'var(--color-surface)',
                  borderBottom: '2px solid var(--color-divider)',
                }}
              >
                <div>
                  <span className="text-sm font-black" style={{ color: stage.key === 'aberto' ? '#fff' : 'var(--color-text)' }}>
                    {stage.label}
                  </span>
                  <span className="block text-[11px] font-bold" style={{ color: stage.key === 'aberto' ? 'rgba(255,255,255,0.85)' : 'var(--color-neutral-500)' }}>
                    {stage.hint}
                  </span>
                </div>
                <span
                  className="text-lg font-black"
                  style={{ color: stage.key === 'aberto' ? '#fff' : 'var(--color-accent)' }}
                >
                  {items.length}
                </span>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {items.length === 0 && (
                  <div className="px-4 py-6 text-center text-[12px]" style={{ color: 'var(--color-neutral-500)' }}>
                    Nenhum processo neste estágio.
                  </div>
                )}
                {items.slice(0, 8).map((p) => (
                  <a
                    key={p.id}
                    href={`/processo/${p.id}`}
                    className="block px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderBottom: '1px solid var(--color-divider)', textDecoration: 'none' }}
                  >
                    <div className="text-[11px] font-bold mb-0.5" style={{ color: 'var(--color-accent)' }}>
                      {p.organ || 'Órgão'}
                    </div>
                    <div className="text-[13px] font-bold leading-snug" style={{ color: 'var(--color-text)' }}>
                      {p.objeto || p.numero}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--color-neutral-500)' }}>
                      {p.modalidade ? `${p.modalidade} · ` : ''}
                      {formatMoney(p.valor)}
                    </div>
                    {deadlineHint(p.data_abertura)}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

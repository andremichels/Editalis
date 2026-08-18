'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getProcesso } from '@/lib/api';
import type { Processo } from '@/lib/types';

const STATUS_LABEL: Record<string, string> = {
  aberto: 'Aberto',
  adjudicado: 'Adjudicado',
  homologado: 'Homologado',
  contratado: 'Contratado',
  suspenso: 'Suspenso',
  revogado: 'Revogado',
  rescindido: 'Rescindido',
};

const DOC_LABEL: Record<string, string> = {
  licitacao: 'Aviso de licitação',
  dispensa: 'Dispensa',
  inexigibilidade: 'Inexigibilidade',
  adjudicacao: 'Adjudicação',
  homologacao: 'Homologação',
  contrato: 'Contrato',
  aditivo: 'Aditivo',
  suspensao: 'Suspensão',
  revogacao: 'Revogação',
  rescisao: 'Rescisão',
};

function formatMoney(v?: number): string {
  if (v == null) return '';
  return `R$ ${v.toLocaleString('pt-BR')}`;
}

function formatDate(s?: string): string {
  if (!s) return '';
  return new Date(s).toLocaleDateString('pt-BR');
}

export default function ProcessoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<Processo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getProcesso(Number(params.id))
      .then(setP)
      .catch((e) => setError(e?.message || 'Processo não encontrado'))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <button
            onClick={() => router.back()}
            className="text-[12px] font-bold mb-4 cursor-pointer"
            style={{ color: 'var(--color-neutral-500)', background: 'none', border: 'none' }}
          >
            ← Voltar
          </button>

          {loading && (
            <div className="text-[13px]" style={{ color: 'var(--color-neutral-500)' }}>Carregando...</div>
          )}
          {error && !loading && (
            <div className="text-[13px] font-bold" style={{ color: 'var(--color-accent)' }}>{error}</div>
          )}

          {p && !loading && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                {p.status && (
                  <span
                    className="text-[11px] font-black uppercase tracking-[0.08em] px-3 py-1"
                    style={{
                      background: p.status === 'aberto' ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: p.status === 'aberto' ? '#fff' : 'var(--color-text)',
                      border: '2px solid var(--color-divider)',
                    }}
                  >
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                )}
                {p.modalidade && (
                  <span className="text-[12px] font-bold" style={{ color: 'var(--color-neutral-600)' }}>
                    {p.modalidade}
                  </span>
                )}
              </div>

              <h1
                className="text-[28px] font-black tracking-[-0.03em] leading-tight mt-3"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
              >
                {p.objeto || p.numero}
              </h1>
              <div className="text-[13px] mt-2" style={{ color: 'var(--color-neutral-600)' }}>
                {p.organ || 'Órgão'} · Processo {p.numero}
                {p.uf ? ` · ${p.uf}` : ''}
              </div>
            </>
          )}
        </div>

        {p && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
            <div className="px-10 py-6 min-w-0">
              <h2 className="text-lg font-black mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                Linha do tempo
              </h2>
              <div style={{ borderTop: '2px solid var(--color-text)' }}>
                {(p.timeline || []).length === 0 && (
                  <div className="py-6 text-[13px]" style={{ color: 'var(--color-neutral-500)' }}>
                    Sem atos registrados.
                  </div>
                )}
                {(p.timeline || []).map((ato, i) => (
                  <div
                    key={ato.article_id ?? i}
                    className="flex gap-4 py-4"
                    style={{ borderBottom: '1px solid var(--color-divider)' }}
                  >
                    <div className="w-24 shrink-0 text-[12px] font-bold" style={{ color: 'var(--color-neutral-500)' }}>
                      {formatDate(ato.published_date)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.04em] mb-0.5" style={{ color: 'var(--color-accent)' }}>
                        {DOC_LABEL[ato.doc_type || ''] || 'Ato'}
                      </div>
                      <div className="text-[14px] font-bold leading-snug" style={{ color: 'var(--color-text)' }}>
                        {ato.title}
                      </div>
                      {ato.value != null && (
                        <div className="text-[12px] mt-0.5" style={{ color: 'var(--color-neutral-500)' }}>
                          {formatMoney(ato.value)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-10 py-6 lg:border-l-2" style={{ borderColor: 'var(--color-text)' }}>
              <h2 className="text-lg font-black mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                Resumo
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-[11px] font-bold uppercase" style={{ color: 'var(--color-neutral-500)' }}>Valor</dt>
                  <dd className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>{formatMoney(p.valor) || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase" style={{ color: 'var(--color-neutral-500)' }}>Abertura</dt>
                  <dd className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>{formatDate(p.data_abertura) || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase" style={{ color: 'var(--color-neutral-500)' }}>Primeira publicação</dt>
                  <dd className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>{formatDate(p.data_primeira_publicacao) || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase" style={{ color: 'var(--color-neutral-500)' }}>Atos</dt>
                  <dd className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>{p.total_artigos ?? (p.timeline || []).length}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}

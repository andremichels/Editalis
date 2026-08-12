'use client';

import { formatDate, formatMoney } from '@/lib/utils';
import type { Payment } from '@/lib/api';

const sectionLabel = 'text-[11px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-600)' };

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'Pago', color: '#15803d', bg: '#dcfce7' },
  refunded: { label: 'Reembolsado', color: '#b45309', bg: '#fef3c7' },
  partially_refunded: { label: 'Reembolso parcial', color: '#b45309', bg: '#fef3c7' },
  failed: { label: 'Falhou', color: '#b91c1c', bg: '#fee2e2' },
};

function statusMeta(status: string) {
  return STATUS[status] ?? { label: status, color: 'var(--color-neutral-700)', bg: 'var(--color-neutral-200)' };
}

function planLabel(plan: string | null, billingCycle: string | null) {
  const p =
    plan === 'profissional' ? 'Profissional'
    : plan === 'essencial' ? 'Essencial'
    : plan === 'enterprise' ? 'Enterprise'
    : 'Plano';
  const c = billingCycle === 'annual' ? 'anual' : billingCycle === 'monthly' ? 'mensal' : '';
  return [p, c].filter(Boolean).join(' · ');
}

export function PagamentosTab({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="py-8 px-10">
        <div className={`${sectionLabel} mb-4`} style={sectionLabelStyle}>Histórico de pagamentos</div>
        <p className="text-sm" style={{ color: 'var(--color-neutral-600)' }}>
          Nenhum pagamento encontrado para a sua organização.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 px-10 max-w-[720px]">
      <div className={`${sectionLabel} mb-4`} style={sectionLabelStyle}>Histórico de pagamentos</div>
      <div style={{ border: '2px solid var(--color-text)' }}>
        {payments.map((p, i) => {
          const meta = statusMeta(p.status);
          const docUrl = p.invoice_url || p.receipt_url;
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 py-4 px-5"
              style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
            >
              <div className="min-w-0">
                <div className="text-[15px] font-bold">{formatMoney(p.amount_cents / 100)}</div>
                <div className="text-[13px] mt-0.5" style={{ color: 'var(--color-neutral-700)' }}>
                  {planLabel(p.plan, p.billing_cycle)} · {formatDate((p.created_at || '').slice(0, 10))}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className="text-[11px] font-bold uppercase px-2.5 py-1"
                  style={{ background: meta.bg, color: meta.color, letterSpacing: '0.06em' }}
                >
                  {meta.label}
                </span>
                {docUrl && (
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-bold underline"
                    style={{ color: 'var(--color-accent-700)' }}
                  >
                    Fatura
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

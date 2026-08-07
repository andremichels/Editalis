'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

interface Subscription {
  plan: string;
  plan_label: string;
  status: string;
  billing_cycle: string;
  price_cents: number | null;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_ends_at: string | null;
  usage: {
    alert_profiles_used: number;
    alert_profiles_limit: number | null;
  };
}

const STATUS_LABELS: Record<string, string> = {
  trialing: 'Trial',
  active: 'Ativo',
  past_due: 'Pagamento pendente',
  canceled: 'Cancelado',
};

function formatPrice(cents: number | null): string {
  if (cents === null) return 'sob consulta';
  return `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
}

function formatPeriod(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

function formatCycle(cycle: string): string {
  return cycle === 'annual' ? 'ano' : 'mês';
}

export function PlanCard() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) { setLoading(false); return; }
      fetch(`${API_BASE}/api/v1/account/subscription?user_id=${uid}`)
        .then((r) => r.json())
        .then(setSub)
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  const handleManage = async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) return;
    const res = await fetch(`${API_BASE}/api/v1/account/subscription/portal?user_id=${uid}`, { method: 'POST' });
    if (res.ok) {
      const { url } = await res.json();
      if (url) window.open(url, '_blank');
    }
  };

  return (
    <div className="py-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
        Plano e cobrança
      </div>

      {loading ? (
        <div className="h-[88px] skeleton max-w-md" />
      ) : sub ? (
        <div className="max-w-md">
          <div className="flex items-center justify-between p-5" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-black">{sub.plan_label}</div>
                <span className="text-[10px] px-2 py-0.5 font-bold uppercase"
                  style={{
                    background: sub.status === 'active' ? '#d4edda' : sub.status === 'past_due' ? '#f8d7da' : '#e2e3e5',
                    color: sub.status === 'active' ? '#155724' : sub.status === 'past_due' ? '#721c24' : '#383d41',
                  }}>
                  {STATUS_LABELS[sub.status] || sub.status}
                </span>
              </div>
              <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-700)' }}>
                {formatPrice(sub.price_cents)}/{formatCycle(sub.billing_cycle)}
                {sub.status !== 'canceled' && ` · renova em ${formatPeriod(sub.current_period_end)}`}
              </div>
              {sub.trial_ends_at && sub.status === 'trialing' && (
                <div className="text-[12px] mt-1 font-bold" style={{ color: 'var(--color-accent)' }}>
                  Trial até {formatPeriod(sub.trial_ends_at)} · sem cobrança
                </div>
              )}
              {sub.cancel_at_period_end && (
                <div className="text-[12px] mt-1" style={{ color: 'var(--color-neutral-600)' }}>
                  Será cancelado ao fim do período
                </div>
              )}
              <div className="text-[11px] mt-2" style={{ color: 'var(--color-neutral-500)' }}>
                {sub.usage.alert_profiles_used}/{sub.usage.alert_profiles_limit ?? '∞'} perfis de alerta usados
              </div>
            </div>
            <button
              onClick={handleManage}
              className="text-sm font-bold py-2.5 px-4 cursor-pointer whitespace-nowrap"
              style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
            >
              Gerenciar assinatura
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--color-neutral-600)' }}>
          Não foi possível carregar os dados da assinatura.
        </p>
      )}
    </div>
  );
}

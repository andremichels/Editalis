'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { getSubscription, getSubscriptionPortalUrl, type Subscription } from '@/lib/api';

const STATUS_LABELS: Record<Subscription['status'], string> = {
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
  const [openingPortal, setOpeningPortal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (!uid) { setLoading(false); return; }
      getSubscription(uid)
        .then(setSub)
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  const handleManage = async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) return;
    setOpeningPortal(true);
    try {
      const url = await getSubscriptionPortalUrl(uid);
      if (!url) throw new Error('no url');
      window.location.href = url;
    } catch {
      toast('Portal de cobrança ainda não disponível — fale com o suporte pra alterar seu plano.', 'info');
    } finally {
      setOpeningPortal(false);
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
                <span
                  className="text-[10px] px-2 py-0.5 font-bold uppercase"
                  style={sub.status === 'active'
                    ? { background: 'var(--color-text)', color: 'var(--color-bg)' }
                    : sub.status === 'past_due'
                    ? { background: 'var(--color-accent)', color: '#fff' }
                    : { border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-700)' }}
                >
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
              disabled={openingPortal}
              className="text-sm font-bold py-2.5 px-4 cursor-pointer whitespace-nowrap disabled:opacity-60"
              style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
            >
              {openingPortal ? 'Abrindo...' : 'Gerenciar assinatura'}
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

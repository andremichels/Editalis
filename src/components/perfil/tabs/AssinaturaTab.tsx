'use client';

import Link from 'next/link';
import type { Subscription } from '@/lib/api';
import { formatMoney } from '@/lib/utils';
import { daysUntil, formatDateLong } from '@/lib/format';
import { useToast } from '@/components/Toast';

const sectionLabel = 'text-[11px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-700)' };

interface AssinaturaTabProps {
  subscription: Subscription | null;
  teamCount: number;
  onManagePortal: () => void;
  openingPortal: boolean;
}

export function AssinaturaTab({ subscription, teamCount, onManagePortal, openingPortal }: AssinaturaTabProps) {
  const { toast } = useToast();

  const handleCancel = () => {
    toast('Cancelamento de assinatura ainda não disponível — fale com o suporte.', 'info');
  };

  const handleChangeCard = () => {
    toast('Troca de forma de pagamento ainda não disponível.', 'info');
  };

  if (!subscription) {
    return <div className="py-8 px-10 h-32 skeleton max-w-2xl" />;
  }

  const usagePct = subscription.usage.alert_profiles_limit
    ? Math.min(100, (subscription.usage.alert_profiles_used / subscription.usage.alert_profiles_limit) * 100)
    : 100;

  // Só fala em "fim do teste" enquanto o teste está em andamento — antes
  // aparecia uma data de teste já vencida num plano ativo.
  const trialDays = subscription.status === 'trialing' ? daysUntil(subscription.trial_ends_at) : null;
  const inTrial = trialDays != null && trialDays >= 0;
  const billingLabel = inTrial
    ? 'Fim do teste'
    : subscription.cancel_at_period_end
      ? 'Acesso até'
      : 'Próxima cobrança';
  const billingDate = inTrial ? subscription.trial_ends_at : subscription.current_period_end;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="py-8 px-10 min-w-0" style={{ borderRight: '2px solid var(--color-text)' }}>
        <div className="p-7 max-w-[640px]" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}>
          <div className="flex justify-between items-start gap-6">
            <div>
              <div className={sectionLabel} style={{ letterSpacing: '0.16em', color: 'var(--color-neutral-700)' }}>Plano atual</div>
              <div className="text-[32px] font-black tracking-[-0.03em] mt-2 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{subscription.plan_label}</div>
              <div className="text-sm" style={{ color: 'var(--color-neutral-700)' }}>
                {subscription.usage.alert_profiles_limit == null ? 'Alertas ilimitados' : `Até ${subscription.usage.alert_profiles_limit} alertas`} · {subscription.billing_cycle === 'annual' ? 'cobrança anual' : 'cobrança mensal'}
              </div>
            </div>
            <div className="text-right whitespace-nowrap">
              {subscription.price_cents !== null ? (
                <>
                  <div className="text-[28px] font-black tracking-[-0.03em]">{formatMoney(subscription.price_cents / 100)}</div>
                  <div className="text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>/{subscription.billing_cycle === 'annual' ? 'ano' : 'mês'}</div>
                </>
              ) : (
                <div className="text-xl font-black">Sob consulta</div>
              )}
            </div>
          </div>
          <div className="flex justify-between text-sm mt-6 pt-4" style={{ borderTop: '1px solid var(--color-divider)' }}>
            <span style={{ color: 'var(--color-neutral-700)' }}>{billingLabel}</span>
            <span className="font-bold">{formatDateLong(billingDate)}</span>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onManagePortal}
              disabled={openingPortal}
              className="text-left py-3 px-5 text-sm font-bold cursor-pointer disabled:opacity-60"
              style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
            >
              {openingPortal ? 'Abrindo...' : 'Trocar para anual e economizar 20%'}
            </button>
            <Link href="/planos" className="text-left py-3 px-5 text-sm font-bold" style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}>
              Comparar planos
            </Link>
          </div>
        </div>


        <div className="mt-9 pt-6 max-w-[640px]" style={{ borderTop: '2px solid var(--color-text)' }}>
          <div className="text-[15px] font-extrabold mb-1.5">Cancelar assinatura</div>
          <p className="text-sm mb-4 max-w-[520px] leading-[1.55]" style={{ color: 'var(--color-neutral-700)' }}>
            O acesso continua até o fim do ciclo pago e seus alertas ficam guardados por 90 dias.
          </p>
          <button
            onClick={handleCancel}
            className="text-left py-3 px-5 text-sm font-bold cursor-pointer"
            style={{ background: 'transparent', border: '2px solid var(--color-neutral-500)', color: 'var(--color-neutral-700)' }}
          >
            Cancelar assinatura
          </button>
        </div>
      </div>

      <div>
        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-3.5`} style={sectionLabelStyle}>Forma de pagamento</div>
          <p className="text-sm mb-3.5" style={{ color: 'var(--color-neutral-700)' }}>Nenhuma forma de pagamento cadastrada.</p>
          <button
            onClick={handleChangeCard}
            className="w-full text-left py-2.5 px-4 text-[13px] font-bold cursor-pointer"
            style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
          >
            Adicionar cartão
          </button>
        </div>
        <div className="p-6">
          <div className={`${sectionLabel} mb-3.5`} style={sectionLabelStyle}>Limites do plano</div>
          <div className="text-sm">
            <div className="pb-3" style={{ borderBottom: '1px solid var(--color-divider)' }}>
              <div className="flex justify-between mb-2">
                <span>Alertas</span>
                <span className="font-bold">{subscription.usage.alert_profiles_used} de {subscription.usage.alert_profiles_limit ?? '∞'}</span>
              </div>
              <div className="h-1.5" style={{ background: 'var(--color-neutral-300)' }}>
                <div className="h-full" style={{ width: `${usagePct}%`, background: 'var(--color-text)' }} />
              </div>
            </div>
            <div className="py-3" style={{ borderBottom: '1px solid var(--color-divider)' }}>
              <div className="flex justify-between">
                <span>Usuários</span>
                <span className="font-bold">{teamCount} {teamCount === 1 ? 'usuário' : 'usuários'} · sem limite</span>
              </div>
            </div>
            <div className="flex justify-between py-3">
              <span>Histórico</span>
              <span className="font-bold">completo desde 2018</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

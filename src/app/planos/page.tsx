'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarketingLayout } from '@/components/layout/PageLayout';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Check, ArrowRight } from 'lucide-react';

interface PlanCard {
  name: string;
  tag: string;
  monthly: number | null;
  annual: number | null;
  priceLabel?: string;
  features: string[];
  highlight?: boolean;
}

const plans: Record<string, PlanCard> = {
  essencial: {
    name: 'Essencial',
    tag: 'Pequena empresa',
    monthly: 49,
    annual: 39,
    features: [
      '3 perfis de busca monitorados',
      'Histórico de 30 dias',
      'Alerta por e-mail diário',
      'Exportação CSV',
      'Suporte por e-mail',
    ],
    highlight: false as const,
  },
  profissional: {
    name: 'Profissional',
    tag: 'Média empresa · mais assinado',
    monthly: 199,
    annual: 159,
    features: [
      '25 perfis de busca monitorados',
      'Histórico completo desde 2018',
      'E-mail, WhatsApp e app',
      'Exportação CSV e Excel',
      'Suporte prioritário em 4h',
    ],
    highlight: true,
  },
  enterprise: {
    name: 'Enterprise',
    tag: 'Grande fornecedor',
    monthly: null,
    annual: null,
    priceLabel: 'Sob consulta',
    features: [
      'Perfis ilimitados',
      'API e webhooks',
      'SSO e gestão de equipes',
      'Gerente de conta dedicado',
      'SLA contratual',
    ],
    highlight: false as const,
  },
};

const faqItems = [
  { q: 'Preciso de cartão para começar?', a: 'Não. São 7 dias de teste grátis no plano Profissional. A cobrança só começa se você confirmar após o período de teste.' },
  { q: 'Posso trocar de plano depois?', a: 'Sim, a qualquer momento com ajuste proporcional no ciclo seguinte. Upgrade é imediato, downgrade no próximo ciclo.' },
  { q: 'Emitem nota fiscal?', a: 'Sim. Emitimos nota fiscal para todos os planos. Para empenho e faturamento por contrato, fale com vendas no plano Enterprise.' },
  { q: 'Como funciona o cancelamento?', a: 'Cancele a qualquer momento pelo painel ou portal Stripe. Seus dados e alertas ficam disponíveis por 30 dias após o cancelamento.' },
];

export default function PlanosPage() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);

  const handleSelect = (planKey: string) => {
    if (planKey === 'enterprise') {
      window.location.href = 'mailto:andre@smartpeople.us?subject=Plano%20Enterprise%20Editalis';
      return;
    }
    router.push(`/checkout?plan=${planKey}&cycle=${annual ? 'annual' : 'monthly'}`);
  };

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-7xl px-5 sm:px-10 py-14 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[40px] sm:text-[56px] font-black leading-[0.96] tracking-[-0.035em] mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            Escolha seu plano
          </h1>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--color-neutral-700)' }}>
            7 dias grátis no Profissional. Sem cartão, cancele quando quiser.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <SegmentedControl
            options={[
              { value: 'monthly', label: 'Mensal' },
              { value: 'annual', label: 'Anual −20%' },
            ]}
            value={annual ? 'annual' : 'monthly'}
            onChange={(v) => setAnnual(v === 'annual')}
          />
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className="relative flex flex-col p-8"
              style={{
                background: plan.highlight ? 'var(--color-neutral-100)' : 'var(--color-surface)',
                border: plan.highlight ? '2px solid var(--color-accent)' : '2px solid var(--color-divider)',
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  MAIS ASSINADO
                </div>
              )}

              <div className="text-[11px] font-bold uppercase mb-1"
                style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
                {plan.tag}
              </div>
              <div className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                {plan.name}
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.monthly !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>R$</span>
                    <span className="text-[54px] font-black leading-none tracking-[-0.04em]"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                      {annual ? plan.annual : plan.monthly}
                    </span>
                    <span className="text-[15px]" style={{ color: 'var(--color-neutral-700)' }}>/mês</span>
                  </div>
                ) : (
                  <span className="text-[40px] font-black tracking-[-0.03em]"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                    {plan.priceLabel}
                  </span>
                )}
                {plan.monthly !== null && (
                  <p className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-500)' }}>
                    {annual ? `R$ ${((plan.annual ?? 0) * 12).toLocaleString('pt-BR')} cobrado anualmente` : 'cobrado mensalmente'}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 mb-6" style={{ borderTop: '1px solid var(--color-divider)' }}>
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 py-3 text-sm"
                    style={{
                      borderBottom: i < plan.features.length - 1 ? '1px solid var(--color-divider)' : 'none',
                      color: 'var(--color-neutral-700)'
                    }}>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSelect(key)}
                className="w-full py-3.5 px-5 text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2"
                style={plan.highlight
                  ? { background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }
                  : { background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
              >
                {key === 'enterprise' ? 'Falar com vendas' : `Começar teste grátis ${plan.highlight ? '' : ''}`}
                {key !== 'enterprise' && <ArrowRight className="w-4 h-4" />}
              </button>

              {key !== 'enterprise' && (
                <p className="text-center text-xs mt-3" style={{ color: 'var(--color-neutral-500)' }}>
                  7 dias grátis · sem compromisso
                </p>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-20" style={{ borderTop: '2px solid var(--color-text)' }}>
          <h2 className="text-[32px] font-black tracking-[-0.03em] mt-10 mb-8"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            Perguntas frequentes
          </h2>
          {faqItems.map((item, i) => (
            <div key={i} className="py-5"
              style={{ borderBottom: i < faqItems.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
              <div className="text-[17px] font-extrabold mb-1.5" style={{ color: 'var(--color-text)' }}>{item.q}</div>
              <p className="text-[15px] leading-[1.55]" style={{ color: 'var(--color-neutral-700)' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}

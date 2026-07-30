'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Check, Building2, Newspaper, Bell, MapPin, Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// ── Example bid cards for hero ──
const exampleBids = [
  {
    title: 'Pregão eletrônico 114/2026 · SP',
    description: 'Aquisição de equipamentos de informática para a rede municipal de ensino',
    organ: 'Prefeitura de Campinas',
  },
  {
    title: 'Dispensa 22/2026 · MG',
    description: 'Serviços continuados de manutenção predial',
    organ: 'Universidade Federal de Minas Gerais',
  },
];

// ── Steps ──
const steps = [
  {
    number: '01',
    title: 'Descreva o que você vende',
    description:
      'CNAE, palavras-chave, regiões e faixa de valor. O perfil de captação leva dois minutos.',
  },
  {
    number: '02',
    title: 'A base cruza tudo à noite',
    description:
      'Cada publicação é lida, classificada por objeto e ligada ao órgão comprador.',
  },
  {
    number: '03',
    title: 'Você recebe e decide',
    description:
      'E-mail às 06h30, WhatsApp para urgências e o painel com prazos e favoritas.',
  },
];

// ── Coverage ──
const coverage = [
  { label: 'Diário Oficial da União', detail: 'seções 1 e 3, desde 2018', icon: Newspaper },
  { label: '27 diários estaduais', detail: 'cobertura integral', icon: MapPin },
  { label: '1.412 diários municipais', detail: 'capitais e regiões metropolitanas', icon: Building2 },
  { label: 'Portais de compras', detail: 'conciliação de status e itens', icon: Shield },
];

// ── Plans ──
const plans = [
  {
    name: 'Essencial',
    price: 'R$ 149',
    period: '/mês',
    features: [
      '3 perfis de busca monitorados',
      'Histórico de 30 dias',
      'Alerta por e-mail diário',
      'Suporte por e-mail',
    ],
    cta: 'Assinar Essencial',
    highlight: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 349',
    period: '/mês',
    tag: 'mais assinado',
    features: [
      '25 perfis de busca monitorados',
      'Histórico completo desde 2018',
      'E-mail, WhatsApp e app',
      'Exportação CSV e Excel',
      'Suporte prioritário em 4h',
    ],
    cta: 'Assinar Profissional →',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    features: [
      'Perfis ilimitados',
      'SSO e gestão de equipes',
      'Gerente de conta dedicado',
      'contrato anual · nota fiscal e empenho',
    ],
    cta: 'Falar com vendas',
    highlight: false,
  },
];

// ── FAQ ──
const faq = [
  {
    q: 'De onde vêm os dados?',
    a: 'Exclusivamente de publicações oficiais: DOU, diários estaduais e municipais, conciliados com os portais de compras públicos.',
  },
  {
    q: 'Preciso de cartão para testar?',
    a: 'Não. São 7 dias com acesso completo ao plano Profissional; a cobrança só começa se você confirmar.',
  },
  {
    q: 'Emitem nota fiscal e aceitam empenho?',
    a: 'Sim. Nota fiscal em todos os planos; empenho e faturamento por contrato no Enterprise.',
  },
  {
    q: 'Posso trocar de plano depois?',
    a: 'A qualquer momento, com valor proporcional no ciclo seguinte.',
  },
];

// ── Page ──
export default function LandingPage() {
  return (
    <PageLayout>
      {/* ═══════════ HERO ═══════════ */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: headline */}
            <div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tight mb-4"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-text)' }}
              >
                Lemos todos os diários oficiais.
                <br />
                <span style={{ color: 'var(--color-accent)' }}>
                  Você recebe só o que a sua empresa vende.
                </span>
              </h1>
              <p
                className="text-sm sm:text-base max-w-lg mb-8"
                style={{ color: 'var(--color-neutral-600)' }}
              >
                O Editalis lê os diários oficiais todos os dias, estrutura cada
                edital e entrega no seu e-mail apenas o que casa com o que você
                fornece. Sem garimpo em PDF, sem perder prazo.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg">
                  Começar teste grátis <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="lg">
                  Ver a plataforma
                </Button>
              </div>
              <p
                className="mt-3 text-xs"
                style={{ color: 'var(--color-neutral-500)' }}
              >
                7 dias sem cartão · cancele quando quiser
              </p>
            </div>

            {/* Right: example cards */}
            <div className="space-y-3">
              {exampleBids.map((bid, i) => (
                <div
                  key={i}
                  className="p-4"
                  style={{
                    background: 'var(--color-surface)',
                    border: '2px solid var(--color-divider)',
                  }}
                >
                  <div
                    className="mb-2"
                    style={{
                      borderTop: '2px solid var(--color-accent)',
                      width: '2rem',
                    }}
                  />
                  <h3
                    className="text-sm font-semibold mb-1"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {bid.title}
                  </h3>
                  <p
                    className="text-xs mb-2"
                    style={{ color: 'var(--color-neutral-600)' }}
                  >
                    {bid.description}
                  </p>
                  <Badge variant="neutral">{bid.organ}</Badge>
                </div>
              ))}

              <p
                className="text-xs text-right"
                style={{ color: 'var(--color-accent)', fontWeight: 600 }}
              >
                + 1.284 outras publicações nas últimas 24h
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ COUNTER BAR ═══════════ */}
      <section
        className="px-4 py-8"
        style={{
          background: 'var(--color-accent)',
          color: '#fff',
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              ['1.284', 'diários oficiais indexados'],
              ['2,3M', 'licitações no histórico'],
              ['06h30', 'alerta diário na sua caixa'],
              ['2018', 'base contínua desde'],
            ].map(([num, label]) => (
              <div key={label}>
                <div
                  className="text-2xl sm:text-3xl mb-1"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}
                >
                  {num}
                </div>
                <div className="text-xs opacity-80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 3 STEPS ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <h2
            className="text-2xl sm:text-3xl mb-12"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: 'var(--color-text)',
            }}
          >
            Três passos e o edital certo chega até você.
          </h2>
          <div className="grid sm:grid-cols-3 gap-0"
            style={{ border: '2px solid var(--color-divider)' }}
          >
            {steps.map((step, i) => (
              <div
                key={i}
                className="p-6"
                style={{
                  borderRight: i < 2 ? '2px solid var(--color-divider)' : 'none',
                }}
              >
                <div
                  className="text-5xl mb-4"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    color: 'var(--color-accent)',
                  }}
                >
                  {step.number}
                </div>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--color-neutral-600)' }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COVERAGE ═══════════ */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-20"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-baseline justify-between mb-8">
            <h2
              className="text-2xl sm:text-3xl"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                color: 'var(--color-text)',
              }}
            >
              Cobertura da base
            </h2>
            <span
              className="text-xs"
              style={{ color: 'var(--color-neutral-500)' }}
            >
              atualizado em 30/07/2026
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0"
            style={{ border: '2px solid var(--color-divider)' }}
          >
            {coverage.map((item, i) => (
              <div
                key={i}
                className="p-5"
                style={{
                  borderRight: i < 3 ? '2px solid var(--color-divider)' : 'none',
                }}
              >
                <item.icon
                  className="w-5 h-5 mb-3"
                  style={{ color: 'var(--color-accent)' }}
                />
                <h3
                  className="text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  {item.label}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-neutral-600)' }}
                >
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PLANS ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <h2
            className="text-2xl sm:text-3xl mb-2"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: 'var(--color-text)',
            }}
          >
            Planos
          </h2>
          <p
            className="text-sm mb-10"
            style={{ color: 'var(--color-neutral-600)' }}
          >
            Preço por empresa, usuários ilimitados em todos os planos.
          </p>

          <div className="grid sm:grid-cols-3 gap-0"
            style={{ border: '2px solid var(--color-divider)' }}
          >
            {plans.map((plan, i) => (
              <div
                key={i}
                className="p-6 flex flex-col"
                style={{
                  borderRight: i < 2 ? '2px solid var(--color-divider)' : 'none',
                  background: plan.highlight ? 'var(--color-bg)' : 'transparent',
                }}
              >
                {plan.tag && (
                  <Badge variant="accent" className="self-start mb-3">
                    {plan.tag}
                  </Badge>
                )}
                <h3
                  className="text-sm font-semibold mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span
                    className="text-3xl"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      color: 'var(--color-text)',
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-neutral-500)' }}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-xs"
                      style={{ color: 'var(--color-neutral-600)' }}
                    >
                      <Check
                        className="w-3.5 h-3.5 mt-0.5 shrink-0"
                        style={{ color: 'var(--color-accent)' }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? 'primary' : 'secondary'}
                  size="md"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          <p
            className="mt-8 text-xs text-center"
            style={{ color: 'var(--color-neutral-500)' }}
          >
            Usado por equipes de captação em
          </p>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-20"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-2xl sm:text-3xl mb-8"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: 'var(--color-text)',
            }}
          >
            Perguntas frequentes
          </h2>
          <div style={{ border: '2px solid var(--color-divider)' }}>
            {faq.map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-20"
        style={{ background: 'var(--color-accent)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="text-2xl sm:text-4xl mb-3"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            O edital que você não leu foi vendido por outro.
          </h2>
          <p className="text-sm mb-8 opacity-90" style={{ color: '#fff' }}>
            Comece a monitorar hoje. Configuração em dois minutos, sem
            instalação.
          </p>
          <Button
            size="lg"
            className="!bg-white !text-[var(--color-accent)] hover:!bg-[var(--color-neutral-100)] !border-white"
          >
            Criar minha conta <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}

// ── FAQ Accordion ──
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '2px solid var(--color-divider)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-neutral-500)' }}
        />
      </button>
      {open && (
        <div
          className="px-4 pb-4 text-xs leading-relaxed"
          style={{ color: 'var(--color-neutral-600)' }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

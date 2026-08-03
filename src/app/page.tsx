'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Check, Building2, Newspaper, Bell, MapPin, Shield, Mail, Smartphone } from 'lucide-react';
import { useState } from 'react';

const steps = [
  { number: '01', title: 'Descreva o que você vende', description: 'CNAE, palavras-chave, regiões e faixa de valor. O perfil de captação leva dois minutos.' },
  { number: '02', title: 'A base cruza tudo à noite', description: 'Cada publicação é lida, classificada por objeto e ligada ao órgão comprador.' },
  { number: '03', title: 'Você recebe e decide', description: 'E-mail às 06h30, WhatsApp para urgências e o painel com prazos e favoritas.' },
];

const coverage = [
  { label: 'Diário Oficial da União', detail: 'seções 1 e 3, desde 2018', icon: Newspaper },
  { label: '27 diários estaduais', detail: 'cobertura integral', icon: MapPin },
  { label: '1.412 diários municipais', detail: 'capitais e regiões metropolitanas', icon: Building2 },
  { label: 'Portais de compras', detail: 'conciliação de status e itens', icon: Shield },
];

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    { name: 'Essencial', tag: 'Pequena empresa', price: annual ? 39 : 49, features: ['3 perfis de busca monitorados', 'Histórico de 30 dias', 'Alerta por e-mail diário', 'Exportação CSV', 'Suporte por e-mail'], cta: 'Assinar Essencial', highlight: false },
    { name: 'Profissional', tag: 'Média empresa · mais assinado', price: annual ? 159 : 199, features: ['25 perfis de busca monitorados', 'Histórico completo desde 2018', 'E-mail, WhatsApp e app', 'Exportação CSV e Excel', 'Suporte prioritário em 4h'], cta: 'Assinar Profissional →', highlight: true },
    { name: 'Enterprise', tag: 'Grande fornecedor', price: null, priceLabel: 'Sob consulta', features: ['Perfis ilimitados', 'API e webhooks', 'SSO e gestão de equipes', 'Gerente de conta dedicado', 'SLA contratual'], cta: 'Falar com vendas', highlight: false },
  ];

  const faq = [
    { q: 'De onde vêm os dados?', a: 'Exclusivamente de publicações oficiais: DOU, diários estaduais e municipais, conciliados com os portais de compras públicos.' },
    { q: 'Preciso de cartão para testar?', a: 'Não. São 7 dias com acesso completo ao plano Profissional; a cobrança só começa se você confirmar.' },
    { q: 'Emitem nota fiscal e aceitam empenho?', a: 'Sim. Nota fiscal em todos os planos; empenho e faturamento por contrato no Enterprise.' },
    { q: 'Posso trocar de plano depois?', a: 'A qualquer momento, com valor proporcional no ciclo seguinte.' },
  ];

  return (
    <PageLayout>
      {/* ═══════════ HERO ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: 'var(--color-bg)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs mb-6 font-semibold tracking-wider uppercase" style={{ color: 'var(--color-neutral-500)' }}>
                Diários oficiais · União, 27 estados, 1.400+ municípios
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tight mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
                Lemos todos os diários oficiais.<br />
                <span style={{ color: 'var(--color-accent)' }}>Você recebe só o que a sua empresa vende.</span>
              </h1>
              <p className="text-sm sm:text-base max-w-lg mb-8 leading-relaxed" style={{ color: 'var(--color-neutral-600)' }}>
                O Editalis lê os diários oficiais todos os dias, estrutura cada edital e entrega no seu e-mail apenas o que casa com o que você fornece. Sem garimpo em PDF, sem perder prazo.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => window.location.href = '/cadastro'}>
                  Começar teste grátis <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="lg">Ver a plataforma</Button>
              </div>
              <p className="mt-3 text-xs" style={{ color: 'var(--color-neutral-500)' }}>7 dias sem cartão · cancele quando quiser</p>
            </div>

            <div>
              <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--color-neutral-500)' }}>Publicado hoje</p>
              <div className="space-y-3">
                {[
                  { title: 'Pregão eletrônico 114/2026 · SP', desc: 'Aquisição de equipamentos de informática para a rede municipal de ensino', organ: 'Prefeitura de Campinas', value: 'R$ 2.480.000' },
                  { title: 'Dispensa 22/2026 · MG', desc: 'Serviços continuados de manutenção predial', organ: 'Universidade Federal de Minas Gerais', value: 'R$ 386.500' },
                ].map((bid, i) => (
                  <div key={i} className="p-4" style={{ background: 'var(--color-surface)', border: '2px solid var(--color-divider)' }}>
                    <div className="mb-2" style={{ borderTop: '2px solid var(--color-accent)', width: '2rem' }} />
                    <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{bid.title}</h3>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-neutral-600)' }}>{bid.desc}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="neutral">{bid.organ}</Badge>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{bid.value}</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-right font-semibold" style={{ color: 'var(--color-accent)' }}>+ 1.284 outras publicações nas últimas 24h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ COUNTER BAR ═══════════ */}
      <section className="px-4 py-8" style={{ background: 'var(--color-accent)', color: '#fff' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[['1.480+', 'diários oficiais indexados'], ['9,2 mi', 'licitações no histórico'], ['06h30', 'alerta diário na sua caixa'], ['2018', 'base contínua desde']].map(([num, label]) => (
              <div key={label}>
                <div className="text-2xl sm:text-3xl mb-1" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900 }}>{num}</div>
                <div className="text-xs opacity-80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl sm:text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Como funciona</h2>
          <p className="text-sm mb-12 max-w-md" style={{ color: 'var(--color-neutral-600)' }}>Três passos e o edital certo chega até você.</p>
          <div className="grid sm:grid-cols-3 gap-0" style={{ border: '2px solid var(--color-divider)' }}>
            {steps.map((step, i) => (
              <div key={i} className="p-8" style={{ borderRight: i < 2 ? '2px solid var(--color-divider)' : 'none' }}>
                <div className="text-6xl mb-6" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-accent)', letterSpacing: '-0.02em' }}>{step.number}</div>
                <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-neutral-600)' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BUSCA ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-24" style={{ background: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Busca</h2>
              <p className="text-lg mb-6" style={{ color: 'var(--color-neutral-600)' }}>Operadores de verdade, não uma caixinha de pesquisa.</p>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--color-neutral-600)' }}>Combine termos com E / OU / NÃO, restrinja por UF, órgão, modalidade, valor e situação, e salve a consulta como perfil monitorado.</p>
              <div className="p-4 mb-4" style={{ background: 'var(--color-bg)', border: '2px solid var(--color-divider)', fontFamily: 'monospace', fontSize: 13 }}>
                <span style={{ color: 'var(--color-accent)' }}>(&quot;uniforme&quot; OU &quot;vestuário&quot;)</span><br />
                <span style={{ color: 'var(--color-accent)' }}>E uf:SP,MG E valor:&gt;100000</span><br />
                <span style={{ color: 'var(--color-neutral-600)' }}>NÃO &quot;hospitalar&quot;</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="p-8" style={{ border: '2px solid var(--color-divider)', background: 'var(--color-bg)' }}>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {['UF / município', 'Modalidade', 'Órgão comprador', 'Valor estimado', 'Data de abertura', 'CNAE / objeto', 'Situação', 'Perfis salvos'].map(f => (
                    <div key={f} className="p-2" style={{ border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-600)' }}>{f}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ ALERTAS ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl mb-3" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Alertas</h2>
          <p className="text-lg mb-12" style={{ color: 'var(--color-neutral-600)' }}>O prazo não espera você abrir o sistema.</p>
          <p className="text-sm mb-12 max-w-xl mx-auto" style={{ color: 'var(--color-neutral-600)' }}>Cada perfil salvo vira um alerta com canal e frequência próprios.</p>
          <div className="grid sm:grid-cols-3 gap-0 max-w-2xl mx-auto" style={{ border: '2px solid var(--color-divider)' }}>
            {[
              { icon: <Mail size={20} />, title: 'E-mail diário', desc: 'resumo das 06h30' },
              { icon: <Smartphone size={20} />, title: 'WhatsApp', desc: 'só o que abre em 48h' },
              { icon: <Bell size={20} />, title: 'No app', desc: 'tempo real' },
            ].map((a, i) => (
              <div key={i} className="p-6 text-center" style={{ borderRight: i < 2 ? '2px solid var(--color-divider)' : 'none' }}>
                <div className="mb-3 flex justify-center" style={{ color: 'var(--color-accent)' }}>{a.icon}</div>
                <h3 className="text-sm font-bold mb-1">{a.title}</h3>
                <p className="text-xs" style={{ color: 'var(--color-neutral-600)' }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COVERAGE ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-24" style={{ background: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Cobertura da base</h2>
            <span className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>atualizado em 30/07/2026</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0" style={{ border: '2px solid var(--color-divider)' }}>
            {coverage.map((item, i) => (
              <div key={i} className="p-6" style={{ borderRight: i < 3 ? '2px solid var(--color-divider)' : 'none' }}>
                <item.icon className="w-5 h-5 mb-3" style={{ color: 'var(--color-accent)' }} />
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-text)' }}>{item.label}</h3>
                <p className="text-xs" style={{ color: 'var(--color-neutral-600)' }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PLANS ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl sm:text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Planos</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-neutral-600)' }}>Preço por empresa, usuários ilimitados em todos os planos.</p>

          <div className="flex justify-center mb-10">
            <div className="inline-flex" style={{ border: '2px solid var(--color-text)' }}>
              <button onClick={() => setAnnual(false)} className="px-5 py-2 text-sm font-bold" style={{ background: !annual ? 'var(--color-text)' : 'transparent', color: !annual ? '#fff' : 'var(--color-text)' }}>Mensal</button>
              <button onClick={() => setAnnual(true)} className="px-5 py-2 text-sm font-bold flex items-center gap-1" style={{ background: annual ? 'var(--color-text)' : 'transparent', color: annual ? '#fff' : 'var(--color-text)' }}>
                Anual <span style={{ fontSize: 10, opacity: 0.7 }}>−20%</span>
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-0" style={{ border: '2px solid var(--color-divider)' }}>
            {plans.map((plan, i) => (
              <div key={i} className="p-8 flex flex-col" style={{ borderRight: i < 2 ? '2px solid var(--color-divider)' : 'none', background: plan.highlight ? 'var(--color-bg)' : 'transparent' }}>
                {plan.tag && <Badge variant={plan.highlight ? 'accent' : 'neutral'} className="self-start mb-3">{plan.tag}</Badge>}
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-text)' }}>{plan.name}</h3>
                <div className="mb-4">
                  {plan.price !== null ? (
                    <><span className="text-4xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)' }}>R$ {plan.price}</span><span className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>/mês</span></>
                  ) : (
                    <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{plan.priceLabel}</span>
                  )}
                  {plan.price !== null && <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-500)' }}>{annual ? 'cobrado anualmente' : 'cobrado mensalmente'}</p>}
                  {plan.price === null && <p className="text-xs mt-1" style={{ color: 'var(--color-neutral-500)' }}>contrato anual · nota fiscal e empenho</p>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-neutral-600)' }}>
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />{f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlight ? 'primary' : 'secondary'} size="lg" className="w-full">{plan.cta}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-24" style={{ background: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl mb-10" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Perguntas frequentes</h2>
          <div style={{ border: '2px solid var(--color-divider)' }}>
            {faq.map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="px-4 sm:px-6 lg:px-8 py-24" style={{ background: 'var(--color-accent)' }}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            O edital que você não leu foi vendido por outro.
          </h2>
          <p className="text-base mb-10 opacity-90" style={{ color: '#fff' }}>Comece a monitorar hoje. Configuração em dois minutos, sem instalação.</p>
          <Button size="lg" className="!bg-white !text-[var(--color-accent)] hover:!bg-[var(--color-neutral-100)] !border-white" onClick={() => window.location.href = '/cadastro'}>
            Criar minha conta <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '2px solid var(--color-divider)' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{question}</span>
        <span className="text-lg" style={{ color: 'var(--color-neutral-500)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--color-neutral-600)' }}>{answer}</div>}
    </div>
  );
}

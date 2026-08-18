'use client';

import { MarketingLayout } from '@/components/layout/PageLayout';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Reveal } from '@/components/marketing/Reveal';
import { CountUp } from '@/components/marketing/CountUp';
import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStats, type PublicStats } from '@/lib/api';
import { track } from '@/lib/analytics';

export type LandingVariant = 'generic' | 'comunicacao' | 'tecnologia' | 'saude' | 'construcao' | 'alimentacao' | 'limpeza';

interface LandingConfig {
  eyebrow: string;
  h1: string;
  subcopy: string;
  bids: { title: string; desc: string; organ: string; value: string }[];
  stepOneTitle: string;
  stepOneDesc: string;
  searchTerms: string[];
  searchUfs: string;
  caption: string;
  finalH2: string;
  finalSub: string;
  viaPrefix: string;
}

const CONFIGS: Record<LandingVariant, LandingConfig> = {
  generic: {
    eyebrow: 'Diários oficiais · União, 27 estados, 1.400+ municípios',
    h1: 'Lemos todos os diários oficiais. Você recebe só o que a sua empresa vende.',
    subcopy: 'O Editalis lê os diários oficiais todos os dias, estrutura cada edital e entrega no seu e-mail apenas o que casa com o que você fornece. Sem garimpo em PDF, sem perder prazo.',
    bids: [
      { title: 'Pregão eletrônico 114/2026 · SP', desc: 'Aquisição de equipamentos de informática para a rede municipal de ensino', organ: 'Prefeitura de Campinas', value: 'R$ 2.480.000' },
      { title: 'Dispensa 22/2026 · MG', desc: 'Serviços continuados de manutenção predial', organ: 'Universidade Federal de Minas Gerais', value: 'R$ 386.500' },
    ],
    stepOneTitle: 'Descreva o que você vende',
    stepOneDesc: 'CNAE, palavras-chave, regiões e faixa de valor. O perfil de captação leva dois minutos.',
    searchTerms: ['uniforme', 'vestuário'],
    searchUfs: 'SP,MG',
    caption: '7 dias sem cartão · cancele quando quiser',
    finalH2: 'O edital que você não leu foi vendido por outro.',
    finalSub: 'Comece a monitorar hoje. Configuração em dois minutos, sem instalação.',
    viaPrefix: 'geral',
  },
  comunicacao: {
    eyebrow: 'Monitor de licitações para agências de publicidade e produtoras',
    h1: 'Nunca mais perca um edital de comunicação.',
    subcopy: 'O Editalis varre os diários oficiais todos os dias e entrega na sua caixa só os editais de publicidade, mídia, eventos, conteúdo e marketing — com órgão, prazo, valor e o link direto pro edital. Sem garimpo em PDF, sem deixar concorrência passar.',
    bids: [
      { title: 'Concorrência 03/2026 · DF', desc: 'Serviços de publicidade e propaganda para a administração pública', organ: 'Ministério das Comunicações', value: 'R$ 4.800.000' },
      { title: 'Pregão eletrônico 88/2026 · SP', desc: 'Produção de conteúdo e veiculação de mídia OOH', organ: 'Governo do Estado de São Paulo', value: 'R$ 1.250.000' },
    ],
    stepOneTitle: 'Escolha o seu setor',
    stepOneDesc: 'Comece por Comunicação — publicidade, comunicação digital, live marketing, conteúdo e eventos — e refine com palavras-chave, regiões e faixa de valor. Leva dois minutos.',
    searchTerms: ['publicidade', 'mídia', 'propaganda'],
    searchUfs: 'SP,DF',
    caption: '7 dias sem cartão · comece pelo seu setor (Comunicação, Tecnologia, Saúde e mais)',
    finalH2: 'O edital de comunicação que você não viu virou case de outra agência.',
    finalSub: 'Comece pelo setor de Comunicação e configure seus alertas em dois minutos. O mesmo monitor serve para tecnologia, construção, saúde e outros setores.',
    viaPrefix: 'comunicacao',
  },
  tecnologia: {
    eyebrow: 'Monitor de licitações para empresas de tecnologia e TI',
    h1: 'Nunca mais perca um edital de tecnologia.',
    subcopy: 'O Editalis varre os diários oficiais todos os dias e entrega na sua caixa só os editais de software, cloud, dados, infraestrutura e equipamentos de TI — com órgão, prazo e valor. Sem garimpo em PDF, sem deixar concorrência passar.',
    bids: [
      { title: 'Pregão eletrônico 72/2026 · DF', desc: 'Licenciamento de software e serviços de computação em nuvem', organ: 'Ministério da Gestão', value: 'R$ 3.200.000' },
      { title: 'Concorrência 15/2026 · SP', desc: 'Equipamentos de informática e infraestrutura de datacenter', organ: 'Governo do Estado de São Paulo', value: 'R$ 980.000' },
    ],
    stepOneTitle: 'Escolha o seu setor',
    stepOneDesc: 'Comece por Tecnologia — software, cloud, dados, infraestrutura — e refine com palavras-chave, regiões e faixa de valor. Leva dois minutos.',
    searchTerms: ['software', 'cloud', 'dados'],
    searchUfs: 'SP,DF',
    caption: '7 dias sem cartão · comece pelo setor de Tecnologia',
    finalH2: 'Nunca mais perca um edital de tecnologia.',
    finalSub: 'Comece pelo setor de Tecnologia e configure seus alertas em dois minutos. O mesmo monitor serve para comunicação, saúde e outros setores.',
    viaPrefix: 'tecnologia',
  },
  saude: {
    eyebrow: 'Monitor de licitações para saúde, hospitais e laboratórios',
    h1: 'Nunca mais perca um edital de saúde.',
    subcopy: 'O Editalis varre os diários oficiais todos os dias e entrega na sua caixa só os editais de medicamentos, equipamentos hospitalares, laboratório e serviços de saúde — com órgão, prazo e valor. Sem garimpo em PDF, sem deixar concorrência passar.',
    bids: [
      { title: 'Pregão eletrônico 210/2026 · MG', desc: 'Fornecimento de medicamentos e insumos hospitalares', organ: 'Secretaria de Saúde de Minas Gerais', value: 'R$ 5.400.000' },
      { title: 'Concorrência 08/2026 · RS', desc: 'Equipamentos de imagem e diagnóstico', organ: 'Hospital de Clínicas de Porto Alegre', value: 'R$ 2.100.000' },
    ],
    stepOneTitle: 'Escolha o seu setor',
    stepOneDesc: 'Comece por Saúde — medicamentos, hospitalar, laboratório — e refine com palavras-chave, regiões e faixa de valor. Leva dois minutos.',
    searchTerms: ['medicamentos', 'hospitalar', 'laboratório'],
    searchUfs: 'MG,RS',
    caption: '7 dias sem cartão · comece pelo setor de Saúde',
    finalH2: 'Nunca mais perca um edital de saúde.',
    finalSub: 'Comece pelo setor de Saúde e configure seus alertas em dois minutos. O mesmo monitor serve para tecnologia, comunicação e outros setores.',
    viaPrefix: 'saude',
  },
  construcao: {
    eyebrow: 'Monitor de licitações para construtoras e engenharia',
    h1: 'Nunca mais perca uma obra pública.',
    subcopy: 'O Editalis varre os diários oficiais todos os dias e entrega na sua caixa só os editais de obras, infraestrutura, engenharia e manutenção predial — com órgão, prazo e valor. Sem garimpo em PDF, sem deixar concorrência passar.',
    bids: [
      { title: 'Concorrência 44/2026 · SP', desc: 'Obras de pavimentação e drenagem urbana', organ: 'Prefeitura de São Paulo', value: 'R$ 12.500.000' },
      { title: 'Pregão eletrônico 90/2026 · DF', desc: 'Manutenção predial e serviços de engenharia', organ: 'Ministério da Infraestrutura', value: 'R$ 3.700.000' },
    ],
    stepOneTitle: 'Escolha o seu setor',
    stepOneDesc: 'Comece por Construção — obras, infraestrutura, engenharia — e refine com palavras-chave, regiões e faixa de valor. Leva dois minutos.',
    searchTerms: ['obras', 'pavimentação', 'infraestrutura'],
    searchUfs: 'SP,DF',
    caption: '7 dias sem cartão · comece pelo setor de Construção',
    finalH2: 'Nunca mais perca uma obra pública.',
    finalSub: 'Comece pelo setor de Construção e configure seus alertas em dois minutos. O mesmo monitor serve para saúde, tecnologia e outros setores.',
    viaPrefix: 'construcao',
  },
  alimentacao: {
    eyebrow: 'Monitor de licitações para alimentação e distribuidoras',
    h1: 'Nunca mais perca um edital de alimentação.',
    subcopy: 'O Editalis varre os diários oficiais todos os dias e entrega na sua caixa só os editais de gêneros alimentícios, merenda escolar, refeições e distribuição — com órgão, prazo e valor. Sem garimpo em PDF, sem deixar concorrência passar.',
    bids: [
      { title: 'Pregão eletrônico 33/2026 · SP', desc: 'Fornecimento de gêneros alimentícios para merenda escolar', organ: 'Prefeitura de Campinas', value: 'R$ 6.800.000' },
      { title: 'Concorrência 12/2026 · RJ', desc: 'Serviços de alimentação e refeições terceirizadas', organ: 'Universidade Federal do Rio de Janeiro', value: 'R$ 2.900.000' },
    ],
    stepOneTitle: 'Escolha o seu setor',
    stepOneDesc: 'Comece por Alimentação — gêneros alimentícios, merenda, refeições — e refine com palavras-chave, regiões e faixa de valor. Leva dois minutos.',
    searchTerms: ['alimentos', 'merenda', 'refeições'],
    searchUfs: 'SP,RJ',
    caption: '7 dias sem cartão · comece pelo setor de Alimentação',
    finalH2: 'Nunca mais perca um edital de alimentação.',
    finalSub: 'Comece pelo setor de Alimentação e configure seus alertas em dois minutos. O mesmo monitor serve para saúde, construção e outros setores.',
    viaPrefix: 'alimentacao',
  },
  limpeza: {
    eyebrow: 'Monitor de licitações para limpeza, conservação e facilities',
    h1: 'Nunca mais perca um edital de facilities.',
    subcopy: 'O Editalis varre os diários oficiais todos os dias e entrega na sua caixa só os editais de limpeza, conservação, vigilância, portaria e serviços gerais — com órgão, prazo e valor. Sem garimpo em PDF, sem deixar concorrência passar.',
    bids: [
      { title: 'Pregão eletrônico 55/2026 · DF', desc: 'Serviços de limpeza, conservação e asseio', organ: 'Ministério da Economia', value: 'R$ 1.600.000' },
      { title: 'Concorrência 19/2026 · SP', desc: 'Vigilância patrimonial e serviços de portaria', organ: 'Tribunal de Justiça de São Paulo', value: 'R$ 2.300.000' },
    ],
    stepOneTitle: 'Escolha o seu setor',
    stepOneDesc: 'Comece por Limpeza & Facilities — limpeza, vigilância, portaria — e refine com palavras-chave, regiões e faixa de valor. Leva dois minutos.',
    searchTerms: ['limpeza', 'vigilância', 'conservação'],
    searchUfs: 'DF,SP',
    caption: '7 dias sem cartão · comece pelo setor de Facilities',
    finalH2: 'Nunca mais perca um edital de facilities.',
    finalSub: 'Comece pelo setor de Limpeza & Facilities e configure seus alertas em dois minutos. O mesmo monitor serve para construção, saúde e outros setores.',
    viaPrefix: 'limpeza',
  },
};

const alerts = [
  { label: 'E-mail diário', detail: 'resumo das 06h30' },
  { label: 'WhatsApp', detail: 'só o que abre em 48h' },
  { label: 'No app', detail: 'tempo real' },
];

const coverage = [
  { label: 'Diário Oficial da União', detail: 'seções 1 e 3, desde 2018' },
  { label: '27 diários estaduais', detail: 'cobertura integral' },
  { label: '1.412 diários municipais', detail: 'capitais e regiões metropolitanas' },
  { label: 'Portais de compras', detail: 'conciliação de status e itens' },
];

const eyebrow = 'text-[11px] font-bold uppercase';
const eyebrowStyle = { letterSpacing: '0.18em' };
const sectionTitle = 'font-black leading-[1.02]';
const sectionTitleStyle = { fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', color: 'var(--color-text)' };

export function LandingPage({ variant }: { variant: LandingVariant }) {
  const cfg = CONFIGS[variant];
  const [annual, setAnnual] = useState(false);
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  const todayCount = stats?.articles_today?.toLocaleString('pt-BR') ?? '1.284';
  const lastSync = stats?.last_sync_at
    ? new Date(stats.last_sync_at).toLocaleDateString('pt-BR')
    : '10/08/2026';

  const goCadastro = (position: string) => {
    track('landing_cta_clicked', { position, landing: variant });
    window.location.href = `/login?tab=cadastro&via=${cfg.viaPrefix}-${position}`;
  };

  const steps = [
    { number: '01', title: cfg.stepOneTitle, description: cfg.stepOneDesc },
    { number: '02', title: 'A base cruza tudo à noite', description: 'Cada publicação é lida, classificada por objeto e ligada ao órgão comprador.' },
    { number: '03', title: 'Você recebe e decide', description: 'E-mail às 06h30, WhatsApp para urgências e o painel com prazos e favoritas.' },
  ];

  type StatItem = { label: string } & ({ value: string } | { count: number; suffix?: string });
  const statsItems: StatItem[] = [
    { count: 1480, suffix: '+', label: 'diários oficiais indexados' },
    { count: stats?.total_articles ?? 30850, label: 'licitações na base' },
    { value: '06h30', label: 'alerta diário na sua caixa' },
    { value: '2018', label: 'base contínua desde' },
  ];

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
    <MarketingLayout>
      <div className="mx-auto max-w-7xl px-5 sm:px-10">
        {/* ═══════════ HERO ═══════════ */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-10 lg:gap-16 pt-14 sm:pt-16 lg:pt-[88px] pb-12 lg:pb-16"
          style={{ borderBottom: '2px solid var(--color-text)' }}
        >
          <div>
            <Reveal delay={0} className={`${eyebrow} mb-6 lg:mb-7`} style={{ ...eyebrowStyle, color: 'var(--color-accent-700)' }}>
              {cfg.eyebrow}
            </Reveal>
            <Reveal delay={70}>
              <h1
                className="text-[40px] sm:text-[56px] lg:text-[76px] leading-[0.94] tracking-[-0.035em] mb-6 lg:mb-7 text-wrap-pretty"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--color-text)' }}
              >
                {cfg.h1}
              </h1>
            </Reveal>
            <Reveal delay={140} className="text-base sm:text-[19px] leading-[1.5] max-w-[560px] mb-8 lg:mb-9" style={{ color: 'var(--color-neutral-800)' }}>
              {cfg.subcopy}
            </Reveal>
            <Reveal delay={210} className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => goCadastro('hero')}
                className="inline-flex items-center gap-2 text-base font-bold py-4 px-7 cursor-pointer"
                style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
              >
                Começar teste grátis <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.getElementById('produto')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-base font-bold py-4 px-7 cursor-pointer"
                style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
              >
                Ver a plataforma
              </button>
            </Reveal>
            <Reveal delay={280} className="mt-5 text-[13px]" style={{ color: 'var(--color-neutral-600)' }}>{cfg.caption}</Reveal>
          </div>

          <Reveal delay={280} className="self-end" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}>
            <div
              className="py-3 px-4 text-[11px] font-bold uppercase"
              style={{ letterSpacing: '0.14em', background: 'var(--color-text)', color: 'var(--color-neutral-100)' }}
            >
              Publicado hoje
            </div>
            {cfg.bids.map((bid, i) => (
              <div key={i} className="py-5 px-4" style={{ borderBottom: '1px solid var(--color-neutral-300)' }}>
                <div className="text-[11px] font-bold uppercase mb-0" style={{ letterSpacing: '0.1em', color: 'var(--color-neutral-600)' }}>{bid.title}</div>
                <div className="text-[17px] font-bold my-1.5 leading-[1.25]" style={{ color: 'var(--color-text)' }}>{bid.desc}</div>
                <div className="flex justify-between text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>
                  <span>{bid.organ}</span>
                  <span className="font-bold" style={{ color: 'var(--color-text)' }}>{bid.value}</span>
                </div>
              </div>
            ))}
            <div className="anim-pulse py-3.5 px-4 text-[13px] font-bold" style={{ background: 'var(--color-accent)', color: '#fff' }}>
              + {todayCount} publicações nas últimas 24h
            </div>
          </Reveal>
        </div>

        {/* ═══════════ STATS ═══════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ borderBottom: '2px solid var(--color-text)' }}>
          {statsItems.map((item, i) => (
            <Reveal
              key={item.label}
              delay={i * 70}
              className={`py-8 ${i === 0 ? 'pr-4 lg:pr-6 pl-0' : i === statsItems.length - 1 ? 'pl-4 lg:pl-6 pr-0' : 'px-4 lg:px-6'}`}
              style={{ borderRight: i < statsItems.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
            >
              <div className="text-[32px] sm:text-[44px] font-black leading-none tracking-[-0.03em]" style={{ color: 'var(--color-text)' }}>
                {'count' in item ? <CountUp target={item.count} suffix={item.suffix} /> : item.value}
              </div>
              <div className="text-[13px] mt-1.5" style={{ color: 'var(--color-neutral-700)' }}>{item.label}</div>
            </Reveal>
          ))}
        </div>

        {/* ═══════════ PRODUTO: COMO FUNCIONA + BUSCA/ALERTAS ═══════════ */}
        <div id="produto" className="pt-14 lg:pt-[72px]">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-16 pb-10 lg:pb-14">
            <div>
              <Reveal delay={0} className={eyebrow} style={{ ...eyebrowStyle, color: 'var(--color-accent-700)' }}>Como funciona</Reveal>
              <Reveal delay={60}>
                <h2 className={`${sectionTitle} text-[32px] sm:text-[40px] mt-4`} style={sectionTitleStyle}>Três passos e o edital certo chega até você.</h2>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3" style={{ borderTop: '2px solid var(--color-text)' }}>
              {steps.map((step, i) => (
                <Reveal key={i} delay={i * 80} className="py-7 px-6 first:pl-0 last:pr-0" style={{ borderRight: i < steps.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                  <div className="text-[13px] font-black" style={{ color: 'var(--color-accent)' }}>{step.number}</div>
                  <div className="text-[19px] font-extrabold mt-2.5 mb-2 leading-[1.2]" style={{ color: 'var(--color-text)' }}>{step.title}</div>
                  <p className="text-sm leading-[1.55]" style={{ color: 'var(--color-neutral-700)' }}>{step.description}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 py-10 lg:py-14" style={{ borderTop: '2px solid var(--color-text)' }}>
            <Reveal delay={0}>
              <div className={eyebrow} style={{ ...eyebrowStyle, color: 'var(--color-neutral-600)' }}>Busca</div>
              <h3 className="text-[26px] sm:text-[32px] font-black tracking-[-0.025em] mt-3 mb-4 leading-[1.05]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                Operadores de verdade, não uma caixinha de pesquisa.
              </h3>
              <p className="text-base leading-[1.6] mb-5" style={{ color: 'var(--color-neutral-800)' }}>
                Combine termos com E / OU / NÃO, restrinja por UF, órgão, modalidade, valor e situação, e salve a consulta como perfil monitorado.
              </p>
              <div className="p-4" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)', fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 14, lineHeight: 1.7 }}>
                <span style={{ color: 'var(--color-accent-700)', fontWeight: 700 }}>({cfg.searchTerms.map((t) => `"${t}"`).join(' OU ')})</span><br />
                <span style={{ fontWeight: 700 }}>E</span> uf:{cfg.searchUfs} <span style={{ fontWeight: 700 }}>E</span> valor:&gt;100000<br />
                <span style={{ fontWeight: 700 }}>NÃO</span> &quot;hospitalar&quot;
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className={eyebrow} style={{ ...eyebrowStyle, color: 'var(--color-neutral-600)' }}>Alertas</div>
              <h3 className="text-[26px] sm:text-[32px] font-black tracking-[-0.025em] mt-3 mb-4 leading-[1.05]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                O prazo não espera você abrir o sistema.
              </h3>
              <p className="text-base leading-[1.6] mb-5" style={{ color: 'var(--color-neutral-800)' }}>
                Cada perfil salvo vira um alerta com canal e frequência próprios.
              </p>
              <div style={{ borderTop: '1px solid var(--color-divider)' }}>
                {alerts.map((a, i) => (
                  <div
                    key={a.label}
                    className="flex justify-between py-3.5 text-[15px]"
                    style={{ borderBottom: i < alerts.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
                  >
                    <span className="font-bold" style={{ color: 'var(--color-text)' }}>{a.label}</span>
                    <span style={{ color: 'var(--color-neutral-700)' }}>{a.detail}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ═══════════ COBERTURA ═══════════ */}
        <div id="cobertura" className="py-10 lg:py-14" style={{ borderTop: '2px solid var(--color-text)' }}>
          <Reveal delay={0} className="flex flex-wrap items-baseline justify-between gap-2 mb-7">
            <h2 className={`${sectionTitle} text-[32px] sm:text-[40px]`} style={sectionTitleStyle}>Cobertura da base</h2>
            <span className="text-[13px]" style={{ color: 'var(--color-neutral-600)' }}>atualizado em {lastSync}</span>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ borderTop: '2px solid var(--color-text)' }}>
            {coverage.map((item, i) => (
              <Reveal key={i} delay={i * 70} className="py-6 px-6 first:pl-0 last:pr-0" style={{ borderRight: i < coverage.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                <div className="text-[15px] font-extrabold" style={{ color: 'var(--color-text)' }}>{item.label}</div>
                <p className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-700)' }}>{item.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ═══════════ PLANOS ═══════════ */}
        <div id="planos" className="py-10 lg:py-14" style={{ borderTop: '2px solid var(--color-text)' }}>
          <Reveal delay={0} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className={`${sectionTitle} text-[32px] sm:text-[40px] mb-2.5`} style={sectionTitleStyle}>Planos</h2>
              <p className="text-base" style={{ color: 'var(--color-neutral-700)' }}>Preço por empresa, usuários ilimitados em todos os planos.</p>
            </div>
            <SegmentedControl
              className="self-start"
              options={[
                { value: 'monthly', label: 'Mensal' },
                { value: 'annual', label: 'Anual −20%' },
              ]}
              value={annual ? 'annual' : 'monthly'}
              onChange={(v) => setAnnual(v === 'annual')}
            />
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ borderTop: '2px solid var(--color-text)', borderBottom: '2px solid var(--color-text)' }}>
            {plans.map((plan, i) => (
              <Reveal
                key={i}
                delay={i * 100}
                className="relative flex flex-col py-8 px-7 first:pl-0 last:pr-0"
                style={{ borderRight: i < plans.length - 1 ? '1px solid var(--color-divider)' : 'none', background: plan.highlight ? 'var(--color-neutral-100)' : 'transparent' }}
              >
                {plan.highlight && <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'var(--color-accent)' }} />}
                <div className={eyebrow} style={{ letterSpacing: '0.16em', color: plan.highlight ? 'var(--color-accent-700)' : 'var(--color-neutral-600)' }}>{plan.tag}</div>
                <div className="text-2xl font-black mt-3 mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{plan.name}</div>
                <div className="flex items-baseline gap-1.5 mt-3 mb-1">
                  {plan.price !== null ? (
                    <>
                      <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>R$</span>
                      <span className="text-[54px] font-black leading-none tracking-[-0.04em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{plan.price}</span>
                      <span className="text-[15px]" style={{ color: 'var(--color-neutral-700)' }}>/mês</span>
                    </>
                  ) : (
                    <span className="text-[40px] font-black leading-[1.35] tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{plan.priceLabel}</span>
                  )}
                </div>
                <p className="text-[13px] mb-6" style={{ color: 'var(--color-neutral-600)' }}>
                  {plan.price !== null ? (annual ? 'cobrado anualmente' : 'cobrado mensalmente') : 'contrato anual · nota fiscal e empenho'}
                </p>
                <div className="text-sm leading-[1.5] flex-1" style={{ borderTop: '1px solid var(--color-divider)' }}>
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 py-3" style={{ borderBottom: j < plan.features.length - 1 ? '1px solid var(--color-divider)' : 'none', color: 'var(--color-neutral-700)' }}>
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />{f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={plan.highlight ? () => goCadastro('planos') : undefined}
                  className="mt-7 w-full text-left py-3.5 px-5 text-[15px] font-bold cursor-pointer"
                  style={plan.highlight
                    ? { background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }
                    : { background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
                >
                  {plan.cta}
                </button>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ═══════════ LOGOS ═══════════ */}
        <div className="py-10 lg:py-12" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <Reveal delay={0} className={`${eyebrow} mb-6`} style={{ ...eyebrowStyle, color: 'var(--color-neutral-600)' }}>
            Usado por equipes de captação em
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Reveal
                key={i}
                delay={i * 50}
                className="h-14 flex items-center justify-center text-[13px] font-bold"
                style={{ letterSpacing: '0.1em', border: '1px solid var(--color-neutral-400)', color: 'var(--color-neutral-500)' }}
              >
                LOGO
              </Reveal>
            ))}
          </div>
        </div>

        {/* ═══════════ FAQ ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-16 py-10 lg:py-14">
          <Reveal delay={0}>
            <h2 className={`${sectionTitle} text-[32px] sm:text-[40px]`} style={sectionTitleStyle}>Perguntas frequentes</h2>
          </Reveal>
          <div style={{ borderTop: '2px solid var(--color-text)' }}>
            {faq.map((item, i) => (
              <Reveal key={i} delay={i * 60} className="py-[22px]" style={{ borderBottom: i < faq.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                <div className="text-[17px] font-extrabold mb-1.5" style={{ color: 'var(--color-text)' }}>{item.q}</div>
                <p className="text-[15px] leading-[1.55]" style={{ color: 'var(--color-neutral-700)' }}>{item.a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section style={{ background: 'var(--color-accent)', color: '#fff' }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-10 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 lg:items-end">
          <Reveal delay={0}>
            <h2 className="text-[36px] sm:text-[52px] lg:text-[64px] font-black leading-[0.98] tracking-[-0.035em]" style={{ fontFamily: 'var(--font-heading)' }}>
              {cfg.finalH2}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-[17px] leading-[1.5] mb-6" style={{ color: '#ffe0d9' }}>{cfg.finalSub}</p>
            <button
              onClick={() => goCadastro('final')}
              className="inline-flex items-center gap-2 text-base font-extrabold py-4 px-7 text-left cursor-pointer"
              style={{ background: '#fff', border: '2px solid #fff', color: 'var(--color-accent-700)' }}
            >
              Criar minha conta <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}

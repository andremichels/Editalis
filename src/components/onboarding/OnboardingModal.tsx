'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { track } from '@/lib/analytics';

const STORAGE_KEY = 'editalis_onboarding_seen';

const TIPS: { icon: string; title: string; description: string }[] = [
  {
    icon: '🧠',
    title: 'Busca inteligente',
    description: 'Digite em linguagem natural — "obras em SP acima de 1 milhão" — e a gente monta os filtros pra você.',
  },
  {
    icon: '✨',
    title: 'Busca semântica',
    description: 'Encontra publicações pelo significado, não só pela palavra exata — útil quando você não sabe o termo técnico certo.',
  },
  {
    icon: '🔔',
    title: 'Alertas',
    description: 'Salve um perfil de busca e receba por e-mail sempre que sair uma nova publicação que combine com ele.',
  },
  {
    icon: '★',
    title: 'Favoritos',
    description: 'Marque licitações pra acompanhar de perto — ficam reunidas em Favoritas, sincronizadas entre seus dispositivos.',
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {}
  }, []);

  const dismiss = (reason: 'completed' | 'skipped') => {
    track(reason === 'completed' ? 'onboarding_completed' : 'onboarding_skipped');
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={() => dismiss('skipped')}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--color-bg)', border: '2px solid var(--color-text)' }}
      >
        <div className="p-8" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className="text-[11px] font-bold uppercase mb-2" style={{ letterSpacing: '0.14em', color: 'var(--color-accent)' }}>
            Bem-vindo(a)
          </div>
          <h2 className="text-[28px] font-black tracking-[-0.03em] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Comece por aqui
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-neutral-700)' }}>
            4 recursos que valem a pena conhecer antes de sair buscando.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {TIPS.map((tip, i) => (
            <div
              key={tip.title}
              className="p-6"
              style={{
                borderBottom: i < TIPS.length - 2 ? '1px solid var(--color-divider)' : undefined,
                borderRight: i % 2 === 0 ? '1px solid var(--color-divider)' : undefined,
              }}
            >
              <div className="text-2xl mb-2">{tip.icon}</div>
              <div className="text-[15px] font-extrabold mb-1.5">{tip.title}</div>
              <p className="text-[13px] leading-[1.55]" style={{ color: 'var(--color-neutral-700)' }}>
                {tip.description}
              </p>
            </div>
          ))}
        </div>

        <div className="p-6 flex items-center justify-between" style={{ borderTop: '2px solid var(--color-text)' }}>
          <button
            onClick={() => dismiss('skipped')}
            className="text-[13px] font-bold cursor-pointer"
            style={{ color: 'var(--color-neutral-600)' }}
          >
            Pular
          </button>
          <Button onClick={() => dismiss('completed')}>Começar a buscar →</Button>
        </div>
      </div>
    </div>
  );
}

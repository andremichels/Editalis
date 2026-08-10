'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { Check, ArrowRight } from 'lucide-react';

const PLAN_LABELS: Record<string, string> = {
  essencial: 'Essencial',
  profissional: 'Profissional',
};

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get('plan') || 'profissional';
  const planLabel = PLAN_LABELS[plan] || 'Profissional';
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-bg)' }}>
      <div className="text-center max-w-md px-6 py-14">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ background: '#d4edda' }}>
          <Check className="w-8 h-8" style={{ color: '#155724' }} />
        </div>
        <h1 className="text-[28px] font-black tracking-[-0.03em] mb-3"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
          Assinatura ativa!
        </h1>
        <p className="text-base mb-1" style={{ color: 'var(--color-neutral-700)' }}>
          Seu plano <b style={{ color: 'var(--color-text)' }}>{planLabel}</b> está ativo.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--color-neutral-500)' }}>
          Você tem 7 dias de teste grátis. A cobrança só começa depois.
        </p>

        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-bold cursor-pointer"
          style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
        >
          Ir para o painel <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs mt-4" style={{ color: 'var(--color-neutral-400)' }}>
          Redirecionando em {countdown}s...
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full skeleton" />
          <div className="h-8 w-48 mx-auto skeleton mb-3" />
          <div className="h-4 w-64 mx-auto skeleton" />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/analytics';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-[28px] font-black tracking-[-0.03em] mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
          Algo deu errado
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-neutral-700)' }}>
          A gente já foi notificado. Tenta de novo, ou volta pro painel se o problema continuar.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => unstable_retry()}
            className="py-3 px-5 text-sm font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            Tentar novamente
          </button>
          <a
            href="/dashboard"
            className="py-3 px-5 text-sm font-bold no-underline"
            style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
          >
            Ir para o painel
          </a>
        </div>
      </div>
    </div>
  );
}

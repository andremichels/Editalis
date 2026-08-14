'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/analytics';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    captureException(error, { digest: error.digest, boundary: 'global' });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: '#f3f2f2', color: '#201e1d', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
              Algo deu muito errado
            </h1>
            <p style={{ fontSize: 14, color: '#605d5d', margin: '0 0 32px' }}>
              A gente já foi notificado. Tenta recarregar a página.
            </p>
            <button
              onClick={() => unstable_retry()}
              style={{
                background: '#ec3013',
                border: '2px solid #ec3013',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 20px',
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

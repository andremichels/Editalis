'use client';

import { useEffect, useState } from 'react';

interface LoadingProgressProps {
  /** Mensagens que rotacionam enquanto carrega. */
  messages: string[];
  /** Intervalo entre mensagens em ms (default 2400). */
  intervalMs?: number;
}

export function LoadingProgress({ messages, intervalMs = 2400 }: LoadingProgressProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), intervalMs);
    return () => clearInterval(t);
  }, [messages, intervalMs]);

  const current = messages[idx] ?? '';

  return (
    <div className="w-full max-w-sm" role="status" aria-live="polite">
      <div className="ed-progress mb-6" role="progressbar" aria-label="Carregando" />
      <p
        key={idx}
        className="ed-copy-fade text-[15px] font-bold text-center"
        style={{ color: 'var(--color-neutral-600)' }}
      >
        {current}
      </p>
    </div>
  );
}

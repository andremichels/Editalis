'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { authFetch } from '@/lib/api';
import { useNotificationStatus } from '@/lib/notifications';
import { refreshAlerts, type AlertSummary } from '@/lib/useAccount';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

/**
 * Aparece quando há alertas ativos e nenhum deles avisa fora do app.
 * "Ativar e-mail diário" passa esses alertas para o e-mail e liga o padrão da conta.
 */
export function SilentAlertsBanner({ alerts }: { alerts: AlertSummary[] | null }) {
  const { status } = useNotificationStatus();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(false);

  const active = (alerts ?? []).filter((a) => a.enabled);
  const silent = active.length > 0 && active.every((a) => (a.channel ?? 'app') === 'app');
  if (hidden || !status || !silent) return null;
  const emailOk = status.email.available;
  const waOk = status.whatsapp.available && status.whatsapp.verify_available;
  if (!emailOk && !waOk) return null; // nenhum canal ligado no servidor: nada a oferecer

  const enableEmail = async () => {
    setBusy(true);
    try {
      const put = (url: string, body: unknown) =>
        authFetch(`${API_BASE}${url}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const results = await Promise.all([
        ...active.map((a) => put(`/api/v1/alerts/${a.id}`, { channel: 'email' })),
        put('/api/v1/account/notification-defaults', { ...status.defaults, email_diario: true }),
      ]);
      if (results.some((r) => !r.ok)) throw new Error();
      toast('Pronto: o resumo diário chega às 6h30', 'success');
      setHidden(true);
      refreshAlerts();
    } catch {
      toast('Não deu para ativar agora. Tente pela tela Alertas.', 'error');
    }
    setBusy(false);
  };

  return (
    <section
      role="status"
      className="mt-6 mx-4 sm:mx-12 flex flex-wrap items-center justify-between gap-4 py-4 px-5"
      style={{ border: '2px solid var(--color-accent)', background: '#fde3dc' }}
    >
      <div className="min-w-0">
        <p className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>Seus alertas não estão avisando ninguém.</p>
        <p className="text-[13px]" style={{ color: 'var(--color-text)' }}>
          {active.length === 1 ? 'O alerta ativo só aparece' : `Os ${active.length} alertas ativos só aparecem`} aqui no Editalis.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {emailOk ? (
          <button type="button" onClick={enableEmail} disabled={busy} className="h-11 px-4 text-[14px] font-bold cursor-pointer disabled:opacity-60" style={{ background: 'var(--color-text)', color: '#fff', border: 0 }}>
            {busy ? 'Ativando…' : 'Ativar e-mail diário às 6h30'}
          </button>
        ) : (
          <Link href="/perfil" className="h-11 px-4 inline-flex items-center text-[14px] font-bold hover:no-underline" style={{ background: 'var(--color-text)', color: '#fff' }}>
            Configurar WhatsApp
          </Link>
        )}
        <button type="button" onClick={() => setHidden(true)} className="h-11 px-3 text-[13px] font-semibold underline cursor-pointer" style={{ color: 'var(--color-text)' }}>
          Agora não
        </button>
      </div>
    </section>
  );
}

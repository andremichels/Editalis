'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';
import {
  removeWhatsapp,
  sendTestNotification,
  startWhatsapp,
  useNotificationStatus,
  verifyWhatsapp,
} from '@/lib/notifications';

const fieldStyle = { border: '1px solid var(--color-text)', background: '#fff', color: 'var(--color-text)' };
const btnDark = { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: '#fff' };
const btnLine = { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' };

/**
 * Canais de aviso da conta: e-mail (endereço de acesso) e WhatsApp (número
 * confirmado por código). O canal de cada alerta é escolhido na tela Alertas.
 */
export function NotificationChannels() {
  const { status, reload } = useNotificationStatus();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'idle' | 'code'>('idle');
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>, ok: string, after?: () => void) => {
    setBusy(true);
    try {
      await fn();
      toast(ok, 'success');
      after?.();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não deu certo', 'error');
    }
    setBusy(false);
  };

  if (!status) return <div className="h-24 skeleton mt-4" />;
  const wa = status.whatsapp;

  return (
    <div className="flex flex-col gap-5 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 py-3" style={{ borderBottom: '1px solid var(--color-line)' }}>
        <div className="min-w-0">
          <p className="text-[14px] font-bold">E-mail</p>
          <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>
            {status.email.available ? `Resumo diário às 6h30 em ${status.email.address ?? 'seu e-mail'}` : 'O envio de e-mail ainda não está ativo no Editalis.'}
          </p>
        </div>
        {status.email.available && (
          <button type="button" disabled={busy} onClick={() => run(() => sendTestNotification('email'), 'E-mail de teste enviado')} className="h-10 px-3.5 text-[13px] font-bold cursor-pointer disabled:opacity-50" style={btnLine}>
            Enviar teste
          </button>
        )}
      </div>

      <div className="py-3" style={{ borderBottom: '1px solid var(--color-line)' }}>
        <p className="text-[14px] font-bold">WhatsApp</p>
        {!wa.available || !wa.verify_available ? (
          <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>O aviso por WhatsApp ainda não está ativo no Editalis.</p>
        ) : wa.verified ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>Avisos na hora para <strong style={{ color: 'var(--color-text)' }}>{wa.phone}</strong></p>
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={() => run(() => sendTestNotification('whatsapp'), 'Mensagem de teste enviada')} className="h-10 px-3.5 text-[13px] font-bold cursor-pointer disabled:opacity-50" style={btnLine}>
                Enviar teste
              </button>
              <button type="button" disabled={busy} onClick={() => run(removeWhatsapp, 'Número removido', reload)} className="h-10 px-3 text-[13px] font-semibold underline cursor-pointer" style={{ color: 'var(--color-muted)' }}>
                Remover número
              </button>
            </div>
          </div>
        ) : step === 'code' ? (
          <form
            className="flex flex-wrap items-end gap-2 mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => verifyWhatsapp(code), 'Número confirmado', () => { setStep('idle'); setCode(''); reload(); });
            }}
          >
            <label className="flex flex-col gap-1 text-[13px] font-bold">
              Código recebido no WhatsApp
              <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={8} className="h-11 w-36 px-3 text-[16px] font-normal tracking-[0.2em]" style={fieldStyle} />
            </label>
            <button type="submit" disabled={busy || code.length < 4} className="h-11 px-4 text-[14px] font-bold cursor-pointer disabled:opacity-50" style={btnDark}>Confirmar</button>
            <button type="button" onClick={() => setStep('idle')} className="h-11 px-3 text-[13px] font-semibold underline cursor-pointer" style={{ color: 'var(--color-muted)' }}>Trocar número</button>
          </form>
        ) : (
          <form
            className="flex flex-wrap items-end gap-2 mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => startWhatsapp(phone), 'Código enviado pelo WhatsApp', () => setStep('code'));
            }}
          >
            <label className="flex flex-col gap-1 text-[13px] font-bold">
              Seu número com DDD
              <input value={phone || wa.phone || ''} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" placeholder="(11) 91234-5678" className="h-11 w-56 px-3 text-[15px] font-normal" style={fieldStyle} />
            </label>
            <button type="submit" disabled={busy || !(phone || wa.phone)} className="h-11 px-4 text-[14px] font-bold cursor-pointer disabled:opacity-50" style={btnDark}>Enviar código</button>
            <p className="w-full text-[12px]" style={{ color: 'var(--color-muted)' }}>Mandamos um código pelo WhatsApp para confirmar que o número é seu.</p>
          </form>
        )}
      </div>
    </div>
  );
}

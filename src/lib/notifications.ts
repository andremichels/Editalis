'use client';

import { useEffect, useState } from 'react';
import { authFetch } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

export type AlertChannel = 'email' | 'whatsapp' | 'app';

export interface NotificationStatus {
  email: { available: boolean; address: string | null };
  whatsapp: { available: boolean; verify_available: boolean; phone: string | null; verified: boolean };
  defaults: { email_diario: boolean; whatsapp_48h: boolean; notificacao_app: boolean };
}

export const CHANNEL_LABELS: Record<AlertChannel, string> = {
  email: 'No resumo diário por e-mail, às 6h30',
  whatsapp: 'Na hora, por WhatsApp',
  app: 'Só aqui no Editalis',
};

/** Erro da API (`detail`) como texto para o toast. */
async function errorText(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body?.detail === 'string' ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

async function post(path: string, body?: unknown, method = 'POST'): Promise<void> {
  const res = await authFetch(`${API_BASE}/api/v1${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorText(res, 'Não deu certo. Tente de novo.'));
}

export async function getNotificationStatus(): Promise<NotificationStatus | null> {
  try {
    const res = await authFetch(`${API_BASE}/api/v1/account/notifications`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export const startWhatsapp = (phone: string) => post('/account/whatsapp/start', { phone });
export const verifyWhatsapp = (code: string) => post('/account/whatsapp/verify', { code });
export const removeWhatsapp = () => post('/account/whatsapp', undefined, 'DELETE');
export const sendTestNotification = (channel: 'email' | 'whatsapp') => post('/account/notifications/test', { channel });

/** Estado dos canais, recarregável (`reload`) depois de confirmar/remover o número. */
export function useNotificationStatus() {
  const [status, setStatus] = useState<NotificationStatus | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true;
    getNotificationStatus().then((s) => alive && setStatus(s));
    return () => {
      alive = false;
    };
  }, [version]);
  return { status, reload: () => setVersion((v) => v + 1) };
}

export interface AlertPreview {
  days: number;
  count: number;
  sample: { slug: string; title: string; published_date: string }[];
}

export async function previewAlert(criteria: {
  keywords: string[]; organs: string[]; ufs: string[]; modalities: string[];
  value_min: number | null; value_max: number | null;
}, signal?: AbortSignal): Promise<AlertPreview | null> {
  try {
    const res = await authFetch(`${API_BASE}/api/v1/alerts/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria),
      signal,
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

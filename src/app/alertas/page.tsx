'use client';

import { useEffect, useState, useRef } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertForm, criteriaOf, type AlertFormState } from '@/components/alertas/AlertForm';
import { useNotificationStatus } from '@/lib/notifications';
import { AlertCard, type AlertProfile } from '@/components/alertas/AlertCard';
import { DesktopOnlyNotice } from '@/components/layout/DesktopOnlyNotice';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/auth';
import { getSubscription, authFetch, type Subscription } from '@/lib/api';
import { track } from '@/lib/analytics';
import { setAlertsSnapshot } from '@/lib/useAccount';
import type { Article } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

const emptyForm: AlertFormState = { name: '', keywords: '', organs: '', ufs: '', modalities: '', value_min: '', value_max: '', channel: '' };

/** "Salvar como alerta" na Busca chega aqui com ?prefill=<querystring da busca>. */
function formFromPrefill(): AlertFormState | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('prefill');
  if (!raw) return null;
  const p = new URLSearchParams(raw);
  const list = (k: string) => (p.get(k) || '').split(',').map((x) => x.trim()).filter(Boolean).join(', ');
  return {
    name: p.get('name') || '',
    keywords: p.get('keywords') || '',
    organs: list('organs'),
    ufs: list('ufs'),
    modalities: list('modalities'),
    value_min: p.get('value_min') || '',
    value_max: p.get('value_max') || '',
    channel: '',
  };
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefill] = useState(formFromPrefill);
  // ?novo=1 (link "Criar alerta" do Painel) já abre o formulário vazio
  const [showForm, setShowForm] = useState(
    () => prefill !== null || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('novo') === '1'),
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<AlertFormState>(prefill ?? emptyForm);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [matches, setMatches] = useState<Article[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const openedFromQuery = useRef(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  const { status: notifications } = useNotificationStatus();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUserId(data.session.user.id);
        getSubscription(data.session.user.id).then(setSubscription).catch(() => {});
      }
    });
  }, []);

  const limit = subscription?.usage.alert_profiles_limit ?? null;
  const atLimit = limit !== null && alerts.length >= limit;


  const submitForm = async () => {
    if (!form.name) return;
    if (!userId) {
      toast('Erro: usuário não autenticado', 'error');
      return;
    }
    if (editingId === null && atLimit) {
      toast(`Limite de ${limit} alertas do plano ${subscription?.plan_label} atingido. Fale com o suporte para fazer upgrade.`, 'error');
      return;
    }
    const body = {
      name: form.name,
      ...criteriaOf(form),
      ...(form.channel ? { channel: form.channel } : {}),
    };

    const isEdit = editingId !== null;
    const url = isEdit ? `${API_BASE}/api/v1/alerts/${editingId}` : `${API_BASE}/api/v1/alerts`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      track(isEdit ? 'alert_edited' : 'alert_created', {
        has_keywords: body.keywords.length > 0,
        has_organs: body.organs.length > 0,
        has_ufs: body.ufs.length > 0,
        has_modalities: body.modalities.length > 0,
      });
      toast(isEdit ? 'Alerta atualizado' : 'Alerta criado', 'success');
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } else {
      const err = await res.text();
      toast(`Erro ao ${isEdit ? 'atualizar' : 'criar'} alerta: ${err}`, 'error');
    }
  };

  const startEdit = (alert: AlertProfile) => {
    setForm({
      name: alert.name,
      keywords: alert.keywords.join(', '),
      organs: alert.organs.join(', '),
      ufs: alert.ufs.join(', '),
      modalities: alert.modalities.join(', '),
      value_min: alert.value_min?.toString() || '',
      value_max: alert.value_max?.toString() || '',
      channel: alert.channel ?? '',
    });
    setEditingId(alert.id);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleToggle = async (alert: AlertProfile) => {
    await authFetch(`${API_BASE}/api/v1/alerts/${alert.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !alert.enabled }),
    });
    track('alert_toggled', { enabled: !alert.enabled });
    load();
  };

  const handleDelete = async (alert: AlertProfile) => {
    if (!confirm(`Remover alerta "${alert.name}"?`)) return;
    await authFetch(`${API_BASE}/api/v1/alerts/${alert.id}`, { method: 'DELETE' });
    track('alert_deleted');
    toast('Alerta removido', 'success');
    load();
  };

  const toggleMatches = async (alertId: number) => {
    if (expanded === alertId) {
      setExpanded(null);
      return;
    }
    setExpanded(alertId);
    setMatchesLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/v1/alerts/${alertId}/matches?limit=10`);
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch {}
    setMatchesLoading(false);
  };

  const load = () => {
    if (!userId) return;
    authFetch(`${API_BASE}/api/v1/alerts`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: AlertProfile[]) => {
        const list = Array.isArray(data) ? data : [];
        setAlerts(list);
        setAlertsSnapshot(list); // mantém o contador do menu em sincronia
        // "?abrir=<id>" (vindo do Painel) já abre os resultados daquele alerta
        const open = Number(new URLSearchParams(window.location.search).get('abrir'));
        if (open && list.some((a) => a.id === open) && !openedFromQuery.current) {
          openedFromQuery.current = true;
          toggleMatches(open);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (userId) load(); }, [userId]);

  const isEditing = editingId !== null;

  return (
    <AuthGuard>
      <DashboardLayout>
        <DesktopOnlyNotice description="A criação e edição de alertas ainda não foi adaptada pro celular — abra pelo computador para gerenciar seus alertas." />
        <div className="hidden lg:block">
        <header className="py-8 px-12 flex items-end justify-between gap-6 flex-wrap" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className="flex flex-col gap-1">
            <h1 className="text-[32px] font-extrabold tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              Alertas
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
              {subscription ? (
                limit !== null
                  ? `${alerts.length} de ${limit} alertas usados no plano ${subscription.plan_label} · avisamos quando sair publicação nova`
                  : `${alerts.length} alerta${alerts.length !== 1 ? 's' : ''} · ilimitados no plano ${subscription.plan_label}`
              ) : (
                `${alerts.length} alerta${alerts.length !== 1 ? 's' : ''} · avisamos quando sair publicação nova`
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (atLimit) {
                toast(`Limite de ${limit} alertas do plano ${subscription?.plan_label} atingido. Fale com o suporte para fazer upgrade.`, 'error');
                return;
              }
              cancelForm();
              setShowForm(true);
            }}
            className="h-12 px-[22px] text-[15px] font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: 0, color: '#fff' }}
          >
            + Novo alerta
          </button>
        </header>

        <div className={`grid gap-8 py-8 px-12 ${showForm ? 'grid-cols-[minmax(0,1fr)_420px]' : 'grid-cols-1'}`}>
          <div className="flex flex-col gap-4 min-w-0">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 skeleton" />)
            ) : alerts.length === 0 ? (
              <div className="py-12 max-w-md">
                <p className="text-[15px] font-bold mb-1">Nenhum alerta ainda.</p>
                <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
                  Um alerta é uma busca salva: avisamos quando sair uma publicação nova que combine com ela.
                  Crie um aqui ou use “Salvar como alerta” depois de uma busca.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  expanded={expanded === alert.id}
                  matches={matches}
                  matchesLoading={matchesLoading}
                  onToggleMatches={() => toggleMatches(alert.id)}
                  onEdit={() => startEdit(alert)}
                  onToggleEnabled={() => handleToggle(alert)}
                  onDelete={() => handleDelete(alert)}
                />
              ))
            )}
          </div>
          {showForm && (
            <div ref={formRef} className="self-start sticky top-6">
              <AlertForm
                form={form}
                onChange={setForm}
                isEditing={isEditing}
                editingName={form.name}
                onSubmit={submitForm}
                onCancel={cancelForm}
                notifications={notifications}
              />
            </div>
          )}
        </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

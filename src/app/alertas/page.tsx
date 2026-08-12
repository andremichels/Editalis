'use client';

import { useEffect, useState, useRef } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertForm, type AlertFormState } from '@/components/alertas/AlertForm';
import { AlertCard, type AlertProfile } from '@/components/alertas/AlertCard';
import { DesktopOnlyNotice } from '@/components/layout/DesktopOnlyNotice';
import { useToast } from '@/components/Toast';
import { supabase } from '@/lib/auth';
import { getSubscription, authFetch, type Subscription } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

interface MatchArticle {
  id: number;
  slug: string;
  title: string;
  title_marker?: string;
  published_date: string;
  organ_level_1?: string;
}

const emptyForm: AlertFormState = { name: '', keywords: '', organs: '', ufs: '', modalities: '', value_min: '', value_max: '' };

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<AlertFormState>(emptyForm);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [matches, setMatches] = useState<MatchArticle[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
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

  const load = () => {
    if (!userId) return;
    authFetch(`${API_BASE}/api/v1/alerts`)
      .then((r) => r.json())
      .then(setAlerts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (userId) load(); }, [userId]);

  const submitForm = async () => {
    if (!form.name) return;
    if (!userId) {
      toast('Erro: usuário não autenticado', 'error');
      return;
    }
    if (editingId === null && atLimit) {
      toast(`Limite de ${limit} perfis do plano ${subscription?.plan_label} atingido. Fale com o suporte pra fazer upgrade.`, 'error');
      return;
    }
    const body = {
      name: form.name,
      keywords: form.keywords.split(',').map((s) => s.trim()).filter(Boolean),
      organs: form.organs.split(',').map((s) => s.trim()).filter(Boolean),
      ufs: form.ufs.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
      modalities: form.modalities.split(',').map((s) => s.trim()).filter(Boolean),
      value_min: form.value_min ? parseFloat(form.value_min) : null,
      value_max: form.value_max ? parseFloat(form.value_max) : null,
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
    load();
  };

  const handleDelete = async (alert: AlertProfile) => {
    if (!confirm(`Remover alerta "${alert.name}"?`)) return;
    await authFetch(`${API_BASE}/api/v1/alerts/${alert.id}`, { method: 'DELETE' });
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

  const isEditing = editingId !== null;

  return (
    <AuthGuard>
      <DashboardLayout>
        <DesktopOnlyNotice description="A criação e edição de alertas ainda não foi adaptada pro celular — abra pelo computador pra gerenciar seus perfis de busca." />
        <div className="hidden lg:block">
        <div className="py-7 px-10 flex items-center justify-between" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              Alertas
            </h1>
            <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-600)' }}>
              {subscription ? (
                limit !== null
                  ? `${alerts.length} de ${limit} perfis usados no plano ${subscription.plan_label}`
                  : `${alerts.length} perfil${alerts.length !== 1 ? 's' : ''} · perfis ilimitados no plano ${subscription.plan_label}`
              ) : (
                `${alerts.length} perfil${alerts.length !== 1 ? 's' : ''} configurado${alerts.length !== 1 ? 's' : ''}`
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (!showForm && atLimit) {
                toast(`Limite de ${limit} perfis do plano ${subscription?.plan_label} atingido. Fale com o suporte pra fazer upgrade.`, 'error');
                return;
              }
              cancelForm();
              setShowForm(!showForm);
            }}
            className="text-left py-3 px-5 text-sm font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            {showForm && !isEditing ? 'Cancelar' : '+ Novo alerta'}
          </button>
        </div>

        <div className="px-10 py-7">
          {showForm && (
            <div ref={formRef}>
              <AlertForm
                form={form}
                onChange={setForm}
                isEditing={isEditing}
                editingName={form.name}
                onSubmit={submitForm}
                onCancel={cancelForm}
              />
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 skeleton" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
                Nenhum alerta configurado. Crie um para receber notificações de novas licitações.
              </p>
            </div>
          ) : (
            <div style={{ borderTop: '2px solid var(--color-text)' }}>
              {alerts.map((alert) => (
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
              ))}
            </div>
          )}
        </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

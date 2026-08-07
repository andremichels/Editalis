'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountForm } from '@/components/perfil/AccountForm';
import { PasswordForm } from '@/components/perfil/PasswordForm';
import { PlanCard } from '@/components/perfil/PlanCard';
import { supabase } from '@/lib/auth';
import { FormField } from '@/components/ui/FormField';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

// ── Types ──

type ProfileData = { nome_completo: string; cargo: string; celular: string };
type PrefsData = { ufs_padrao: string[]; valor_minimo_interesse: number | null; abrir_painel_filtrado: boolean; ocultar_homologadas: boolean; favoritar_ao_baixar: boolean };
type NotifData = { email_diario: boolean; whatsapp_48h: boolean; notificacao_app: boolean };
type ActivityItem = { id: number; type: string; description: string; created_at: string };
type Cnae = { codigo: string; descricao: string };
type TeamMember = { id: number; nome: string; email: string; role: string; scope: string | null };

const ROLES = ['admin', 'editor', 'leitor'] as const;
const ROLE_LABELS: Record<string, string> = { admin: 'Administrador', editor: 'Editor', leitor: 'Leitor' };

// ── UI ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>{title}</div>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: 'var(--color-accent)', width: 18, height: 18 }} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

// ── Page ──

export default function PerfilPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>({ nome_completo: '', cargo: '', celular: '' });
  const [prefs, setPrefs] = useState<PrefsData>({ ufs_padrao: [], valor_minimo_interesse: null, abrir_painel_filtrado: false, ocultar_homologadas: false, favoritar_ao_baixar: false });
  const [notif, setNotif] = useState<NotifData>({ email_diario: false, whatsapp_48h: false, notificacao_app: false });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [cnaes, setCnaes] = useState<Cnae[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [ufInput, setUfInput] = useState('');
  const [cnaeCodigo, setCnaeCodigo] = useState('');
  const [cnaeDescricao, setCnaeDescricao] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [status, setStatus] = useState('');

  const fetchAll = (uid: string) => {
    fetch(`${API_BASE}/api/v1/account/profile?user_id=${uid}`).then(r => r.json()).then(setProfile).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/preferences?user_id=${uid}`).then(r => r.json()).then(setPrefs).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/notification-defaults?user_id=${uid}`).then(r => r.json()).then(setNotif).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/activity?user_id=${uid}&limit=10`).then(r => r.json()).then(setActivity).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/company/cnaes?user_id=${uid}`).then(r => r.json()).then(setCnaes).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/team?user_id=${uid}`).then(r => r.json()).then(setTeam).catch(() => {});
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setUserId(data.session.user.id); fetchAll(data.session.user.id); }
    });
  }, []);

  const saveProfile = async () => {
    if (!userId) return; setStatus('saving');
    const res = await fetch(`${API_BASE}/api/v1/account/profile?user_id=${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    setStatus(res.ok ? 'saved' : 'error');
  };

  const savePrefsWith = async (p: PrefsData) => {
    if (!userId) return;
    await fetch(`${API_BASE}/api/v1/account/preferences?user_id=${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
  };

  const toggleNotif = async (key: keyof NotifData) => {
    if (!userId) return;
    const next = { ...notif, [key]: !notif[key] }; setNotif(next);
    await fetch(`${API_BASE}/api/v1/account/notification-defaults?user_id=${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
  };

  const addUf = () => {
    const uf = ufInput.trim().toUpperCase();
    if (uf && !prefs.ufs_padrao.includes(uf)) {
      const next = { ...prefs, ufs_padrao: [...prefs.ufs_padrao, uf] }; setPrefs(next); setUfInput(''); savePrefsWith(next);
    }
  };

  // ── CNAEs ──

  const addCnae = async () => {
    if (!cnaeCodigo || !cnaeDescricao || !userId) return;
    const next = [...cnaes, { codigo: cnaeCodigo, descricao: cnaeDescricao }];
    setCnaes(next); setCnaeCodigo(''); setCnaeDescricao('');
    await fetch(`${API_BASE}/api/v1/account/company/cnaes?user_id=${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
  };

  const removeCnae = async (codigo: string) => {
    if (!userId) return;
    const next = cnaes.filter(c => c.codigo !== codigo); setCnaes(next);
    await fetch(`${API_BASE}/api/v1/account/company/cnaes?user_id=${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
  };

  // ── Team ──

  const updateMemberRole = async (memberId: number, role: string, scope?: string | null) => {
    if (!userId) return;
    const params = new URLSearchParams({ user_id: userId, role });
    if (scope) params.append('scope', scope);
    await fetch(`${API_BASE}/api/v1/account/team/${memberId}?${params}`, { method: 'PUT' });
    fetchAll(userId);
  };

  const removeMember = async (memberId: number) => {
    if (!userId || !confirm('Remover este membro da equipe?')) return;
    await fetch(`${API_BASE}/api/v1/account/team/${memberId}?user_id=${userId}`, { method: 'DELETE' });
    fetchAll(userId);
  };

  const ACT_LABELS: Record<string, string> = { alert_created: '📋', favorited: '★', unfavorited: '☆', export_csv: '📥' };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Perfil</h1>
          <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-600)' }}>Dados da conta, preferências e assinatura</div>
        </div>

        <AccountForm />
        <PasswordForm />

        {/* ── Profile extras ── */}
        <Section title="Dados pessoais">
          <div className="flex flex-col gap-4 max-w-md">
            <FormField label="Nome completo" value={profile.nome_completo} onChange={e => setProfile({ ...profile, nome_completo: e.target.value })} />
            <FormField label="Cargo" value={profile.cargo} onChange={e => setProfile({ ...profile, cargo: e.target.value })} placeholder="Diretor" />
            <FormField label="Celular" value={profile.celular} onChange={e => setProfile({ ...profile, celular: e.target.value })} placeholder="(11) 99999-9999" />
            <div className="flex items-center gap-3">
              <button onClick={saveProfile} disabled={status === 'saving'} className="py-3 px-5 text-sm font-bold cursor-pointer disabled:opacity-60"
                style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}>
                {status === 'saving' ? 'Salvando...' : 'Salvar'}
              </button>
              {status === 'saved' && <span className="text-xs font-semibold" style={{ color: 'var(--color-accent-700)' }}>Salvo.</span>}
            </div>
          </div>
        </Section>

        {/* ── CNAEs ── */}
        <Section title="CNAEs de atuação">
          <div className="max-w-md">
            <p className="text-xs mb-4" style={{ color: 'var(--color-neutral-500)' }}>
              Os CNAEs alimentam a sugestão automática de licitações compatíveis no painel.
            </p>
            <div className="flex gap-2 mb-3">
              <input value={cnaeCodigo} onChange={e => setCnaeCodigo(e.target.value)} placeholder="41.20-4"
                className="w-28 px-3 py-2 text-sm" style={{ border: '2px solid var(--color-divider)', background: 'var(--color-bg)' }} />
              <input value={cnaeDescricao} onChange={e => setCnaeDescricao(e.target.value)} placeholder="Construção de edifícios"
                className="flex-1 px-3 py-2 text-sm" style={{ border: '2px solid var(--color-divider)', background: 'var(--color-bg)' }}
                onKeyDown={e => e.key === 'Enter' && addCnae()} />
              <button onClick={addCnae} className="text-sm px-4 font-bold cursor-pointer" style={{ background: 'var(--color-text)', color: '#fff', border: 'none' }}>+</button>
            </div>
            {cnaes.map(c => (
              <div key={c.codigo} className="flex items-center justify-between py-2 text-sm" style={{ borderBottom: '1px solid var(--color-divider)' }}>
                <span><strong>{c.codigo}</strong> · {c.descricao}</span>
                <button onClick={() => removeCnae(c.codigo)} className="text-xs border-0 bg-transparent cursor-pointer font-bold" style={{ color: 'var(--color-accent)' }}>remover</button>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Search preferences ── */}
        <Section title="Preferências de busca">
          <div className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="block text-xs font-bold mb-1">UFs padrão</label>
              <div className="flex gap-1 mb-2">
                <input value={ufInput} onChange={e => setUfInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addUf()}
                  placeholder="SP" maxLength={2} className="flex-1 px-3 py-2 text-sm uppercase" style={{ border: '2px solid var(--color-divider)', background: 'var(--color-bg)' }} />
                <button onClick={addUf} className="text-sm px-4 font-bold cursor-pointer" style={{ background: 'var(--color-text)', color: '#fff', border: 'none' }}>+</button>
              </div>
              <div className="flex flex-wrap gap-1">
                {prefs.ufs_padrao.map(uf => (
                  <span key={uf} className="text-xs px-2 py-1 font-bold flex items-center gap-1" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                    {uf} <button onClick={() => { const n = { ...prefs, ufs_padrao: prefs.ufs_padrao.filter(u => u !== uf) }; setPrefs(n); savePrefsWith(n); }} className="text-xs border-0 bg-transparent cursor-pointer" style={{ color: '#fff' }}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <FormField label="Valor mínimo de interesse (R$)" type="number" value={prefs.valor_minimo_interesse?.toString() || ''}
              onChange={e => { const v = e.target.value ? parseFloat(e.target.value) : null; const n = { ...prefs, valor_minimo_interesse: v }; setPrefs(n); savePrefsWith(n); }} />
            <Toggle label="Abrir o painel já filtrado pelas UFs padrão" checked={prefs.abrir_painel_filtrado}
              onChange={v => { const n = { ...prefs, abrir_painel_filtrado: v }; setPrefs(n); savePrefsWith(n); }} />
            <Toggle label="Ocultar licitações já homologadas nos resultados" checked={prefs.ocultar_homologadas}
              onChange={v => { const n = { ...prefs, ocultar_homologadas: v }; setPrefs(n); savePrefsWith(n); }} />
            <Toggle label="Marcar automaticamente como favorita ao baixar o edital" checked={prefs.favoritar_ao_baixar}
              onChange={v => { const n = { ...prefs, favoritar_ao_baixar: v }; setPrefs(n); savePrefsWith(n); }} />
          </div>
        </Section>

        {/* ── Notifications ── */}
        <Section title="Canais de notificação">
          <div className="max-w-md">
            <p className="text-xs mb-4" style={{ color: 'var(--color-neutral-500)' }}>
              Configuração padrão. Cada perfil de alerta pode sobrescrever em{' '}
              <Link href="/alertas" className="font-bold underline" style={{ color: 'var(--color-accent)' }}>Alertas</Link>.
            </p>
            <Toggle label="E-mail diário (06h30)" checked={notif.email_diario} onChange={() => toggleNotif('email_diario')} />
            <Toggle label="WhatsApp 48h antes da abertura" checked={notif.whatsapp_48h} onChange={() => toggleNotif('whatsapp_48h')} />
            <Toggle label="Notificação no app" checked={notif.notificacao_app} onChange={() => toggleNotif('notificacao_app')} />
          </div>
        </Section>

        {/* ── Team ── */}
        <Section title="Equipe">
          <div className="max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold">Usuários · {team.length}</span>
            </div>

            {team.map(m => (
              <div key={m.id} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--color-divider)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}>
                    {(m.nome || m.email || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{m.nome || m.email || '—'}</div>
                    <div className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select value={m.role} onChange={e => updateMemberRole(m.id, e.target.value)}
                    className="text-xs px-2 py-1" style={{ border: '1px solid var(--color-divider)', background: 'var(--color-bg)' }}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                  <button onClick={() => removeMember(m.id)} className="text-xs border-0 bg-transparent cursor-pointer font-bold" style={{ color: 'var(--color-accent)' }}>remover</button>
                </div>
              </div>
            ))}

            <div className="mt-4 flex gap-2">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@construtora.com.br"
                className="flex-1 px-3 py-2 text-sm" style={{ border: '2px solid var(--color-divider)', background: 'var(--color-bg)' }} />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                className="text-sm px-2 py-2" style={{ border: '2px solid var(--color-divider)', background: 'var(--color-bg)' }}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <button onClick={() => {}} className="text-sm px-4 font-bold cursor-pointer" style={{ background: 'var(--color-text)', color: '#fff', border: 'none' }}>
                Convidar
              </button>
            </div>
          </div>
        </Section>

        {/* ── Activity feed ── */}
        <Section title="Atividade recente">
          <div className="max-w-md">
            {activity.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Nenhuma atividade recente.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {activity.map(a => (
                  <div key={a.id} className="flex items-center gap-3 text-sm py-1">
                    <span className="text-base">{ACT_LABELS[a.type] || '•'}</span>
                    <span className="flex-1">{a.description}</span>
                    <span className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>{a.created_at.slice(11, 16)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        <PlanCard />

        <Section title="Notificações">
          <p className="text-sm max-w-md" style={{ color: 'var(--color-neutral-700)' }}>
            Canais e frequência de envio dos alertas são gerenciados em{' '}
            <Link href="/alertas" className="font-bold underline" style={{ color: 'var(--color-accent)' }}>Alertas e favoritas</Link>.
          </p>
        </Section>
      </DashboardLayout>
    </AuthGuard>
  );
}

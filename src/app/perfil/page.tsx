'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DesktopOnlyNotice } from '@/components/layout/DesktopOnlyNotice';
import { AccountHeader, type PerfilTab } from '@/components/perfil/AccountHeader';
import { ContaTab, type ProfileData, type PreferencesData, type NotificationDefaults, type ActivityItem } from '@/components/perfil/tabs/ContaTab';
import { EmpresaTab, type Cnae, type CompanyData } from '@/components/perfil/tabs/EmpresaTab';
import { AssinaturaTab } from '@/components/perfil/tabs/AssinaturaTab';
import { EquipeTab, type TeamMember } from '@/components/perfil/tabs/EquipeTab';
import { supabase } from '@/lib/auth';
import { authFetch } from '@/lib/api';
import { getSubscription, getSubscriptionPortalUrl, type Subscription } from '@/lib/api';
import { useFavorites } from '@/lib/useFavorites';
import { useToast } from '@/components/Toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

const emptyProfile: ProfileData = { nome_completo: '', cargo: '', celular: '' };
const emptyPreferences: PreferencesData = { ufs_padrao: [], valor_minimo_interesse: null, abrir_painel_filtrado: false, ocultar_homologadas: false, favoritar_ao_baixar: false };
const emptyNotifications: NotificationDefaults = { email_diario: false, whatsapp_48h: false, notificacao_app: false };
const emptyCompany: CompanyData = { razao_social: '', cnpj: '', inscricao_municipal: '', cep: '', cidade_uf: '', email_nota_fiscal: '' };

export default function PerfilPage() {
  const { toast } = useToast();
  const { favorites } = useFavorites();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [activeTab, setActiveTab] = useState<PerfilTab>('conta');

  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [preferences, setPreferences] = useState<PreferencesData>(emptyPreferences);
  const [notifications, setNotifications] = useState<NotificationDefaults>(emptyNotifications);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [cnaes, setCnaes] = useState<Cnae[]>([]);
  const [company, setCompany] = useState<CompanyData>(emptyCompany);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchAccountData = (uid: string) => {
    fetch(`${API_BASE}/api/v1/account/profile?user_id=${uid}`).then((r) => r.json()).then((d) => setProfile({ nome_completo: d.nome_completo ?? '', cargo: d.cargo ?? '', celular: d.celular ?? '' })).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/preferences?user_id=${uid}`).then((r) => r.json()).then(setPreferences).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/notification-defaults?user_id=${uid}`).then((r) => r.json()).then(setNotifications).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/activity?user_id=${uid}&limit=10`).then((r) => r.json()).then((d) => setActivity(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/company/cnaes?user_id=${uid}`).then((r) => r.json()).then((d) => setCnaes(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API_BASE}/api/v1/account/team?user_id=${uid}`).then((r) => r.json()).then((d) => setTeam(Array.isArray(d) ? d : [])).catch(() => {});
    getSubscription(uid).then(setSubscription).catch(() => {});
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email ?? '');
      if (user.created_at) {
        setMemberSince(new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
      }
      fetchAccountData(user.id);
    });
  }, []);

  // ── Conta tab ──

  const saveConta = async () => {
    if (!userId) return;
    setSavingProfile(true);
    try {
      await Promise.all([
        supabase.auth.updateUser({ email }),
        authFetch(`${API_BASE}/api/v1/account/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }),
        authFetch(`${API_BASE}/api/v1/account/preferences`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preferences) }),
        authFetch(`${API_BASE}/api/v1/account/notification-defaults`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(notifications) }),
      ]);
      toast('Alterações salvas', 'success');
    } catch {
      toast('Erro ao salvar alterações', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const discardConta = () => {
    if (userId) fetchAccountData(userId);
  };

  // ── Empresa tab ──

  const saveCompany = () => {
    toast('Dados cadastrais da empresa ainda não são salvos pelo backend — em breve.', 'info');
  };

  const addCnae = async (c: Cnae) => {
    if (!userId) return;
    const next = [...cnaes, c];
    setCnaes(next);
    await fetch(`${API_BASE}/api/v1/account/company/cnaes?user_id=${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
  };

  const removeCnae = async (codigo: string) => {
    if (!userId) return;
    const next = cnaes.filter((c) => c.codigo !== codigo);
    setCnaes(next);
    await fetch(`${API_BASE}/api/v1/account/company/cnaes?user_id=${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
  };

  // ── Assinatura tab ──

  const managePortal = async () => {
    if (!userId) return;
    setOpeningPortal(true);
    try {
      const url = await getSubscriptionPortalUrl(userId);
      if (!url) throw new Error('no url');
      window.location.href = url;
    } catch {
      toast('Portal de cobrança ainda não disponível — fale com o suporte pra alterar seu plano.', 'info');
    } finally {
      setOpeningPortal(false);
    }
  };

  // ── Equipe tab ──

  const updateRole = async (memberId: number, role: TeamMember['role']) => {
    if (!userId) return;
    const prev = team;
    setTeam((t) => t.map((m) => (m.id === memberId ? { ...m, role } : m)));
    const res = await authFetch(`${API_BASE}/api/v1/account/team/${memberId}?role=${role}`, { method: 'PUT' });
    if (!res.ok) {
      setTeam(prev);
      const body = await res.json().catch(() => null);
      toast(body?.detail || 'Não foi possível atualizar o papel', 'error');
    }
  };

  const inviteMember = async (inviteEmail: string, role: TeamMember['role']): Promise<boolean> => {
    if (!userId) return false;
    try {
      const res = await authFetch(`${API_BASE}/api/v1/account/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role }),
      });
      if (res.ok) {
        fetchAccountData(userId);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const removeMember = async (memberId: number): Promise<boolean> => {
    if (!userId) return false;
    try {
      const res = await authFetch(`${API_BASE}/api/v1/account/team/${memberId}`, { method: 'DELETE' });
      if (res.ok) {
        setTeam((t) => t.filter((m) => m.id !== memberId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updatePassword = async () => {
    if (newPassword.length < 8) {
      toast('A senha deve ter no mínimo 8 caracteres', 'error');
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Senha atualizada', 'success');
      setNewPassword('');
    }
  };

  const displayName = profile.nome_completo || email.split('@')[0] || 'Minha conta';
  const subtitle = [profile.cargo, memberSince ? `desde ${memberSince}` : null].filter(Boolean).join(' · ') || 'Membro da equipe';

  return (
    <AuthGuard>
      <DashboardLayout>
        <DesktopOnlyNotice description="Minha conta (dados, empresa, assinatura, equipe) ainda não foi adaptada pro celular — abra pelo computador." />
        <div className="hidden lg:block">
        <AccountHeader
          initials={displayName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '·'}
          name={displayName}
          subtitle={subtitle}
          stats={{
            perfis: subscription ? `${subscription.usage.alert_profiles_used}/${subscription.usage.alert_profiles_limit ?? '∞'}` : '—',
            favoritas: favorites.size,
            usuarios: team.length,
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'conta' && (
          <ContaTab
            email={email}
            onEmailChange={setEmail}
            profile={profile}
            onProfileChange={setProfile}
            preferences={preferences}
            onPreferencesChange={setPreferences}
            notifications={notifications}
            onNotificationsChange={setNotifications}
            activity={activity}
            saving={savingProfile}
            onSave={saveConta}
            onDiscard={discardConta}
          />
        )}

        {activeTab === 'empresa' && (
          <EmpresaTab
            company={company}
            onCompanyChange={setCompany}
            onSaveCompany={saveCompany}
            cnaes={cnaes}
            onAddCnae={addCnae}
            onRemoveCnae={removeCnae}
          />
        )}

        {activeTab === 'assinatura' && (
          <AssinaturaTab subscription={subscription} teamCount={team.length} onManagePortal={managePortal} openingPortal={openingPortal} />
        )}

        {activeTab === 'equipe' && (
          <EquipeTab
            team={team}
            onUpdateRole={updateRole}
            onInvite={inviteMember}
            onRemove={removeMember}
            newPassword={newPassword}
            onNewPasswordChange={setNewPassword}
            onUpdatePassword={updatePassword}
            passwordSaving={savingPassword}
          />
        )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

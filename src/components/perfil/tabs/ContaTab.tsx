'use client';

import Link from 'next/link';
import { FormField } from '@/components/ui/FormField';
import { formatDateTime } from '@/lib/format';

export interface ProfileData {
  nome_completo: string;
  cargo: string;
  celular: string;
}

export interface PreferencesData {
  ufs_padrao: string[];
  valor_minimo_interesse: number | null;
  abrir_painel_filtrado: boolean;
  ocultar_homologadas: boolean;
  favoritar_ao_baixar: boolean;
  verticals: string[];
  onboarding_completed: boolean;
}

export interface NotificationDefaults {
  email_diario: boolean;
  whatsapp_48h: boolean;
  notificacao_app: boolean;
}

export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  created_at: string;
}

const sectionLabel = 'text-[12px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-700)' };

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex justify-between items-center cursor-pointer py-3" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <span className="text-[14px]">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-[18px] h-[18px]" style={{ accentColor: 'var(--color-text)' }} />
    </label>
  );
}

interface ContaTabProps {
  email: string;
  onEmailChange: (v: string) => void;
  profile: ProfileData;
  onProfileChange: (p: ProfileData) => void;
  preferences: PreferencesData;
  onPreferencesChange: (p: PreferencesData) => void;
  notifications: NotificationDefaults;
  onNotificationsChange: (n: NotificationDefaults) => void;
  activity: ActivityItem[];
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function ContaTab({
  email, onEmailChange, profile, onProfileChange,
  notifications, onNotificationsChange, activity, saving, onSave, onDiscard,
}: ContaTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="py-8 px-10 min-w-0" style={{ borderRight: '2px solid var(--color-text)' }}>
        <div className={`${sectionLabel} mb-5`} style={sectionLabelStyle}>Dados pessoais</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[640px]">
          <FormField label="Nome completo" value={profile.nome_completo} onChange={(e) => onProfileChange({ ...profile, nome_completo: e.target.value })} />
          <FormField label="Cargo" value={profile.cargo} onChange={(e) => onProfileChange({ ...profile, cargo: e.target.value })} placeholder="Ex.: analista de licitações" />
          <FormField label="E-mail de acesso" type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} />
          <FormField label="Celular (opcional)" type="tel" value={profile.celular} onChange={(e) => onProfileChange({ ...profile, celular: e.target.value })} placeholder="DDD + número" />
        </div>

        <div className="mt-8 pt-7 max-w-[640px]" style={{ borderTop: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-2`} style={sectionLabelStyle}>Avisos</div>
          {/* Só o que de fato funciona hoje: o e-mail diário dos alertas. */}
          <Toggle
            label="E-mail diário com as publicações novas dos seus alertas"
            checked={notifications.email_diario}
            onChange={(v) => onNotificationsChange({ ...notifications, email_diario: v })}
          />
          <p className="text-[13px] mt-3" style={{ color: 'var(--color-neutral-700)' }}>
            O que entra no e-mail é definido em <Link href="/alertas" className="underline font-bold" style={{ color: 'var(--color-text)' }}>Alertas</Link>.
          </p>
        </div>

        <div className="mt-8 pt-7 max-w-[640px]" style={{ borderTop: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-2`} style={sectionLabelStyle}>Setores, estados e valor mínimo</div>
          <p className="text-[14px]" style={{ color: 'var(--color-neutral-700)' }}>
            Ficam na tela <Link href="/setores" className="underline font-bold" style={{ color: 'var(--color-text)' }}>Setores</Link> e valem para o Painel, a Busca e os alertas.
          </p>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onSave}
            disabled={saving}
            className="text-left py-3.5 px-6 text-[15px] font-bold cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
          <button onClick={onDiscard} className="text-left py-3.5 px-6 text-[15px] font-bold cursor-pointer" style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}>
            Descartar
          </button>
        </div>
      </div>

      <div>
        <div className="p-6">
          <div className={`${sectionLabel} mb-3.5`} style={sectionLabelStyle}>Atividade recente</div>
          {activity.length === 0 ? (
            <p className="text-[14px]" style={{ color: 'var(--color-neutral-700)' }}>Nenhuma atividade ainda.</p>
          ) : (
            <div className="flex flex-col gap-3.5 text-[13px]">
              {activity.map((a) => (
                <div key={a.id}>
                  <div className="font-bold leading-snug">{humanizeActivity(a.description)}</div>
                  <div style={{ color: 'var(--color-neutral-700)' }}>{formatDateTime(a.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Registros antigos traziam o id ("artigo #123") e jargão ("perfil", "matches"). */
function humanizeActivity(text: string): string {
  return text
    .replace(/Favoritou o artigo #\d+/, 'Favoritou uma publicação')
    .replace(/Removeu favorito do artigo #\d+/, 'Tirou uma publicação dos favoritos')
    .replace(/Criou o perfil/, 'Criou o alerta')
    .replace(/(\d+) novos matches/, '$1 publicações novas')
    .replace(/ como leitor\b/, ' como Leitor')
    .replace(/ como editor\b/, ' como Editor')
    .replace(/ como admin\b/, ' como Administrador');
}

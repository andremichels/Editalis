'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FormField } from '@/components/ui/FormField';

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

const sectionLabel = 'text-[11px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-600)' };

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex justify-between items-center cursor-pointer py-3" style={{ borderBottom: '1px solid var(--color-divider)' }}>
      <span className="text-sm">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-[18px] h-[18px]" style={{ accentColor: 'var(--color-accent)' }} />
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
  email, onEmailChange, profile, onProfileChange, preferences, onPreferencesChange,
  notifications, onNotificationsChange, activity, saving, onSave, onDiscard,
}: ContaTabProps) {
  const [ufInput, setUfInput] = useState('');

  const addUf = () => {
    const uf = ufInput.trim().toUpperCase();
    if (uf.length === 2 && !preferences.ufs_padrao.includes(uf)) {
      onPreferencesChange({ ...preferences, ufs_padrao: [...preferences.ufs_padrao, uf] });
      setUfInput('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="py-8 px-10 min-w-0" style={{ borderRight: '2px solid var(--color-text)' }}>
        <div className={`${sectionLabel} mb-5`} style={sectionLabelStyle}>Dados pessoais</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[640px]">
          <FormField label="Nome completo" value={profile.nome_completo} onChange={(e) => onProfileChange({ ...profile, nome_completo: e.target.value })} />
          <FormField label="Cargo" value={profile.cargo} onChange={(e) => onProfileChange({ ...profile, cargo: e.target.value })} placeholder="Gerente de captação" />
          <FormField label="E-mail de acesso" type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} />
          <FormField label="Celular (WhatsApp)" value={profile.celular} onChange={(e) => onProfileChange({ ...profile, celular: e.target.value })} placeholder="(19) 99812-4400" />
        </div>

        <div className="mt-8 pt-7 max-w-[640px]" style={{ borderTop: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-5`} style={sectionLabelStyle}>Preferências de busca</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase mb-2" style={{ letterSpacing: '0.1em' }}>UFs padrão</label>
              <div className="flex gap-1.5 mb-2">
                <input
                  value={ufInput}
                  onChange={(e) => setUfInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addUf()}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full px-4 py-3.5 text-[15px] uppercase"
                  style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}
                />
                <button onClick={addUf} className="px-4 text-sm font-bold cursor-pointer shrink-0" style={{ background: 'var(--color-text)', color: '#fff' }}>+</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preferences.ufs_padrao.map((uf) => (
                  <span key={uf} className="text-xs font-bold py-1 px-2 flex items-center gap-1.5" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                    {uf}
                    <button
                      onClick={() => onPreferencesChange({ ...preferences, ufs_padrao: preferences.ufs_padrao.filter((u) => u !== uf) })}
                      className="cursor-pointer"
                      style={{ color: '#fff' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <FormField
              label="Valor mínimo de interesse"
              type="number"
              value={preferences.valor_minimo_interesse?.toString() ?? ''}
              onChange={(e) => onPreferencesChange({ ...preferences, valor_minimo_interesse: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="R$ 100.000"
            />
          </div>
          <div className="mt-5">
            <Toggle label="Abrir o painel já filtrado pelas UFs padrão" checked={preferences.abrir_painel_filtrado} onChange={(v) => onPreferencesChange({ ...preferences, abrir_painel_filtrado: v })} />
            <Toggle label="Ocultar licitações já homologadas nos resultados" checked={preferences.ocultar_homologadas} onChange={(v) => onPreferencesChange({ ...preferences, ocultar_homologadas: v })} />
            <div className="py-3">
              <label className="flex justify-between items-center cursor-pointer">
                <span className="text-sm">Marcar automaticamente como favorita ao baixar o edital</span>
                <input
                  type="checkbox"
                  checked={preferences.favoritar_ao_baixar}
                  onChange={(e) => onPreferencesChange({ ...preferences, favoritar_ao_baixar: e.target.checked })}
                  className="w-[18px] h-[18px]"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onSave}
            disabled={saving}
            className="text-left py-3.5 px-6 text-[15px] font-bold cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <button onClick={onDiscard} className="text-left py-3.5 px-6 text-[15px] font-bold cursor-pointer" style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}>
            Descartar
          </button>
        </div>
      </div>

      <div>
        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-3.5`} style={sectionLabelStyle}>Canais de notificação</div>
          <div className="text-sm">
            <Toggle label="E-mail diário 06h30" checked={notifications.email_diario} onChange={(v) => onNotificationsChange({ ...notifications, email_diario: v })} />
            <Toggle label="WhatsApp para 48h" checked={notifications.whatsapp_48h} onChange={(v) => onNotificationsChange({ ...notifications, whatsapp_48h: v })} />
            <div className="py-3">
              <label className="flex justify-between items-center cursor-pointer">
                <span>Notificação no app</span>
                <input
                  type="checkbox"
                  checked={notifications.notificacao_app}
                  onChange={(e) => onNotificationsChange({ ...notifications, notificacao_app: e.target.checked })}
                  className="w-[18px] h-[18px]"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
              </label>
            </div>
          </div>
          <Link href="/alertas" className="mt-4 block text-center py-2.5 text-[13px] font-bold" style={{ border: '2px solid var(--color-text)', color: 'var(--color-text)' }}>
            Configurar por perfil
          </Link>
        </div>

        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-3.5`} style={sectionLabelStyle}>Atividade recente</div>
          {activity.length === 0 ? (
            <p className="text-[13px]" style={{ color: 'var(--color-neutral-600)' }}>Nenhuma atividade ainda.</p>
          ) : (
            <div className="flex flex-col gap-3.5 text-[13px]">
              {activity.map((a) => (
                <div key={a.id}>
                  <div className="font-extrabold">{a.description}</div>
                  <div style={{ color: 'var(--color-neutral-600)' }}>{new Date(a.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className={`${sectionLabel} mb-2.5`} style={sectionLabelStyle}>Uso no ciclo</div>
          <p className="text-sm leading-[1.6]" style={{ color: 'var(--color-neutral-800)' }}>
            Ainda não disponível — estatísticas de uso por ciclo entram numa próxima entrega do backend.
          </p>
        </div>
      </div>
    </div>
  );
}

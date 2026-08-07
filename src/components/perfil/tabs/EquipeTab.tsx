'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';

export interface TeamMember {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'editor' | 'leitor';
  scope: string | null;
}

const ROLE_LABELS: Record<TeamMember['role'], string> = { admin: 'Administrador', editor: 'Editor', leitor: 'Leitor' };
const sectionLabel = 'text-[11px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-600)' };

interface EquipeTabProps {
  team: TeamMember[];
  onUpdateRole: (memberId: number, role: TeamMember['role']) => Promise<void> | void;
  onInvite: (email: string, role: TeamMember['role']) => Promise<boolean> | boolean;
  onRemove: (memberId: number) => Promise<boolean> | boolean;
  newPassword: string;
  onNewPasswordChange: (v: string) => void;
  onUpdatePassword: () => void;
  passwordSaving: boolean;
}

function initials(name: string) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function EquipeTab({ team, onUpdateRole, onInvite, onRemove, newPassword, onNewPasswordChange, onUpdatePassword, passwordSaving }: EquipeTabProps) {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('editor');
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoLogout, setAutoLogout] = useState(false);
  const [requireGovBr, setRequireGovBr] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    const ok = await onInvite(inviteEmail.trim(), inviteRole);
    if (ok) {
      toast('Convite enviado', 'success');
      setInviteEmail('');
    } else {
      toast('Convite ainda não disponível — peça pro administrador adicionar manualmente por enquanto.', 'info');
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Remover este membro da equipe?')) return;
    const ok = await onRemove(id);
    if (ok) toast('Membro removido', 'success');
    else toast('Remoção ainda não disponível nessa versão do backend.', 'info');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="py-8 px-10 min-w-0" style={{ borderRight: '2px solid var(--color-text)' }}>
        <div className="flex justify-between items-baseline mb-4">
          <div className={sectionLabel} style={sectionLabelStyle}>Usuários · {team.length}</div>
        </div>
        <div style={{ borderTop: '2px solid var(--color-text)' }}>
          {team.map((m) => (
            <div key={m.id} className="py-4.5 grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-4 items-center" style={{ borderBottom: '1px solid var(--color-divider)', paddingTop: 18, paddingBottom: 18 }}>
              <div className="w-10 h-10 flex items-center justify-center text-[13px] font-extrabold" style={{ background: 'var(--color-neutral-300)' }}>
                {initials(m.nome || m.email)}
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-extrabold truncate">{m.nome || m.email}</div>
                <div className="text-[13px] truncate" style={{ color: 'var(--color-neutral-700)' }}>{m.email}</div>
              </div>
              <div className="text-right">
                <select
                  value={m.role}
                  onChange={(e) => onUpdateRole(m.id, e.target.value as TeamMember['role'])}
                  className="text-[13px] font-bold py-1.5 px-2 cursor-pointer"
                  style={{ border: '2px solid var(--color-text)', background: 'var(--color-bg)' }}
                >
                  {(Object.keys(ROLE_LABELS) as TeamMember['role'][]).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <div className="text-xs mt-1" style={{ color: 'var(--color-neutral-600)' }}>{m.scope || (m.role === 'admin' ? 'Todos os perfis' : m.role === 'leitor' ? 'Somente leitura' : '')}</div>
              </div>
              <button onClick={() => handleRemove(m.id)} className="text-xs font-bold py-2 px-3 cursor-pointer self-start" style={{ border: '2px solid var(--color-text)', color: 'var(--color-text)' }}>
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-5 max-w-[560px]">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            placeholder="email@empresa.com.br"
            className="flex-1 px-4 py-3 text-sm"
            style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
            className="text-sm px-3 py-3 cursor-pointer"
            style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}
          >
            {(Object.keys(ROLE_LABELS) as TeamMember['role'][]).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <button onClick={handleInvite} className="px-5 text-sm font-bold cursor-pointer shrink-0" style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}>
            Convidar usuário
          </button>
        </div>

        <div className="mt-9 pt-7 max-w-[640px]" style={{ borderTop: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-5`} style={sectionLabelStyle}>Segurança</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase mb-2" style={{ letterSpacing: '0.1em' }}>Nova senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                placeholder="mínimo 8 caracteres"
                minLength={8}
                className="w-full px-4 py-3.5 text-[15px]"
                style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-col">
            {[
              ['Verificação em duas etapas por SMS', twoFactor, setTwoFactor],
              ['Encerrar sessões inativas em 30 dias', autoLogout, setAutoLogout],
              ['Exigir Gov.br para novos usuários', requireGovBr, setRequireGovBr],
            ].map(([label, val, set], i, arr) => (
              <label
                key={label as string}
                className="flex justify-between items-center cursor-pointer py-3.5"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
              >
                <span className="text-sm">{label as string}</span>
                <input
                  type="checkbox"
                  checked={val as boolean}
                  onChange={(e) => (set as (v: boolean) => void)(e.target.checked)}
                  className="w-[18px] h-[18px]"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
              </label>
            ))}
          </div>
          <button
            onClick={() => (newPassword ? onUpdatePassword() : toast('2FA e sessões ainda não disponíveis nesta versão.', 'info'))}
            disabled={passwordSaving}
            className="mt-6 text-left py-3.5 px-6 text-[15px] font-bold cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            {passwordSaving ? 'Salvando...' : 'Atualizar segurança'}
          </button>
        </div>
      </div>

      <div>
        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-3.5`} style={sectionLabelStyle}>Papéis</div>
          <div className="text-sm leading-[1.55]">
            {[
              ['Administrador', 'Cobrança, usuários e todos os perfis.'],
              ['Editor', 'Cria perfis e alertas nos temas liberados.'],
              ['Leitor', 'Consulta e favorita, sem editar alertas.'],
            ].map(([role, desc], i, arr) => (
              <div key={role} className="py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                <div className="font-extrabold">{role}</div>
                <div style={{ color: 'var(--color-neutral-700)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className={`${sectionLabel} mb-3.5`} style={sectionLabelStyle}>Sessões ativas</div>
          <p className="text-sm" style={{ color: 'var(--color-neutral-600)' }}>Gerenciamento de sessões ainda não disponível.</p>
        </div>
      </div>
    </div>
  );
}

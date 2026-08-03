'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth';
import { FormField } from '@/components/ui/FormField';

export function PasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem');
      return;
    }
    setStatus('saving');
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setStatus('idle');
      return;
    }
    setPassword('');
    setConfirm('');
    setStatus('saved');
  };

  return (
    <div className="py-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
        Trocar senha
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <FormField label="Nova senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 8 caracteres" minLength={8} />
        <FormField label="Confirmar senha" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="repita a senha" minLength={8} />
        {error && <p className="text-xs" style={{ color: 'var(--color-accent)' }}>{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === 'saving'}
            className="text-left py-3 px-5 text-sm font-bold cursor-pointer disabled:opacity-60"
            style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
          >
            {status === 'saving' ? 'Salvando...' : 'Salvar nova senha'}
          </button>
          {status === 'saved' && <span className="text-xs font-semibold" style={{ color: 'var(--color-accent-700)' }}>Senha atualizada.</span>}
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/auth';
import { FormField } from '@/components/ui/FormField';
import { track } from '@/lib/analytics';

export function CadastroForm() {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aceito, setAceito] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Senha deve ter no mínimo 8 caracteres'); return; }
    if (!aceito) { setError('Você precisa aceitar os termos'); return; }
    setLoading(true);
    const via = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('via') || 'direct') : 'direct';
    track('signup_started', { via });
    const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { nome, cnpj } } });
    if (err) {
      setError(err.message);
    } else {
      track('signup_completed', { via });
      router.push('/onboarding');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-[34px] font-black tracking-[-0.03em] mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
        Criar conta
      </h1>
      <p className="text-[15px] mb-8" style={{ color: 'var(--color-neutral-700)' }}>7 dias de plano Profissional, sem cartão.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ana Ribeiro" required />
          <FormField label="CNPJ" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
        </div>
        <FormField label="E-mail corporativo" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@empresa.com.br" required />
        <FormField label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="mínimo 8 caracteres" required minLength={8} />

        <label className="flex items-start gap-2.5 text-[13px] leading-[1.5] cursor-pointer" style={{ color: 'var(--color-neutral-700)' }}>
          <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)} className="w-4 h-4 mt-0.5" style={{ accentColor: 'var(--color-accent)' }} />
          Li e aceito os <Link href="/termos" className="underline" style={{ color: 'var(--color-accent)' }}>termos de uso</Link> e a{' '}
          <Link href="/privacidade" className="underline" style={{ color: 'var(--color-accent)' }}>política de privacidade</Link> (LGPD).
        </label>

        {error && <p className="text-xs" style={{ color: 'var(--color-accent)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-left py-4 px-5 text-base font-bold cursor-pointer disabled:opacity-60"
          style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
        >
          {loading ? 'Criando...' : 'Criar conta e escolher plano →'}
        </button>
      </form>
    </div>
  );
}

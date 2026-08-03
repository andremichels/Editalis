'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { FormField } from '@/components/ui/FormField';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    else router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-[34px] font-black tracking-[-0.03em] mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
        Acessar a plataforma
      </h1>
      <p className="text-[15px] mb-8" style={{ color: 'var(--color-neutral-700)' }}>A busca é exclusiva para assinantes.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField label="E-mail corporativo" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@empresa.com.br" required />
        <FormField label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--color-text)' }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4" style={{ accentColor: 'var(--color-accent)' }} />
            Manter conectado
          </label>
          <a href="#recuperar" className="hover:underline" style={{ color: 'var(--color-accent-700)' }}>Esqueci a senha</a>
        </div>

        {error && <p className="text-xs" style={{ color: 'var(--color-accent)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-left py-4 px-5 text-base font-bold cursor-pointer disabled:opacity-60"
          style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
        >
          {loading ? 'Entrando...' : 'Entrar →'}
        </button>

        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-neutral-500)' }}>
          <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
          OU
          <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
        </div>

        <button
          type="button"
          className="w-full text-left py-3.5 px-5 text-[15px] font-bold cursor-pointer"
          style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
        >
          Entrar com Gov.br
        </button>
      </form>
    </div>
  );
}

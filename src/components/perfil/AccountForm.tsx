'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import { FormField } from '@/components/ui/FormField';

export function AccountForm() {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setNome(data.user?.user_metadata?.nome ?? '');
      setCnpj(data.user?.user_metadata?.cnpj ?? '');
      setEmail(data.user?.email ?? '');
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    const { error } = await supabase.auth.updateUser({ email, data: { nome, cnpj } });
    setStatus(error ? 'error' : 'saved');
  };

  return (
    <div className="py-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
        Dados da conta
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <FormField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ana Ribeiro" />
        <FormField label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
        <FormField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === 'saving'}
            className="text-left py-3 px-5 text-sm font-bold cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            {status === 'saving' ? 'Salvando...' : 'Salvar alterações'}
          </button>
          {status === 'saved' && <span className="text-xs font-semibold" style={{ color: 'var(--color-accent-700)' }}>Salvo.</span>}
          {status === 'error' && <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>Não foi possível salvar.</span>}
        </div>
      </form>
    </div>
  );
}

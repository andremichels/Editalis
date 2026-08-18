'use client';

import { useState } from 'react';
import { AuthPromoPanel } from '@/components/auth/AuthPromoPanel';
import { LoginForm } from '@/components/auth/LoginForm';
import { CadastroForm } from '@/components/auth/CadastroForm';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'cadastro'>(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'cadastro' ? 'cadastro' : 'login'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <AuthPromoPanel />
      <div className="flex items-center px-6 sm:px-10 lg:px-14 py-16" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-[420px] mx-auto">
          <SegmentedControl
            fullWidth
            size="md"
            className="mb-8"
            options={[
              { value: 'login', label: 'Entrar' },
              { value: 'cadastro', label: 'Criar conta' },
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === 'login' ? <LoginForm /> : <CadastroForm />}
        </div>
      </div>
    </div>
  );
}

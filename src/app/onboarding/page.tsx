'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getVerticals, authFetch } from '@/lib/api';
import type { Vertical } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

export default function OnboardingPage() {
  const router = useRouter();
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVerticals().then(setVerticals).catch(() => setVerticals([]));
  }, []);

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const save = async (skip = false) => {
    setSaving(true);
    setError(null);
    try {
      // merge com preferências existentes (pra não sobrescrever UFs, etc.)
      const prefsRes = await authFetch(`${API_BASE}/api/v1/account/preferences`);
      const current = prefsRes.ok ? await prefsRes.json() : {};
      const body = { ...current, verticals: skip ? (current.verticals ?? []) : selected };
      const putRes = await authFetch(`${API_BASE}/api/v1/account/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!putRes.ok) throw new Error(`Falha ao salvar: ${putRes.status}`);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Não foi possível salvar. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div
              className="text-[13px] font-black uppercase tracking-[0.15em] mb-3"
              style={{ color: 'var(--color-accent)' }}
            >
              Personalize sua conta
            </div>
            <h1
              className="text-[34px] font-black tracking-[-0.03em] leading-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
            >
              Quais setores te interessam?
            </h1>
            <p className="text-[15px] mt-3 max-w-xl" style={{ color: 'var(--color-neutral-600)' }}>
              A gente filtra o feed e os alertas pros setores que você acompanha. Dá pra mudar
              depois no seu perfil.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-10">
            {verticals.length === 0 && (
              <div className="text-[13px]" style={{ color: 'var(--color-neutral-500)' }}>
                Carregando setores...
              </div>
            )}
            {verticals.map((v) => {
              const active = selected.includes(v.slug);
              return (
                <button
                  key={v.slug}
                  onClick={() => toggle(v.slug)}
                  className="py-2.5 px-5 text-sm font-bold cursor-pointer transition-all"
                  style={{
                    background: active ? 'var(--color-accent)' : 'transparent',
                    color: active ? '#fff' : 'var(--color-text)',
                    border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                  }}
                >
                  {v.name}
                </button>
              );
            })}
          </div>

          {error && (
            <div
              className="mb-6 p-4 text-sm font-bold"
              style={{ background: '#f8d7da', border: '2px solid #f5c6cb', color: '#721c24' }}
            >
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="py-3.5 px-8 text-sm font-black cursor-pointer"
              style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Salvando...' : 'Concluir'}
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="py-3.5 px-6 text-sm font-bold cursor-pointer"
              style={{ background: 'transparent', border: '2px solid var(--color-divider)', color: 'var(--color-neutral-600)' }}
            >
              Pular por enquanto
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

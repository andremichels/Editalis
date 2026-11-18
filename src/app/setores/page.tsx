'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UfPicker } from '@/components/ui/UfPicker';
import { authFetch, getVerticals } from '@/lib/api';
import type { Vertical } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';
const VALOR_PRESETS = [50000, 100000, 250000, 500000, 1000000];

type Status = 'idle' | 'saving' | 'saved' | 'error';

interface Prefs {
  verticals: string[];
  ufs_padrao: string[];
  valor_minimo_interesse: number | null;
  [k: string]: unknown;
}

/**
 * Setores, UFs e valor mínimo — o que filtra o Painel, a Busca ("só meu setor")
 * e os alertas. Tela comum do app (não o fluxo de boas-vindas), e cada mudança
 * salva sozinha.
 */
export default function SetoresPage() {
  const [verticals, setVerticals] = useState<Vertical[] | null>(null);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [valorText, setValorText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<Prefs | null>(null);

  useEffect(() => {
    getVerticals().then(setVerticals).catch(() => setVerticals([]));
    authFetch(`${API_BASE}/api/v1/account/preferences`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((p: Partial<Prefs>) => {
        const next: Prefs = {
          ...p,
          verticals: p.verticals ?? [],
          ufs_padrao: p.ufs_padrao ?? [],
          valor_minimo_interesse: p.valor_minimo_interesse ?? null,
        };
        latest.current = next;
        setPrefs(next);
        setValorText(next.valor_minimo_interesse != null ? String(next.valor_minimo_interesse) : '');
      })
      .catch(() => setPrefs({ verticals: [], ufs_padrao: [], valor_minimo_interesse: null }));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const persist = async () => {
    const body = latest.current;
    if (!body) return;
    setStatus('saving');
    try {
      const r = await authFetch(`${API_BASE}/api/v1/account/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, onboarding_completed: true }),
      });
      setStatus(r.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  };

  // Salva 600ms depois da última mudança (agrupa cliques seguidos).
  const update = (patch: Partial<Prefs>) => {
    if (!prefs) return;
    const next = { ...prefs, ...patch };
    latest.current = next;
    setPrefs(next);
    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(persist, 600);
  };

  const setValor = (text: string) => {
    setValorText(text);
    const n = text ? Number(text) : null;
    if (n === null || Number.isFinite(n)) update({ valor_minimo_interesse: n });
  };

  const toggleVertical = (slug: string) => {
    if (!prefs) return;
    const cur = prefs.verticals;
    update({ verticals: cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug] });
  };

  const statusText =
    status === 'saving' ? 'Salvando…' : status === 'saved' ? '✓ Salvo' : status === 'error' ? 'Não foi possível salvar — tente de novo' : 'As mudanças salvam sozinhas';

  const sectionLabel = 'text-[12px] font-bold uppercase mb-1';
  const sectionStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-700)' };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-6 sm:px-10 flex items-end justify-between gap-4 flex-wrap" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              Setores
            </h1>
            <div className="text-[13px] mt-1 max-w-xl" style={{ color: 'var(--color-neutral-700)' }}>
              Define o que aparece no Painel, o filtro “Somente meu setor” da Busca e a sugestão de novos alertas.
            </div>
          </div>
          <div
            className="text-[13px] font-bold"
            role="status"
            aria-live="polite"
            style={{ color: status === 'error' ? 'var(--color-accent)' : 'var(--color-neutral-700)' }}
          >
            {statusText}
          </div>
        </div>

        <div className="px-6 sm:px-10 py-8 max-w-3xl space-y-10">
          <section>
            <div className={sectionLabel} style={sectionStyle}>Setores</div>
            <p className="text-[14px] mb-3" style={{ color: 'var(--color-neutral-700)' }}>
              {prefs ? `${prefs.verticals.length} selecionado${prefs.verticals.length === 1 ? '' : 's'}` : ' '}
            </p>
            {verticals === null || prefs === null ? (
              <div className="flex flex-wrap gap-2.5">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 w-32 skeleton" />)}
              </div>
            ) : verticals.length === 0 ? (
              <p className="text-[14px]">Não foi possível carregar os setores.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {verticals.map((v) => {
                  const active = prefs.verticals.includes(v.slug);
                  return (
                    <button
                      key={v.slug}
                      onClick={() => toggleVertical(v.slug)}
                      aria-pressed={active}
                      className="py-2.5 px-4 text-[14px] font-bold cursor-pointer text-left"
                      style={{
                        background: active ? 'var(--color-text)' : 'transparent',
                        color: active ? 'var(--color-bg)' : 'var(--color-text)',
                        border: `2px solid ${active ? 'var(--color-text)' : 'var(--color-neutral-400)'}`,
                      }}
                    >
                      {active ? '✓ ' : ''}{v.name}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className={sectionLabel} style={sectionStyle}>Estados</div>
            <p className="text-[14px] mb-3" style={{ color: 'var(--color-neutral-700)' }}>
              {prefs && prefs.ufs_padrao.length === 0 ? 'Nenhum selecionado — vale para o Brasil todo.' : 'Toque no nome da região para marcar todas.'}
            </p>
            {prefs ? (
              <UfPicker value={prefs.ufs_padrao} onChange={(ufs) => update({ ufs_padrao: ufs })} />
            ) : (
              <div className="h-40 skeleton" />
            )}
          </section>

          <section>
            <div className={sectionLabel} style={sectionStyle}>Valor mínimo</div>
            <p className="text-[14px] mb-3" style={{ color: 'var(--color-neutral-700)' }}>
              Opcional. Publicações abaixo deste valor ficam fora do “Somente meu setor”.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-bold" style={{ color: 'var(--color-neutral-700)' }}>R$</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={valorText}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="qualquer valor"
                  aria-label="Valor mínimo em reais"
                  className="w-48 pl-10 pr-3 py-2.5 text-[15px] font-bold"
                  style={{ border: '2px solid var(--color-text)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>
              {VALOR_PRESETS.map((v) => (
                <button
                  key={v}
                  onClick={() => setValor(String(v))}
                  className="py-2.5 px-3 text-[13px] font-bold cursor-pointer"
                  style={{ border: '2px solid var(--color-neutral-400)', color: 'var(--color-text)', background: 'transparent' }}
                >
                  {v >= 1000000 ? `R$ ${v / 1000000} mi` : `R$ ${v / 1000} mil`}
                </button>
              ))}
              {valorText && (
                <button onClick={() => setValor('')} className="py-2.5 px-2 text-[13px] font-semibold underline cursor-pointer" style={{ color: 'var(--color-neutral-700)' }}>
                  limpar
                </button>
              )}
            </div>
          </section>

          <div className="pt-4" style={{ borderTop: '1px solid var(--color-divider)' }}>
            <Link href="/dashboard" className="text-[14px] font-bold underline" style={{ color: 'var(--color-text)' }}>
              Ver o Painel com estes setores →
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

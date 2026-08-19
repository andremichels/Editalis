'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getVerticals, authFetch } from '@/lib/api';
import type { Vertical } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const VALOR_PRESETS = [50000, 100000, 250000, 500000, 1000000];

const STEPS = [
  { title: 'Quais setores te interessam?', desc: 'A gente filtra o feed e os alertas pros setores que você acompanha. Dá pra mudar depois no seu perfil.' },
  { title: 'Em quais estados?', desc: 'Selecione as UFs onde você quer concorrer ou acompanhar licitações.' },
  { title: 'A partir de que valor?', desc: 'Opcional — deixe em branco se qualquer valor serve.' },
  { title: 'Ajustes finais', desc: 'Como você quer ver as licitações no painel.' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [valorMinimo, setValorMinimo] = useState('');
  const [toggles, setToggles] = useState({ abrir_painel_filtrado: false, ocultar_homologadas: false, favoritar_ao_baixar: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [currentPrefs, setCurrentPrefs] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await getVerticals();
        setVerticals(all);
        const prefsRes = await authFetch(`${API_BASE}/api/v1/account/preferences`);
        const prefs = prefsRes.ok ? await prefsRes.json() : {};
        setCurrentPrefs(prefs);
        setSelected(prefs.verticals ?? []);
        setUfs(prefs.ufs_padrao ?? []);
        setValorMinimo(prefs.valor_minimo_interesse != null ? String(prefs.valor_minimo_interesse) : '');
        setToggles({
          abrir_painel_filtrado: !!prefs.abrir_painel_filtrado,
          ocultar_homologadas: !!prefs.ocultar_homologadas,
          favoritar_ao_baixar: !!prefs.favoritar_ao_baixar,
        });
      } catch {
        // mantém os defaults
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  const toggleVertical = (slug: string) =>
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const toggleUf = (uf: string) =>
    setUfs((prev) => (prev.includes(uf) ? prev.filter((u) => u !== uf) : [...prev, uf]));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      // Reusa as prefs já carregadas no mount (evita um GET redundante que
      // dobrava a latência do redirect). Só re-busca se por algum motivo
      // ainda não tiver carregado.
      let current = currentPrefs;
      if (!current || Object.keys(current).length === 0) {
        const prefsRes = await authFetch(`${API_BASE}/api/v1/account/preferences`);
        current = prefsRes.ok ? await prefsRes.json() : {};
      }
      const body = {
        ...current,
        verticals: selected,
        ufs_padrao: ufs,
        valor_minimo_interesse: valorMinimo ? parseFloat(valorMinimo) : null,
        abrir_painel_filtrado: toggles.abrir_painel_filtrado,
        ocultar_homologadas: toggles.ocultar_homologadas,
        favoritar_ao_baixar: toggles.favoritar_ao_baixar,
        onboarding_completed: true,
      };
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

  const last = step === STEPS.length - 1;

  const chipStyle = (active: boolean) => ({
    background: active ? 'var(--color-accent)' : 'transparent',
    color: active ? '#fff' : 'var(--color-text)',
    border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`,
  });

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-2xl">
          {/* progresso */}
          <div className="mb-8">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-neutral-500)' }}>
                Passo {step + 1} de {STEPS.length}
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'var(--color-neutral-500)' }}>
                {Math.round(((step + 1) / STEPS.length) * 100)}%
              </span>
            </div>
            <div className="h-1 w-full" style={{ background: 'var(--color-divider)' }}>
              <div className="h-1" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'var(--color-accent)', transition: 'width 0.25s ease' }} />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-[30px] sm:text-[34px] font-black tracking-[-0.03em] leading-tight" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              {STEPS[step].title}
            </h1>
            <p className="text-[15px] mt-2 max-w-xl" style={{ color: 'var(--color-neutral-600)' }}>
              {STEPS[step].desc}
            </p>
          </div>

          {/* PASSO 1 — setores */}
          {step === 0 && (
            <div className="flex flex-wrap gap-2.5 min-h-[60px]">
              {!loaded && <div className="text-[13px]" style={{ color: 'var(--color-neutral-500)' }}>Carregando setores...</div>}
              {verticals.map((v) => {
                const active = selected.includes(v.slug);
                return (
                  <button key={v.slug} onClick={() => toggleVertical(v.slug)} className="py-2.5 px-5 text-sm font-bold cursor-pointer transition-all" style={chipStyle(active)}>
                    {v.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* PASSO 2 — UFs */}
          {step === 1 && (
            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {UFS.map((uf) => {
                const active = ufs.includes(uf);
                return (
                  <button key={uf} onClick={() => toggleUf(uf)} className="py-2 px-4 text-sm font-bold cursor-pointer transition-all" style={chipStyle(active)}>
                    {uf}
                  </button>
                );
              })}
            </div>
          )}

          {/* PASSO 3 — valor mínimo */}
          {step === 2 && (
            <div className="max-w-[420px]">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold" style={{ color: 'var(--color-neutral-500)' }}>R$</span>
                <input
                  type="number"
                  min={0}
                  value={valorMinimo}
                  onChange={(e) => setValorMinimo(e.target.value)}
                  placeholder="100.000"
                  className="w-full pl-11 pr-4 py-4 text-[18px] font-bold"
                  style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)', color: 'var(--color-text)' }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {VALOR_PRESETS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setValorMinimo(String(v))}
                    className="py-2 px-4 text-[13px] font-bold cursor-pointer"
                    style={{ background: 'transparent', border: '2px solid var(--color-divider)', color: 'var(--color-text)' }}
                  >
                    R$ {(v / 1000).toLocaleString('pt-BR')} mil
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASSO 4 — toggles */}
          {step === 3 && (
            <div className="max-w-[520px]" style={{ borderTop: '2px solid var(--color-text)' }}>
              {[
                { key: 'abrir_painel_filtrado' as const, label: 'Abrir o painel já filtrado pelas UFs padrão' },
                { key: 'ocultar_homologadas' as const, label: 'Ocultar licitações já homologadas nos resultados' },
                { key: 'favoritar_ao_baixar' as const, label: 'Marcar automaticamente como favorita ao baixar o edital' },
              ].map((t, i) => (
                <label key={t.key} className="flex justify-between items-center cursor-pointer py-4" style={{ borderBottom: i < 2 ? '1px solid var(--color-divider)' : 'none' }}>
                  <span className="text-[15px]" style={{ color: 'var(--color-text)' }}>{t.label}</span>
                  <input
                    type="checkbox"
                    checked={toggles[t.key]}
                    onChange={(e) => setToggles((prev) => ({ ...prev, [t.key]: e.target.checked }))}
                    className="w-[18px] h-[18px] shrink-0"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                </label>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 text-sm font-bold" style={{ background: '#f8d7da', border: '2px solid #f5c6cb', color: '#721c24' }}>
              {error}
            </div>
          )}

          {saving && (
            <div className="mt-8">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[13px] font-bold" style={{ color: 'var(--color-text)' }}>
                  Salvando suas preferências…
                </span>
              </div>
              <div className="ed-progress" role="progressbar" aria-label="Salvando preferências" />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mt-10">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || saving}
              className="py-3.5 px-6 text-sm font-bold cursor-pointer disabled:opacity-40"
              style={{ background: 'transparent', border: '2px solid var(--color-divider)', color: 'var(--color-text)' }}
            >
              Voltar
            </button>
            {last ? (
              <button
                onClick={save}
                disabled={saving}
                className="py-3.5 px-8 text-sm font-black cursor-pointer disabled:opacity-60"
                style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
              >
                {saving ? 'Salvando...' : 'Concluir'}
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="py-3.5 px-8 text-sm font-black cursor-pointer"
                style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
              >
                Continuar
              </button>
            )}
          </div>

          {/* skip discreto — de propósito apagado */}
          <div className="mt-10 text-center">
            <button
              onClick={save}
              disabled={saving}
              className="text-xs font-medium cursor-pointer hover:opacity-70"
              style={{ color: 'var(--color-neutral-400)', opacity: 0.65, textDecoration: 'none' }}
            >
              pular por enquanto
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

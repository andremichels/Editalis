'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchResultItem } from '@/components/busca/SearchResultItem';
import { useFavorites } from '@/lib/useFavorites';
import type { Article } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

export default function CnpjBuscaPage() {
  const { toggle, isFavorite } = useFavorites();
  const [cnpj, setCnpj] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = cnpj.replace(/\D/g, '');
    if (raw.length < 8) { setError('CNPJ inválido — mínimo 8 dígitos'); return; }
    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/search/cnpj/${raw}`);
      if (!res.ok) throw new Error('Erro na busca');
      const data = await res.json();
      setResults(Array.isArray(data) ? data : data.results || []);
    } catch {
      setResults([]);
      setError('Erro ao buscar CNPJ');
    }
    setLoading(false);
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <h1 className="text-[30px] font-black tracking-[-0.03em] mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            Busca por CNPJ
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--color-neutral-600)' }}>
            Encontre todas as publicações do DOU que mencionam um CNPJ específico
          </p>
        </div>

        <div className="px-10 py-6">
          <form onSubmit={handleSearch} className="flex mb-6" style={{ border: '2px solid var(--color-text)' }}>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0001-00"
              className="flex-1 px-4 py-3 text-lg bg-transparent outline-none"
              style={{ fontFamily: 'monospace', color: 'var(--color-text)' }}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 text-sm font-bold cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none' }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {error && (
            <div className="mb-4 p-3 text-sm" style={{ background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }}>
              {error}
            </div>
          )}

          {!searched ? (
            <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
              Digite um CNPJ para buscar publicações relacionadas.
            </p>
          ) : loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 skeleton" />)}
            </div>
          ) : results.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
              Nenhum resultado encontrado para este CNPJ.
            </p>
          ) : (
            <div>
              <div className="text-xs mb-4" style={{ color: 'var(--color-neutral-600)' }}>
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </div>
              <div style={{ borderTop: '2px solid var(--color-text)' }}>
                {results.map((a) => (
                  <SearchResultItem
                    key={a.id}
                    article={a}
                    favorita={isFavorite(a.id)}
                    onToggleFavorita={() => toggle(a.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

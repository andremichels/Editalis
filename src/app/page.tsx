'use client';

import { useState, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { SearchBar } from '@/components/search/SearchBar';
import { ArticleList } from '@/components/articles/ArticleList';
import { Article } from '@/lib/types';
import { searchArticles } from '@/lib/api';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const result = await searchArticles({ q: query, limit: 30 });
      setArticles(result.articles);
    } catch {
      setError('Erro ao buscar. Tente novamente.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero — flush left, no centering */}
        <div className="mb-12" style={{ borderBottom: '2px solid var(--color-divider)', paddingBottom: '2rem' }}>
          <h1
            className="text-4xl sm:text-5xl leading-none mb-3 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-text)' }}
          >
            Diário Oficial
            <br />
            <span style={{ color: 'var(--color-accent)' }}>da União</span>
          </h1>
          <p
            className="text-sm max-w-xl"
            style={{ color: 'var(--color-neutral-600)' }}
          >
            Pesquise portarias, licitações, nomeações e outros atos oficiais
            publicados no DOU.
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Error */}
        {error && (
          <div
            className="p-4 mb-8 text-sm"
            style={{
              background: 'var(--color-accent-100)',
              color: 'var(--color-accent-700)',
              borderLeft: '4px solid var(--color-accent)',
            }}
          >
            {error}
          </div>
        )}

        {/* Empty state before search */}
        {!searched && !loading && (
          <div className="py-16">
            <p style={{ color: 'var(--color-neutral-500)' }} className="text-sm">
              Digite um termo com pelo menos 3 caracteres para buscar.
            </p>
          </div>
        )}

        {/* Results */}
        <ArticleList articles={articles} loading={loading} />
      </div>
    </PageLayout>
  );
}

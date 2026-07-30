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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Busca no Diário Oficial da União
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Pesquise portarias, licitações, nomeações e outros atos oficiais
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto max-w-2xl mb-8">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Results */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              Digite um termo com pelo menos 3 caracteres para buscar
            </p>
          </div>
        )}

        <ArticleList articles={articles} loading={loading} />
      </div>
    </PageLayout>
  );
}

'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchHeader } from '@/components/busca/SearchHeader';
import { SearchFilters } from '@/components/busca/SearchFilters';
import { SearchResultsHeader } from '@/components/busca/SearchResultsHeader';
import { SearchResultItem } from '@/components/busca/SearchResultItem';
import { Pagination } from '@/components/busca/Pagination';
import { bids } from '@/lib/bids';

export default function BuscaPage() {
  const [favoritas, setFavoritas] = useState(() => new Set(bids.filter((b) => b.favoritaPadrao).map((b) => b.id)));

  const toggleFavorita = (id: number) => {
    setFavoritas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <SearchHeader initialQuery='("reforma" OU "manutenção predial") NÃO "hospitalar"' />
        <div className="grid grid-cols-[268px_1fr]" style={{ minHeight: 600 }}>
          <SearchFilters />
          <div className="min-w-0">
            <SearchResultsHeader total="2.418" elapsed="0,42 s" />
            {bids.map((bid) => (
              <SearchResultItem
                key={bid.id}
                bid={bid}
                favorita={favoritas.has(bid.id)}
                onToggleFavorita={() => toggleFavorita(bid.id)}
              />
            ))}
            <Pagination pages={3} current={1} />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BidDetailHeader } from '@/components/licitacao/BidDetailHeader';
import { BidObjectSection } from '@/components/licitacao/BidObjectSection';
import { BidSidebar } from '@/components/licitacao/BidSidebar';
import { getBidById } from '@/lib/bids';

export default function LicitacaoPage() {
  const params = useParams<{ id: string }>();
  const bid = getBidById(Number(params.id));
  const [favorita, setFavorita] = useState(bid?.favoritaPadrao ?? false);

  if (!bid) notFound();

  return (
    <AuthGuard>
      <DashboardLayout>
        <BidDetailHeader bid={bid} favorita={favorita} onToggleFavorita={() => setFavorita((f) => !f)} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
          <BidObjectSection bid={bid} />
          <BidSidebar bid={bid} />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricsBar } from '@/components/dashboard/MetricsBar';
import { BidList } from '@/components/dashboard/BidList';
import { DeadlinesCard } from '@/components/dashboard/DeadlinesCard';
import { ProfilesCard } from '@/components/dashboard/ProfilesCard';
import { VolumeChart } from '@/components/dashboard/VolumeChart';
import { bids } from '@/lib/bids';

const destaques = bids.slice(0, 5);

const prazos = [
  { title: 'Pregão 114/2026 · Campinas', days: 'abertura em 2 dias', tone: 'urgent' as const },
  { title: 'Concorrência 07/2026 · DER-MG', days: 'abertura em 4 dias', tone: 'default' as const },
  { title: 'Dispensa 22/2026 · UFMG', days: 'abertura em 6 dias', tone: 'later' as const },
];

const perfis = [
  { name: 'Obras civis SP/MG', count: '+18' },
  { name: 'Manutenção predial', count: '+11' },
  { name: 'Reformas escolares', count: '+8' },
];

const volume = [46, 62, 38, 74, 58, 88, 100];

export default function DashboardPage() {
  const router = useRouter();

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const metrics = [
    { label: 'Licitações na base', value: '9.243.118' },
    { label: 'Compatíveis hoje', value: '37', accent: true },
    { label: 'Favoritas', value: '14' },
    { label: 'Fecham em 7 dias', value: '5' },
  ];

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10 flex items-center justify-between" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Painel</h1>
            <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-600)' }}>{hoje} · última varredura às 06h30</div>
          </div>
          <button
            onClick={() => router.push('/busca')}
            className="text-left py-3 px-5 text-sm font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            Nova busca
          </button>
        </div>

        <MetricsBar metrics={metrics} />

        <div className="grid grid-cols-[1fr_340px]">
          <BidList
            title="Novas para o seu perfil"
            bids={destaques}
            viewAllHref="/busca"
            viewAllLabel="Ver todas as 37"
          />
          <div>
            <DeadlinesCard items={prazos} />
            <ProfilesCard items={perfis} onManage={() => router.push('/alertas')} />
            <VolumeChart values={volume} startLabel="24/07" endLabel="hoje" />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

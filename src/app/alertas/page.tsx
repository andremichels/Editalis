import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertProfileCard } from '@/components/alertas/AlertProfileCard';
import { SendPreferences } from '@/components/alertas/SendPreferences';
import { FavoritesSidebar } from '@/components/alertas/FavoritesSidebar';
import { alertProfiles } from '@/lib/alertProfiles';

export default function AlertasPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10 flex items-center justify-between" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Alertas e favoritas</h1>
            <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-600)' }}>3 de 25 perfis usados no plano Profissional</div>
          </div>
          <button
            className="text-left py-3 px-5 text-sm font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            Novo perfil de alerta
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px]">
          <div className="py-7 px-10" style={{ borderRight: '2px solid var(--color-text)' }}>
            <div className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
              Perfis monitorados
            </div>
            <div style={{ borderTop: '2px solid var(--color-text)' }}>
              {alertProfiles.map((profile) => (
                <AlertProfileCard key={profile.name} profile={profile} />
              ))}
            </div>
            <SendPreferences />
          </div>
          <FavoritesSidebar />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

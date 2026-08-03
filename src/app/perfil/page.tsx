import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccountForm } from '@/components/perfil/AccountForm';
import { PasswordForm } from '@/components/perfil/PasswordForm';
import { PlanCard } from '@/components/perfil/PlanCard';

export default function PerfilPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Perfil</h1>
          <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-600)' }}>Dados da conta, senha e assinatura</div>
        </div>

        <AccountForm />
        <PasswordForm />
        <PlanCard />

        <div className="py-7 px-10">
          <div className="text-[11px] font-bold uppercase mb-3" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
            Notificações
          </div>
          <p className="text-sm max-w-md" style={{ color: 'var(--color-neutral-700)' }}>
            Canais e frequência de envio dos alertas são gerenciados em{' '}
            <Link href="/alertas" className="font-bold underline" style={{ color: 'var(--color-accent)' }}>
              Alertas e favoritas
            </Link>.
          </p>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

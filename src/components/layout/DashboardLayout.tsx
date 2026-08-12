'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <OnboardingModal />
      <MobileNav />

      {/* Desktop + tablet layout */}
      <div className="grid lg:grid-cols-[232px_1fr] min-h-screen">
        <aside className="hidden lg:block" style={{ borderRight: '2px solid var(--color-divider)', background: 'var(--color-surface)' }}>
          <Sidebar />
        </aside>
        <div style={{ background: 'var(--color-bg)' }} className="min-w-0 pb-16 lg:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
}

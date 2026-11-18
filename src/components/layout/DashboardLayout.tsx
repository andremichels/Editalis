'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { rememberListPage } from '@/lib/backLink';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) rememberListPage(pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <OnboardingModal />
      <div className="print:hidden">
        <MobileNav />
      </div>

      {/* Desktop + tablet layout */}
      <div className="grid lg:grid-cols-[232px_1fr] min-h-screen print:block">
        <aside className="hidden lg:block print:hidden sticky top-0 h-screen self-start" style={{ borderRight: '2px solid var(--color-divider)', background: 'var(--color-surface)' }}>
          <Sidebar />
        </aside>
        <div style={{ background: 'var(--color-bg)' }} className="min-w-0 pb-16 lg:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
}

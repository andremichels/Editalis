'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <OnboardingModal />
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 px-3 py-2 text-sm font-bold"
        style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="w-56 h-full overflow-y-auto"
            style={{ borderRight: '2px solid var(--color-divider)', background: 'var(--color-surface)' }}
          >
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop + tablet layout */}
      <div className="grid lg:grid-cols-[232px_1fr] min-h-screen">
        <aside className="hidden lg:block" style={{ borderRight: '2px solid var(--color-divider)', background: 'var(--color-surface)' }}>
          <Sidebar />
        </aside>
        <div style={{ background: 'var(--color-bg)' }} className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

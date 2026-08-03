import { Sidebar } from '@/components/dashboard/Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[232px_1fr] min-h-screen">
      <Sidebar />
      <div style={{ background: 'var(--color-bg)' }} className="min-w-0">
        {children}
      </div>
    </div>
  );
}

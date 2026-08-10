'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

interface OrganItem {
  name: string;
  count: number;
}

export default function OrgaosPage() {
  const router = useRouter();
  const [organs, setOrgans] = useState<OrganItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const url = search
      ? `${API_BASE}/api/v1/organs?q=${encodeURIComponent(search)}`
      : `${API_BASE}/api/v1/organs`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setOrgans(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10 flex items-center justify-between" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
              Órgãos
            </h1>
            <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-600)' }}>
              {organs.length} órgãos indexados
            </div>
          </div>
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setLoading(true); }}
              placeholder="Filtrar órgão..."
              className="px-3 py-2 text-sm"
              style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}
            />
          </div>
        </div>

        <div className="px-10 py-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-10 skeleton" />)}
            </div>
          ) : organs.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>Nenhum órgão encontrado.</p>
          ) : (
            <div style={{ borderTop: '2px solid var(--color-text)' }}>
              {organs.map((org) => (
                <div
                  key={org.name}
                  className="flex items-center justify-between py-3.5 px-2 cursor-pointer hover:opacity-80"
                  style={{ borderBottom: '1px solid var(--color-divider)' }}
                  onClick={() => router.push(`/busca?organ=${encodeURIComponent(org.name)}`)}
                >
                  <span className="text-[15px] font-bold">{org.name}</span>
                  <span className="text-[13px] font-bold" style={{ color: 'var(--color-accent)' }}>
                    {org.count.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

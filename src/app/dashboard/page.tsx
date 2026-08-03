"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/auth";
import { Star, Clock, AlertTriangle } from "lucide-react";

// Mock data — will be replaced with API calls
interface Bid {
  id: number;
  title: string;
  organ: string;
  value: string;
  deadline: string;
  modality: string;
  starred: boolean;
}

const mockBids: Bid[] = [
  { id: 1, title: "Pregão eletrônico 114/2026 · SP", organ: "Prefeitura de Campinas", value: "R$ 2.400.000", deadline: "11/08/2026", modality: "Pregão Eletrônico", starred: false },
  { id: 2, title: "Dispensa 22/2026 · MG", organ: "Universidade Federal de Minas Gerais", value: "R$ 890.000", deadline: "05/08/2026", modality: "Dispensa", starred: true },
  { id: 3, title: "Concorrência 08/2026 · RJ", organ: "Prefeitura do Rio de Janeiro", value: "R$ 5.100.000", deadline: "20/08/2026", modality: "Concorrência", starred: false },
  { id: 4, title: "Tomada de Preços 03/2026 · PR", organ: "Governo do Estado do Paraná", value: "R$ 1.750.000", deadline: "15/08/2026", modality: "Tomada de Preços", starred: false },
  { id: 5, title: "Pregão 089/2026 · BA", organ: "Prefeitura de Salvador", value: "R$ 3.200.000", deadline: "08/08/2026", modality: "Pregão Eletrônico", starred: true },
];

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [bids, setBids] = useState<Bid[]>(mockBids);
  const [filter, setFilter] = useState<"all" | "urgent" | "favorites">("all");
  const [newToday, setNewToday] = useState(1284);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleStar = (id: number) => {
    setBids(prev => prev.map(b => b.id === id ? { ...b, starred: !b.starred } : b));
  };

  const filtered = filter === "favorites" ? bids.filter(b => b.starred) :
    filter === "urgent" ? bids.filter(b => {
      const [d, m, y] = b.deadline.split("/");
      const deadline = new Date(+y, +m - 1, +d);
      const now = new Date();
      const diff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 2;
    }) : bids;

  return (
    <AuthGuard>
      <PageLayout>
        {/* Header bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-6" style={{ background: "var(--color-surface)", borderBottom: "2px solid var(--color-divider)" }}>
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div>
              <h1 className="text-2xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
                Painel
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-neutral-600)" }}>
                {email}
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>Novas licitações desde ontem</p>
                <p className="text-xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-accent)" }}>
                  {newToday.toLocaleString()}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>Sair</Button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8" style={{ background: "var(--color-bg)" }}>
          <div className="mx-auto max-w-7xl">
            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-8" style={{ border: "2px solid var(--color-divider)" }}>
              {[
                { label: "Novos matches", value: "47", icon: <Star size={16} /> },
                { label: "Prazos esta semana", value: "12", icon: <Clock size={16} /> },
                { label: "Favoritas", value: "8", icon: <Star size={16} /> },
                { label: "Monitorados", value: "3 perfis", icon: <AlertTriangle size={16} /> },
              ].map((m, i) => (
                <div key={i} className="p-5" style={{
                  borderRight: i < 3 ? "2px solid var(--color-divider)" : "none",
                }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: "var(--color-accent)" }}>{m.icon}</span>
                    <span className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{m.label}</span>
                  </div>
                  <p className="text-2xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
              {[
                { key: "all", label: "Todos" },
                { key: "urgent", label: "Urgência (48h)" },
                { key: "favorites", label: "Favoritas" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className="px-4 py-2 text-xs"
                  style={{
                    background: filter === f.key ? "var(--color-accent)" : "var(--color-surface)",
                    color: filter === f.key ? "#fff" : "var(--color-text)",
                    border: "2px solid var(--color-divider)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: filter === f.key ? 800 : 400,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Bid cards */}
            <div className="space-y-0" style={{ border: "2px solid var(--color-divider)" }}>
              {filtered.map((bid, i) => (
                <div
                  key={bid.id}
                  className="p-4 flex items-center gap-4"
                  style={{
                    background: "var(--color-surface)",
                    borderBottom: i < filtered.length - 1 ? "2px solid var(--color-divider)" : "none",
                  }}
                >
                  <button
                    onClick={() => toggleStar(bid.id)}
                    className="shrink-0"
                    style={{ color: bid.starred ? "var(--color-accent)" : "var(--color-neutral-500)" }}
                  >
                    <Star size={18} fill={bid.starred ? "currentColor" : "none"} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>
                      {bid.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-neutral-600)" }}>{bid.organ}</p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-sm" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
                      {bid.value}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{bid.modality}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>Prazo</p>
                    <p className="text-sm" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-accent)" }}>
                      {bid.deadline}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/artigo/${bid.id}`)}>
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}

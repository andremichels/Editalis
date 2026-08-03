"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [articleCount, setArticleCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || "");
    });
    // Fetch article count
    fetch("https://editalis-api.smartpeople.us/api/v1/admin/stats")
      .then(r => r.json())
      .then(d => setArticleCount(d.total_articles || 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthGuard>
      <PageLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-12" style={{ background: "var(--color-bg)" }}>
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
                  Dashboard
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-neutral-600)" }}>
                  {email}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => router.push("/busca")}>
                  Buscar licitações
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <Card>
                <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>Licitações monitoradas</p>
                <p className="text-3xl mt-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>{articleCount.toLocaleString()}</p>
              </Card>
              <Card>
                <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>Alertas ativos</p>
                <p className="text-3xl mt-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>0</p>
              </Card>
              <Card>
                <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>Favoritas</p>
                <p className="text-3xl mt-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>0</p>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}

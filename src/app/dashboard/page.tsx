"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { Search } from "lucide-react";
import { supabase } from "@/lib/auth";

interface Bid {
  modalidade: string;
  orgao: string;
  uf: string;
  objeto: string;
  valor: string;
  abertura: string;
}

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [destaques] = useState<Bid[]>([
    { modalidade: "PREGÃO ELETRÔNICO", orgao: "Prefeitura de Campinas", uf: "SP", objeto: "Aquisição de equipamentos de informática para a rede municipal de ensino", valor: "R$ 2.400.000", abertura: "11/08/2026" },
    { modalidade: "CONCORRÊNCIA", orgao: "DER-MG", uf: "MG", objeto: "Obras de pavimentação e drenagem na rodovia MG-050", valor: "R$ 8.700.000", abertura: "15/08/2026" },
    { modalidade: "PREGÃO ELETRÔNICO", orgao: "Governo do Estado do Paraná", uf: "PR", objeto: "Serviços continuados de manutenção predial com fornecimento de materiais", valor: "R$ 1.750.000", abertura: "20/08/2026" },
    { modalidade: "DISPENSA", orgao: "UFMG", uf: "MG", objeto: "Serviços de manutenção corretiva e preventiva em equipamentos laboratoriais", valor: "R$ 890.000", abertura: "05/08/2026" },
    { modalidade: "PREGÃO ELETRÔNICO", orgao: "Prefeitura de Salvador", uf: "BA", objeto: "Fornecimento de mobiliário escolar para 42 unidades da rede municipal", valor: "R$ 3.200.000", abertura: "08/08/2026" },
  ]);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);

  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <AuthGuard>
      <PageLayout>
        {/* Header */}
        <div style={{ padding: "28px 40px", borderBottom: "2px solid var(--color-text)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", margin: 0 }}>Painel</h1>
            <div style={{ fontSize: 13, color: "var(--color-neutral-600)", marginTop: 4 }}>{hoje} · última varredura às 06h30</div>
          </div>
          <button
            onClick={() => router.push("/busca")}
            style={{ appearance: "none", background: "var(--color-accent)", border: "2px solid var(--color-accent)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "12px 20px", cursor: "pointer", textAlign: "left" }}
          >
            Nova busca
          </button>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "2px solid var(--color-text)" }}>
          {[
            { label: "Licitações na base", value: "9.243.118" },
            { label: "Compatíveis hoje", value: "37", color: "var(--color-accent)" },
            { label: "Favoritas", value: "14" },
            { label: "Fecham em 7 dias", value: "5" },
          ].map((m, i) => (
            <div key={i} style={{ padding: "28px 24px", borderRight: i < 3 ? "1px solid var(--color-divider)" : "none" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>{m.label}</div>
              <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-0.03em", marginTop: 8, color: m.color || "var(--color-text)" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Main content: list + sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px" }}>
          {/* Left: bid list */}
          <div style={{ borderRight: "2px solid var(--color-text)", minWidth: 0 }}>
            <div style={{ padding: "24px 40px 16px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>Novas para o seu perfil</h2>
              <a href="/busca" onClick={(e) => { e.preventDefault(); router.push("/busca"); }} style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)" }}>
                Ver todas as 37 →
              </a>
            </div>
            <div style={{ padding: "0 40px 40px" }}>
              <div style={{ borderTop: "2px solid var(--color-text)" }}>
                {destaques.map((l, i) => (
                  <div key={i}
                    onClick={() => router.push(`/artigo/${i + 1}`)}
                    style={{ padding: "18px 0", borderBottom: "1px solid var(--color-divider)", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--color-accent-200)", color: "var(--color-accent-800)", padding: "3px 7px" }}>{l.modalidade}</span>
                        <span style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{l.orgao} · {l.uf}</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{l.objeto}</div>
                    </div>
                    <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>{l.valor}</div>
                      <div style={{ fontSize: 12, color: "var(--color-neutral-600)", marginTop: 4 }}>abre {l.abertura}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            {/* Deadlines */}
            <div style={{ padding: 24, borderBottom: "2px solid var(--color-text)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 14 }}>Prazos desta semana</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { title: "Pregão 114/2026 · Campinas", days: "abertura em 2 dias", urgent: true },
                  { title: "Concorrência 07/2026 · DER-MG", days: "abertura em 4 dias", urgent: false },
                  { title: "Dispensa 22/2026 · UFMG", days: "abertura em 6 dias", urgent: false },
                ].map((p, i) => (
                  <div key={i} style={{ borderLeft: `4px solid ${p.urgent ? "var(--color-accent)" : i === 1 ? "var(--color-text)" : "var(--color-neutral-400)"}`, paddingLeft: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{p.days}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profiles */}
            <div style={{ padding: 24, borderBottom: "2px solid var(--color-text)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 14 }}>Perfis monitorados</div>
              {[
                { name: "Obras civis SP/MG", count: "+18" },
                { name: "Manutenção predial", count: "+11" },
                { name: "Reformas escolares", count: "+8" },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "0 0 10px 0" }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>{p.count}</span>
                </div>
              ))}
              <button
                onClick={() => router.push("/alertas")}
                style={{ marginTop: 16, appearance: "none", background: "transparent", border: "2px solid var(--color-text)", color: "var(--color-text)", fontSize: 13, fontWeight: 700, padding: "10px 16px", cursor: "pointer", width: "100%" }}
              >
                Gerenciar alertas
              </button>
            </div>

            {/* Volume chart */}
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 14 }}>Volume por dia</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 88 }}>
                {[46, 62, 38, 74, 58, 88, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? "var(--color-accent)" : "var(--color-neutral-400)" }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-neutral-600)", marginTop: 8 }}>
                <span>24/07</span><span>hoje</span>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}

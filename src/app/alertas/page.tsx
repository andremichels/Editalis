"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";
const MODALITIES = ["pregao", "pregao_eletronico", "concorrencia", "dispensa", "inexigibilidade", "tomada_precos", "concurso", "leilao", "rdc"];

interface AlertProfile {
  id: number;
  name: string;
  keywords: string[];
  organs: string[];
  ufs: string[];
  modalities: string[];
  value_min: number | null;
  value_max: number | null;
  enabled: boolean;
  match_count: number;
  created_at: string;
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", keywords: "", organs: "", ufs: "", modalities: "", value_min: "", value_max: "" });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUserId(data.session.user.id);
    });
  }, []);

  const load = () => {
    if (!userId) return;
    fetch(`${API_BASE}/api/v1/alerts?user_id=${userId}`)
      .then((r) => r.json())
      .then(setAlerts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (userId) load(); }, [userId]);

  const handleCreate = async () => {
    console.log("handleCreate called", { name: form.name, userId });
    if (!form.name) return;
    if (!userId) {
      toast("Erro: usuário não autenticado", "error");
      return;
    }
    const body = {
      name: form.name,
      keywords: form.keywords.split(",").map((s) => s.trim()).filter(Boolean),
      organs: form.organs.split(",").map((s) => s.trim()).filter(Boolean),
      ufs: form.ufs.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
      modalities: form.modalities.split(",").map((s) => s.trim()).filter(Boolean),
      value_min: form.value_min ? parseFloat(form.value_min) : null,
      value_max: form.value_max ? parseFloat(form.value_max) : null,
    };

    const res = await fetch(`${API_BASE}/api/v1/alerts?user_id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast("Alerta criado", "success");
      setShowForm(false);
      setForm({ name: "", keywords: "", organs: "", ufs: "", modalities: "", value_min: "", value_max: "" });
      load();
    } else {
      const err = await res.text();
      toast("Erro ao criar alerta: " + err, "error");
    }
  };

  const handleToggle = async (alert: AlertProfile) => {
    await fetch(`${API_BASE}/api/v1/alerts/${alert.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !alert.enabled }),
    });
    load();
  };

  const handleDelete = async (alert: AlertProfile) => {
    if (!confirm(`Remover alerta "${alert.name}"?`)) return;
    await fetch(`${API_BASE}/api/v1/alerts/${alert.id}`, { method: "DELETE" });
    toast("Alerta removido", "success");
    load();
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10 flex items-center justify-between" style={{ borderBottom: "2px solid var(--color-text)" }}>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>
              Alertas
            </h1>
            <div className="text-[13px] mt-1" style={{ color: "var(--color-neutral-600)" }}>
              {alerts.length} perfil{alerts.length !== 1 ? "s" : ""} configurado{alerts.length !== 1 ? "s" : ""}
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "+ Novo alerta"}
          </Button>
        </div>

        <div className="px-10 py-6">
          {showForm && (
            <div className="mb-6 p-5" style={{ border: "2px solid var(--color-divider)", background: "var(--color-surface)" }}>
              <h3 className="text-sm font-extrabold mb-4" style={{ fontFamily: "var(--font-heading)" }}>Novo perfil de alerta</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Nome *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm" style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }}
                    placeholder="Ex: Obras em SP" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Modalidades (vírgula)</label>
                  <input value={form.modalities} onChange={(e) => setForm({ ...form, modalities: e.target.value })}
                    className="w-full px-3 py-2 text-sm" style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }}
                    placeholder="pregao, concorrencia" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Palavras-chave (vírgula)</label>
                  <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                    className="w-full px-3 py-2 text-sm" style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }}
                    placeholder="obras, reforma" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">UFs (vírgula)</label>
                  <input value={form.ufs} onChange={(e) => setForm({ ...form, ufs: e.target.value })}
                    className="w-full px-3 py-2 text-sm" style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }}
                    placeholder="SP, MG, RJ" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Valor mínimo (R$)</label>
                  <input type="number" value={form.value_min} onChange={(e) => setForm({ ...form, value_min: e.target.value })}
                    className="w-full px-3 py-2 text-sm" style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Valor máximo (R$)</label>
                  <input type="number" value={form.value_max} onChange={(e) => setForm({ ...form, value_max: e.target.value })}
                    className="w-full px-3 py-2 text-sm" style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }} />
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 font-semibold px-4 py-2 text-sm"
                style={{ background: "var(--color-accent)", color: "#fff", border: "none", fontFamily: "var(--font-body)" }}
              >
                Criar alerta
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 skeleton" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
                Nenhum alerta configurado. Crie um para receber notificações de novas licitações.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-5 flex items-start justify-between"
                  style={{ border: "2px solid var(--color-divider)", background: alert.enabled ? "var(--color-bg)" : "var(--color-surface)", opacity: alert.enabled ? 1 : 0.6 }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>{alert.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 font-bold"
                        style={{ background: alert.enabled ? "#d4edda" : "#e2e3e5", color: alert.enabled ? "#155724" : "#383d41" }}>
                        {alert.enabled ? "ativo" : "pausado"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px]" style={{ color: "var(--color-neutral-600)" }}>
                      {alert.keywords.length > 0 && alert.keywords.map((kw) => (
                        <span key={kw} className="px-1.5 py-0.5" style={{ background: "var(--color-neutral-200)" }}>{kw}</span>
                      ))}
                      {alert.ufs.length > 0 && alert.ufs.map((uf) => (
                        <span key={uf} className="px-1.5 py-0.5 font-bold" style={{ background: "var(--color-accent)", color: "#fff" }}>{uf}</span>
                      ))}
                      {alert.modalities.length > 0 && alert.modalities.map((m) => (
                        <span key={m} className="px-1.5 py-0.5" style={{ border: "1px solid var(--color-divider)" }}>{m}</span>
                      ))}
                      {alert.value_min && <span className="px-1.5 py-0.5" style={{ border: "1px solid var(--color-divider)" }}>&ge; R$ {alert.value_min}</span>}
                      {alert.value_max && <span className="px-1.5 py-0.5" style={{ border: "1px solid var(--color-divider)" }}>&le; R$ {alert.value_max}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(alert)}>
                      {alert.enabled ? "Pausar" : "Ativar"}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(alert)}>
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

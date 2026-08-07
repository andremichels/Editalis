"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { supabase } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

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

interface Article {
  id: number;
  slug: string;
  title: string;
  title_marker?: string;
  published_date: string;
  organ_level_1?: string;
}

const emptyForm = { name: "", keywords: "", organs: "", ufs: "", modalities: "", value_min: "", value_max: "" };

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<AlertProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [matches, setMatches] = useState<Article[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

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

  const submitForm = async () => {
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

    const isEdit = editingId !== null;
    const url = isEdit ? `${API_BASE}/api/v1/alerts/${editingId}` : `${API_BASE}/api/v1/alerts?user_id=${userId}`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast(isEdit ? "Alerta atualizado" : "Alerta criado", "success");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } else {
      const err = await res.text();
      toast(`Erro ao ${isEdit ? "atualizar" : "criar"} alerta: ${err}`, "error");
    }
  };

  const startEdit = (alert: AlertProfile) => {
    setForm({
      name: alert.name,
      keywords: alert.keywords.join(", "),
      organs: alert.organs.join(", "),
      ufs: alert.ufs.join(", "),
      modalities: alert.modalities.join(", "),
      value_min: alert.value_min?.toString() || "",
      value_max: alert.value_max?.toString() || "",
    });
    setEditingId(alert.id);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
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

  const toggleMatches = async (alertId: number) => {
    if (expanded === alertId) {
      setExpanded(null);
      return;
    }
    setExpanded(alertId);
    setMatchesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/alerts/${alertId}/matches?limit=10`);
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch {}
    setMatchesLoading(false);
  };

  const isEditing = editingId !== null;

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
          <Button onClick={() => { cancelForm(); setShowForm(!showForm); }}>
            {showForm && !isEditing ? "Cancelar" : "+ Novo alerta"}
          </Button>
        </div>

        <div className="px-10 py-6">
          {showForm && (
            <div ref={formRef} className="mb-6 p-5" style={{ border: isEditing ? "2px solid var(--color-accent)" : "2px solid var(--color-divider)", background: "var(--color-surface)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
                  {isEditing ? `Editando: ${form.name}` : "Novo perfil de alerta"}
                </h3>
                {isEditing && (
                  <Button variant="ghost" size="sm" onClick={cancelForm}>Cancelar edição</Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Nome *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm" style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }}
                    placeholder="Ex: Obras em SP" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Órgãos (vírgula)</label>
                  <input value={form.organs} onChange={(e) => setForm({ ...form, organs: e.target.value })}
                    className="w-full px-3 py-2 text-sm" style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }}
                    placeholder="Ministério da Defesa" />
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
                onClick={submitForm}
                className="inline-flex items-center gap-2 font-semibold px-4 py-2 text-sm"
                style={{ background: "var(--color-accent)", color: "#fff", border: "none", fontFamily: "var(--font-body)" }}
              >
                {isEditing ? "Salvar alterações" : "Criar alerta"}
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
                <div key={alert.id} className="p-5 flex flex-wrap items-start justify-between"
                  style={{ border: "2px solid var(--color-divider)", background: alert.enabled ? "var(--color-bg)" : "var(--color-surface)", opacity: alert.enabled ? 1 : 0.6 }}>
                  <div className="flex-1 min-w-0">
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
                      {alert.organs.length > 0 && alert.organs.map((o) => (
                        <span key={o} className="px-1.5 py-0.5" style={{ border: "1px solid var(--color-divider)" }}>{o}</span>
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
                  <div className="flex gap-2 shrink-0 ml-4 flex-wrap justify-end">
                    <Button variant="ghost" size="sm" onClick={() => toggleMatches(alert.id)}>
                      {expanded === alert.id ? "Fechar" : "Matches"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(alert)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(alert)}>
                      {alert.enabled ? "Pausar" : "Ativar"}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(alert)}>
                      ✕
                    </Button>
                  </div>
                  {expanded === alert.id && (
                    <div className="w-full mt-3 pt-3" style={{ borderTop: "1px solid var(--color-divider)" }}>
                      {matchesLoading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-10 skeleton" />))}
                        </div>
                      ) : matches.length === 0 ? (
                        <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>Nenhum artigo encontrado com esses critérios.</p>
                      ) : (
                        <div className="space-y-2">
                          {matches.map((a) => (
                            <a key={a.id} href={`/artigo/${a.slug}`} className="block p-3 hover:opacity-80 transition-opacity"
                              style={{ background: "var(--color-surface)", border: "1px solid var(--color-divider)", textDecoration: "none" }}>
                              <div className="text-[11px] font-bold mb-0.5" style={{ color: "var(--color-accent)" }}>
                                {a.organ_level_1 || "DOU"}
                              </div>
                              <div className="text-[13px] font-bold leading-snug" style={{ color: "var(--color-text)" }}>
                                {a.title_marker || a.title}
                              </div>
                              <div className="text-[11px] mt-1" style={{ color: "var(--color-neutral-500)" }}>
                                {new Date(a.published_date).toLocaleDateString("pt-BR")}
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

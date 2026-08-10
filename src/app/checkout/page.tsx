"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/auth";
import { authFetch } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

const PLAN_LABELS: Record<string, string> = { essencial: "Essencial", profissional: "Profissional" };
const PLAN_PRICES: Record<string, { monthly: string; annual: string }> = {
  essencial: { monthly: "R$ 49", annual: "R$ 39" },
  profissional: { monthly: "R$ 199", annual: "R$ 159" },
};

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const plan = params.get("plan") || "profissional";
  const cycle = params.get("cycle") || "monthly";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUserId(data.session.user.id);
    });
  }, []);

  const handleCheckout = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`${API_BASE}/api/v1/account/subscription/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing_cycle: cycle, method: "credit_card" }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Erro ao iniciar checkout");
      }

      const { url } = await res.json();

      if (url) {
        // Redirect to Stripe Checkout (or success page in simulated mode)
        window.location.href = url;
      }
    } catch (e: any) {
      setError(e.message || "Erro inesperado");
      setLoading(false);
    }
  };

  const cycleLabel = cycle === "annual" ? "Anual (20% off)" : "Mensal";
  const priceLabel = PLAN_PRICES[plan]?.[cycle === "annual" ? "annual" : "monthly"] || "";

  return (
    <div className="max-w-lg mx-auto py-12 px-6">
      {error && (
        <div className="mb-4 p-4 text-sm font-bold" style={{ background: "#f8d7da", border: "2px solid #f5c6cb", color: "#721c24" }}>
          {error}
        </div>
      )}

      <h1 className="text-[30px] font-black tracking-[-0.03em] mb-2" style={{ fontFamily: "var(--font-heading)" }}>Checkout</h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-neutral-500)" }}>
        7 dias de trial. Cobre apenas se aprovar.
      </p>

      <div className="p-5 mb-6" style={{ border: "2px solid var(--color-text)", background: "var(--color-neutral-100)" }}>
        <div className="text-lg font-black">{PLAN_LABELS[plan] || plan}</div>
        <div className="text-[13px] mt-1" style={{ color: "var(--color-neutral-600)" }}>
          {cycleLabel} · {priceLabel}/mês
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold mb-2">O que está incluído:</h3>
        <ul className="text-sm space-y-1" style={{ color: "var(--color-neutral-600)" }}>
          <li>✓ {plan === "essencial" ? "3" : "25"} perfis de busca monitorados</li>
          <li>✓ {plan === "essencial" ? "Histórico 30 dias" : "Histórico completo"}</li>
          <li>✓ Alerta por e-mail</li>
          {plan !== "essencial" && <li>✓ WhatsApp + app</li>}
          <li>✓ Nota fiscal em todos os planos</li>
          <li>✓ 7 dias de trial — cancele quando quiser</li>
        </ul>
      </div>

      <button onClick={handleCheckout} disabled={loading}
        className="w-full py-4 text-sm font-bold cursor-pointer disabled:opacity-50"
        style={{ background: "var(--color-accent)", color: "#fff", border: "none" }}>
        {loading ? "Redirecionando..." : "Assinar agora"}
      </button>

      <p className="text-xs text-center mt-4" style={{ color: "var(--color-neutral-500)" }}>
        Você será redirecionado para o checkout seguro do Stripe.
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="max-w-lg mx-auto py-12 px-6"><div className="h-48 skeleton" /></div>}>
        <CheckoutForm />
      </Suspense>
    </AuthGuard>
  );
}

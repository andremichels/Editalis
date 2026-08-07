"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/auth";
import { loadIugu, tokenizeCard } from "@/lib/iugu";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

const PLAN_LABELS: Record<string, string> = { essencial: "Essencial", profissional: "Profissional" };
const PLAN_PRICES: Record<string, { monthly: string; annual: string }> = {
  essencial: { monthly: "R$ 49", annual: "R$ 39" },
  profissional: { monthly: "R$ 199", annual: "R$ 159" },
};

type Step = "plan" | "payment" | "done";

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("plan");
  const [method, setMethod] = useState<"credit_card" | "bank_slip">("credit_card");
  const [card, setCard] = useState({ number: "", name: "", month: "", year: "", cvv: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [boleto, setBoleto] = useState<{ url: string; barcode: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const plan = params.get("plan") || "profissional";
  const cycle = params.get("cycle") || "monthly";

  useEffect(() => {
    loadIugu().catch(() => {});
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUserId(data.session.user.id);
    });
  }, []);

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      // 1. Create checkout session
      const ch = await fetch(`${API_BASE}/api/v1/account/subscription/checkout?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing_cycle: cycle, method }),
      });
      if (!ch.ok) throw new Error("Erro ao iniciar checkout");
      const checkout = await ch.json();

      // 2. Tokenize card (credit card only)
      let token = "";
      if (method === "credit_card") {
        const [firstName, ...last] = card.name.trim().split(" ");
        const tok = await tokenizeCard({
          number: card.number.replace(/\s/g, ""),
          verification_value: card.cvv,
          first_name: firstName || "",
          last_name: last.join(" ") || "",
          month: card.month,
          year: card.year,
        });
        token = tok.id;
      }

      // 3. Confirm charge
      const cf = await fetch(`${API_BASE}/api/v1/account/subscription/confirm?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: checkout.customer_id, token, method }),
      });
      const result = await cf.json();

      if (result.success) {
        if (method === "bank_slip" && result.boleto_url) {
          setBoleto({ url: result.boleto_url, barcode: result.boleto_barcode || "" });
        }
        setStep("done");
      } else {
        setError(result.detail || "Erro ao processar pagamento");
      }
    } catch (e: any) {
      setError(e.message || "Erro inesperado");
    }
    setLoading(false);
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

      {step === "plan" && (
        <div>
          <h1 className="text-[30px] font-black tracking-[-0.03em] mb-2" style={{ fontFamily: "var(--font-heading)" }}>Checkout</h1>
          <p className="text-sm mb-6" style={{ color: "var(--color-neutral-500)" }}>7 dias de trial. Cobre apenas se aprovar.</p>
          <div className="p-5 mb-6" style={{ border: "2px solid var(--color-text)", background: "var(--color-neutral-100)" }}>
            <div className="text-lg font-black">{PLAN_LABELS[plan] || plan}</div>
            <div className="text-[13px] mt-1" style={{ color: "var(--color-neutral-600)" }}>
              {cycleLabel} · {priceLabel}/mês
            </div>
          </div>
          <button onClick={() => setStep("payment")} className="w-full py-3 text-sm font-bold cursor-pointer"
            style={{ background: "var(--color-accent)", color: "#fff", border: "none" }}>
            Continuar para pagamento
          </button>
        </div>
      )}

      {step === "payment" && (
        <div>
          <h2 className="text-xl font-black mb-4" style={{ fontFamily: "var(--font-heading)" }}>Forma de pagamento</h2>
          <div className="flex gap-2 mb-6">
            {(["credit_card", "bank_slip"] as const).map((m) => (
              <button key={m} onClick={() => setMethod(m)}
                className={`flex-1 py-3 text-sm font-bold border-2 cursor-pointer ${
                  method === m ? "border-[var(--color-text)] bg-[var(--color-text)] text-white" : "border-[var(--color-divider)]"
                }`}>
                {m === "credit_card" ? "💳 Cartão" : "📄 Boleto"}
              </button>
            ))}
          </div>

          {method === "credit_card" && (
            <div className="flex flex-col gap-3 mb-6">
              <input placeholder="Número do cartão" maxLength={19}
                value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })}
                className="px-3 py-3 text-sm border-2 w-full" style={{ borderColor: "var(--color-divider)", background: "var(--color-bg)" }} />
              <input placeholder="Nome no cartão"
                value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })}
                className="px-3 py-3 text-sm border-2 w-full" style={{ borderColor: "var(--color-divider)", background: "var(--color-bg)" }} />
              <div className="grid grid-cols-3 gap-2">
                <input placeholder="MM" maxLength={2}
                  value={card.month} onChange={(e) => setCard({ ...card, month: e.target.value })}
                  className="px-3 py-3 text-sm border-2" style={{ borderColor: "var(--color-divider)", background: "var(--color-bg)" }} />
                <input placeholder="AA" maxLength={2}
                  value={card.year} onChange={(e) => setCard({ ...card, year: e.target.value })}
                  className="px-3 py-3 text-sm border-2" style={{ borderColor: "var(--color-divider)", background: "var(--color-bg)" }} />
                <input placeholder="CVV" maxLength={4}
                  value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  className="px-3 py-3 text-sm border-2" style={{ borderColor: "var(--color-divider)", background: "var(--color-bg)" }} />
              </div>
            </div>
          )}

          {method === "bank_slip" && (
            <p className="text-sm mb-6" style={{ color: "var(--color-neutral-500)" }}>
              O boleto será gerado após a confirmação. Vencimento em 3 dias úteis.
            </p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 text-sm font-bold cursor-pointer disabled:opacity-50"
            style={{ background: "var(--color-accent)", color: "#fff", border: "none" }}>
            {loading ? "Processando..." : method === "bank_slip" ? "Gerar boleto" : "Pagar"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-black mb-2" style={{ fontFamily: "var(--font-heading)" }}>Pagamento {method === "bank_slip" ? "gerado" : "confirmado"}!</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-neutral-500)" }}>
            {method === "bank_slip"
              ? "Seu boleto foi gerado. Pague em até 3 dias úteis para ativar sua assinatura."
              : "Sua assinatura está ativa. Aproveite!"}
          </p>
          {boleto && (
            <div className="p-5 mb-4 text-left" style={{ border: "2px solid var(--color-text)", background: "var(--color-neutral-100)" }}>
              <div className="text-xs font-bold mb-2">Código de barras</div>
              <div className="text-sm font-mono break-all mb-3" style={{ color: "var(--color-neutral-600)" }}>{boleto.barcode}</div>
              <a href={boleto.url} target="_blank" rel="noopener"
                className="inline-block px-4 py-2 text-sm font-bold cursor-pointer"
                style={{ background: "var(--color-text)", color: "#fff", textDecoration: "none" }}>
                Abrir boleto
              </a>
            </div>
          )}
          <button onClick={() => router.push("/dashboard")}
            className="px-6 py-3 text-sm font-bold cursor-pointer"
            style={{ background: "var(--color-accent)", color: "#fff", border: "none" }}>
            Ir para o painel
          </button>
        </div>
      )}
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

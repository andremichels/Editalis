"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan") || "profissional";

  return (
    <div className="max-w-lg mx-auto py-12 px-6 text-center">
      <div className="text-4xl mb-4">✅</div>
      <h1 className="text-[30px] font-black tracking-[-0.03em] mb-2" style={{ fontFamily: "var(--font-heading)" }}>
        Assinatura confirmada!
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-neutral-500)" }}>
        Seu plano {plan === "essencial" ? "Essencial" : "Profissional"} está ativo. Aproveite o trial de 7 dias.
      </p>
      <button onClick={() => router.push("/dashboard")}
        className="px-6 py-3 text-sm font-bold cursor-pointer"
        style={{ background: "var(--color-accent)", color: "#fff", border: "none" }}>
        Ir para o painel
      </button>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="max-w-lg mx-auto py-12 px-6"><div className="h-48 skeleton" /></div>}>
        <SuccessContent />
      </Suspense>
    </AuthGuard>
  );
}

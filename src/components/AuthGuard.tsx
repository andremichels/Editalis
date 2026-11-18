"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/auth";
import { authFetch } from "@/lib/api";
import { identifyUser } from "@/lib/analytics";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

type Status = "checking" | "authed" | "unauth";

/**
 * Esqueleto do app logado (menu escuro + conteúdo) enquanto a sessão é
 * verificada — antes o guard devolvia `null` e a tela ficava em branco.
 */
function AppSkeleton() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[232px_1fr]" aria-busy="true" aria-label="Carregando">
      <aside className="hidden lg:block h-screen sticky top-0" style={{ background: "var(--color-text)" }}>
        <div className="px-5 py-6">
          <div className="text-[19px] font-black tracking-[-0.03em]" style={{ fontFamily: "var(--font-heading)", color: "#fff" }}>
            EDITALIS
          </div>
        </div>
      </aside>
      <div style={{ background: "var(--color-bg)" }}>
        <div className="py-7 px-10" style={{ borderBottom: "2px solid var(--color-text)" }}>
          <div className="h-8 w-48 skeleton mb-2" />
          <div className="h-4 w-64 skeleton" />
        </div>
        <div className="px-10 py-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-32 skeleton mb-2" />
              <div className="h-5 w-3/4 skeleton mb-1.5" />
              <div className="h-4 w-1/2 skeleton" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (!session) {
        setStatus("unauth");
        router.replace("/login");
        return;
      }
      identifyUser(session.user.id, { email: session.user.email });
      // Libera a tela assim que há sessão; a checagem de onboarding roda em
      // paralelo e só redireciona se o usuário ainda não completou.
      setStatus("authed");
      if (pathname === "/onboarding") return;
      authFetch(`${API_BASE}/api/v1/account/preferences`)
        .then((r) => (r.ok ? r.json() : null))
        .then((prefs) => {
          // só redireciona com resposta válida — erro/401 não manda pro onboarding
          if (!cancelled && prefs && prefs.onboarding_completed === false) router.replace("/onboarding");
        })
        .catch(() => {}); // se a verificação falhar, não travar o acesso
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (status === "authed") return <>{children}</>;
  return <AppSkeleton />;
}

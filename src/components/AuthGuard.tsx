"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/auth";
import { authFetch } from "@/lib/api";
import { identifyUser } from "@/lib/analytics";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

type Status = "checking" | "authed" | "unauth" | "onboarding";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
        setStatus("unauth");
        return;
      }
      identifyUser(session.user.id, { email: session.user.email });

      // O onboarding roda pra todo mundo que ainda não completou. Não redirecionar
      // quando já estamos nele (evita loop).
      if (pathname === "/onboarding") {
        setStatus("authed");
        return;
      }

      authFetch(`${API_BASE}/api/v1/account/preferences`)
        .then((r) => r.json())
        .then((prefs) => {
          if (prefs && prefs.onboarding_completed === false) {
            setStatus("onboarding");
            router.push("/onboarding");
          } else {
            setStatus("authed");
          }
        })
        .catch(() => setStatus("authed")); // se a verificação falhar, não travar o acesso
    });
  }, [pathname, router]);

  if (status !== "authed") return null;
  return <>{children}</>;
}

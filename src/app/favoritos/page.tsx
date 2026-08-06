"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useFavorites } from "@/lib/useFavorites";

export default function FavoritesPage() {
  const { favorites, loaded } = useFavorites();
  const router = useRouter();

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10" style={{ borderBottom: "2px solid var(--color-text)" }}>
          <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>
            Favoritos
          </h1>
          <div className="text-[13px] mt-1" style={{ color: "var(--color-neutral-600)" }}>
            {loaded ? `${favorites.size} artigo${favorites.size !== 1 ? "s" : ""} salvos` : "Carregando..."}
          </div>
        </div>

        <div className="px-10 py-6">
          {!loaded ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 skeleton" />
              ))}
            </div>
          ) : favorites.size === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-4">☆</div>
              <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
                Nenhum favorito ainda. Volte ao painel e favorite os artigos que quiser acompanhar.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 px-6 py-2 text-sm font-bold"
                style={{ background: "var(--color-accent)", color: "#fff", border: "none", fontFamily: "var(--font-heading)" }}
              >
                Ir para o painel
              </button>
            </div>
          ) : (
            <div style={{ borderTop: "2px solid var(--color-text)" }}>
              <p className="text-xs py-4" style={{ color: "var(--color-neutral-500)" }}>
                Os favoritos ficam salvos no seu navegador. Em breve, serão sincronizados com a nuvem.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

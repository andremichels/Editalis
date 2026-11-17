"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useFavorites } from "@/lib/useFavorites";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import type { Article } from "@/lib/types";
import { authFetch } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

export default function FavoritesPage() {
  const { favorites, loaded } = useFavorites();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Uma única busca: /api/v1/favorites já devolve os artigos completos.
  // (Antes: até 200 GETs inúteis em série + /recent?limit=200, refeitos a cada ★.)
  useEffect(() => {
    authFetch(`${API_BASE}/api/v1/favorites`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  // Desfavoritar aqui some da lista na hora, sem refazer a busca.
  const visible = articles.filter((a) => favorites.has(a.id));

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
          {!loaded || loading ? (
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
          ) : visible.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
                {favorites.size} artigo{favorites.size !== 1 ? "s" : ""} salvo{favorites.size !== 1 ? "s" : ""}, mas não foi possível carregá-los agora.
              </p>
              <p className="text-xs mt-2" style={{ color: "var(--color-neutral-400)" }}>
                Favoritos marcados sem conexão sincronizam na próxima vez que você entrar.
              </p>
            </div>
          ) : (
            <div style={{ borderTop: "2px solid var(--color-text)" }}>
              {visible.map((article) => (
                <Link
                  key={article.id}
                  href={`/artigo/${article.slug}`}
                  className="block py-4 cursor-pointer hover:opacity-80 transition-opacity relative"
                  style={{ borderBottom: "1px solid var(--color-divider)", textDecoration: "none" }}
                >
                  <div className="absolute top-4 right-0">
                    <FavoriteButton articleId={article.id} />
                  </div>
                  <div className="text-[11px] font-bold mb-1" style={{ color: "var(--color-accent)" }}>
                    {article.organ_level_1 || article.organ || "DOU"}
                  </div>
                  <h3 className="text-[15px] font-bold leading-snug mb-1 pr-8" style={{ color: "var(--color-text)" }}>
                    {article.title_marker || article.title}
                  </h3>
                  <div className="text-[12px]" style={{ color: "var(--color-neutral-500)" }}>
                    {new Date(article.published_date).toLocaleDateString("pt-BR")}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

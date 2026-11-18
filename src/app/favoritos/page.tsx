"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArticleRow, ArticleRowSkeleton } from "@/components/articles/ArticleRow";
import { useFavorites } from "@/lib/useFavorites";
import { parseDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { authFetch } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default function FavoritesPage() {
  const { favorites, loaded } = useFavorites();
  const [articles, setArticles] = useState<Article[] | null>(null);

  // Uma única busca: /api/v1/favorites já devolve as publicações completas.
  useEffect(() => {
    authFetch(`${API_BASE}/api/v1/favorites`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]));
  }, []);

  // Desfavoritar aqui some da lista na hora; mais recentes primeiro.
  const visible = (articles ?? [])
    .filter((a) => favorites.has(a.id))
    .sort((a, b) => (parseDate(b.published_date)?.getTime() ?? 0) - (parseDate(a.published_date)?.getTime() ?? 0));

  const loading = !loaded || articles === null;

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-10" style={{ borderBottom: "2px solid var(--color-text)" }}>
          <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>
            Favoritos
          </h1>
          <div className="text-[13px] mt-1" style={{ color: "var(--color-neutral-700)" }}>
            {loading ? " " : `${plural(visible.length, "publicação salva", "publicações salvas")} · mais recentes primeiro`}
          </div>
        </div>

        <div className="px-10 pb-10">
          {loading ? (
            <ArticleRowSkeleton count={5} />
          ) : favorites.size === 0 ? (
            <div className="py-12 max-w-md">
              <p className="text-[15px] font-bold mb-1">Nenhum favorito ainda.</p>
              <p className="text-[14px] mb-4" style={{ color: "var(--color-neutral-700)" }}>
                Toque na estrela ☆ de qualquer publicação para acompanhá-la por aqui.
              </p>
              <Link
                href="/busca"
                className="inline-block py-2.5 px-4 text-[13px] font-bold"
                style={{ background: "var(--color-accent)", color: "#fff" }}
              >
                Buscar
              </Link>
            </div>
          ) : visible.length === 0 ? (
            <div className="py-12 max-w-md">
              <p className="text-[14px]" style={{ color: "var(--color-neutral-700)" }}>
                {plural(favorites.size, "publicação salva", "publicações salvas")}, mas não foi possível carregá-las agora.
                Favoritos marcados sem conexão sincronizam na próxima vez que você entrar.
              </p>
            </div>
          ) : (
            <div>
              {visible.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

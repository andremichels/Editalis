"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArticleRow, ArticleRowSkeleton } from "@/components/articles/ArticleRow";
import { useFavorites } from "@/lib/useFavorites";
import { articleOrgan, articleTitle, daysUntil, fold, parseDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { authFetch } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

type Order = "recentes" | "prazo" | "valor";

const ORDERS: { id: Order; label: string; compare: (a: Article, b: Article) => number }[] = [
  {
    id: "recentes",
    label: "Mais recentes",
    compare: (a, b) => (parseDate(b.published_date)?.getTime() ?? 0) - (parseDate(a.published_date)?.getTime() ?? 0),
  },
  {
    id: "prazo",
    label: "Prazo mais próximo",
    // prazos já vencidos e sem prazo vão para o fim
    compare: (a, b) => rankDays(a) - rankDays(b),
  },
  {
    id: "valor",
    label: "Maior valor",
    compare: (a, b) => (b.normalized_data?.value ?? -1) - (a.normalized_data?.value ?? -1),
  },
];

function rankDays(a: Article) {
  const d = daysUntil(a.normalized_data?.opening_date);
  return d == null || d < 0 ? Number.MAX_SAFE_INTEGER : d;
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default function FavoritesPage() {
  const { favorites, loaded } = useFavorites();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [text, setText] = useState("");
  const [order, setOrder] = useState<Order>("recentes");

  // Uma única busca: /api/v1/favorites já devolve as publicações completas.
  useEffect(() => {
    authFetch(`${API_BASE}/api/v1/favorites`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]));
  }, []);

  // Desfavoritar aqui some da lista na hora.
  const saved = (articles ?? []).filter((a) => favorites.has(a.id));
  const needle = fold(text.trim());
  const visible = saved
    .filter((a) => !needle || fold(`${articleTitle(a, 400)} ${articleOrgan(a)} ${a.normalized_data?.process_number ?? ""}`).includes(needle))
    .sort(ORDERS.find((o) => o.id === order)!.compare);

  const loading = !loaded || articles === null;

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="py-7 px-6 sm:px-10" style={{ borderBottom: "2px solid var(--color-text)" }}>
          <h1 className="text-[30px] font-black tracking-[-0.03em]" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>
            Favoritos
          </h1>
          <div className="text-[13px] mt-1" style={{ color: "var(--color-neutral-700)" }}>
            {loading ? " " : plural(saved.length, "publicação salva", "publicações salvas")}
          </div>
        </div>

        {!loading && saved.length > 1 && (
          <div className="px-6 sm:px-10 py-3 flex flex-wrap items-center gap-3" style={{ borderBottom: "1px solid var(--color-divider)" }}>
            <input
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Filtrar por objeto, órgão ou nº do processo"
              aria-label="Filtrar favoritos"
              className="flex-1 min-w-[220px] max-w-md py-2 px-3 text-[14px]"
              style={{ border: "2px solid var(--color-text)", background: "var(--color-bg)", color: "var(--color-text)" }}
            />
            <label className="flex items-center gap-2 text-[13px]" style={{ color: "var(--color-neutral-700)" }}>
              Ordenar por
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value as Order)}
                className="py-2 px-2 text-[13px] font-bold cursor-pointer"
                style={{ border: "2px solid var(--color-text)", background: "var(--color-bg)", color: "var(--color-text)" }}
              >
                {ORDERS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="px-6 sm:px-10 pb-10">
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
          ) : saved.length > 0 && visible.length === 0 ? (
            <div className="py-12 max-w-md">
              <p className="text-[14px]" style={{ color: "var(--color-neutral-700)" }}>
                Nenhum favorito com “{text}”.{" "}
                <button onClick={() => setText("")} className="underline font-bold cursor-pointer" style={{ color: "var(--color-text)" }}>
                  Limpar filtro
                </button>
              </p>
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

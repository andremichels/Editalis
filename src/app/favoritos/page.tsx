"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ArticleRowSkeleton, useArticleState } from "@/components/articles/ArticleRow";
import {
  EMPTY_META,
  FavoriteNote,
  FolderSelect,
  STATUSES,
  StatusSelect,
  itemOf,
  normalizeMeta,
  type FavoriteStatus,
  type FavoritesMeta,
} from "@/components/favoritos/FavoriteMeta";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useToast } from "@/components/Toast";
import { useFavorites } from "@/lib/useFavorites";
import {
  articleKind,
  articleOrgan,
  articleTitle,
  articleUfs,
  daysUntil,
  fold,
  formatDateShort,
  formatMoneyCompact,
  isUrgent,
  modalityLabel,
  openingWhen,
  parseDate,
} from "@/lib/format";
import type { Article } from "@/lib/types";
import { authFetch } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

type Order = "prazo" | "recentes" | "valor";

const ORDERS: { id: Order; label: string; compare: (a: Article, b: Article) => number }[] = [
  { id: "prazo", label: "Prazo mais próximo", compare: (a, b) => rankDays(a) - rankDays(b) },
  {
    id: "recentes",
    label: "Publicados recentemente",
    compare: (a, b) => (parseDate(b.published_date)?.getTime() ?? 0) - (parseDate(a.published_date)?.getTime() ?? 0),
  },
  { id: "valor", label: "Maior valor", compare: (a, b) => (b.normalized_data?.value ?? -1) - (a.normalized_data?.value ?? -1) },
];

const openDays = (a: Article) => daysUntil(a.normalized_data?.opening_date);
const hasOpenDeadline = (a: Article) => (openDays(a) ?? -1) >= 0;

function rankDays(a: Article) {
  const d = openDays(a);
  return d == null || d < 0 ? Number.MAX_SAFE_INTEGER : d;
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function downloadCsv(articles: Article[], meta: FavoritesMeta) {
  const header = ["Objeto", "Órgão", "UF", "Tipo", "Valor (R$)", "Abertura", "Publicado", "Status", "Pasta", "Nota", "Link"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const label = (s: FavoriteStatus) => STATUSES.find((x) => x.id === s)?.label ?? "";
  const rows = articles.map((a) => {
    const item = itemOf(meta, a.id);
    return [
      articleTitle(a, 400), articleOrgan(a), articleUfs(a), articleKind(a),
      a.normalized_data?.value ?? "", a.normalized_data?.opening_date ?? "", a.published_date ?? "",
      label(item.status), item.folder, item.note, `https://www.in.gov.br/web/dou/-/${a.slug}`,
    ];
  });
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `editalis-favoritos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const GRID = "grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_190px_44px] xl:grid-cols-[minmax(0,1fr)_130px_120px_190px_44px] gap-x-5 gap-y-3";
const muted = { color: "var(--color-muted)" };

function FavoriteRow({ article, meta, onChange }: { article: Article; meta: FavoritesMeta; onChange: (m: FavoritesMeta) => void }) {
  const nd = article.normalized_data;
  const { read } = useArticleState(article);
  const value = formatMoneyCompact(nd?.value);
  const days = openDays(article);
  const open = days != null && days >= 0;
  const ufs = articleUfs(article);
  const kind = [articleKind(article), nd?.modality ? modalityLabel(nd.modality) : ""].filter(Boolean).join(" · ");

  return (
    <article className={`${GRID} items-start py-5`} style={{ borderBottom: "1px solid var(--color-line)" }}>
      <div className="flex flex-col gap-1.5 min-w-0">
        <p className="text-[12px]" style={muted}>
          {kind} · {articleOrgan(article)}{ufs ? ` · ${ufs}` : ""}{read ? " · Visto" : ""}
        </p>
        <h3 className="text-[16px] leading-[1.35] font-bold">
          <Link href={`/artigo/${article.slug}`} className="hover:underline">{articleTitle(article)}</Link>
        </h3>
        {/* valor e prazo aparecem aqui quando as colunas somem */}
        <p className="xl:hidden text-[13px]">
          {value ? <strong>{value}</strong> : <span style={muted}>Valor não informado</span>}
          {open && (
            <span className={isUrgent(days) ? "font-bold" : undefined} style={{ color: isUrgent(days) ? "var(--color-accent-text)" : undefined }}>
              {" · "}{days === 0 ? "abre hoje" : days === 1 ? "abre amanhã" : `abre em ${days} dias`}
            </span>
          )}
        </p>
        <FavoriteNote articleId={article.id} meta={meta} onChange={onChange} />
        <FolderSelect articleId={article.id} meta={meta} onChange={onChange} />
      </div>
      <p className="hidden xl:block text-right">
        {value ? <span className="text-[15px] font-extrabold">{value}</span> : <span className="text-[14px]" style={muted}>não informado</span>}
      </p>
      <div className="hidden xl:block">
        {open ? (
          <>
            <p className="text-[14px] font-extrabold" style={{ color: isUrgent(days) ? "var(--color-accent-text)" : undefined }}>
              {days === 0 ? "hoje" : days === 1 ? "amanhã" : `${days} dias`}
            </p>
            {openingWhen(nd?.opening_date) && <p className="mt-0.5 text-[12px]" style={muted}>{openingWhen(nd?.opening_date)}</p>}
          </>
        ) : (
          <p className="text-[13px]" style={muted}>
            {nd?.opening_date ? `abriu ${formatDateShort(nd.opening_date)}` : `publicado ${formatDateShort(article.published_date)}`}
          </p>
        )}
      </div>
      <StatusSelect articleId={article.id} meta={meta} onChange={onChange} />
      <div className="-mt-0.5"><FavoriteButton articleId={article.id} /></div>
    </article>
  );
}

export default function FavoritesPage() {
  const { favorites, loaded } = useFavorites();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [text, setText] = useState("");
  const [order, setOrder] = useState<Order>("prazo");
  // Situação (aba), pasta (filtro) e notas — GET/PUT /favorites/meta
  const [meta, setMeta] = useState<FavoritesMeta>(EMPTY_META);
  const [status, setStatus] = useState<FavoriteStatus | "todos">("todos");
  const [folder, setFolder] = useState(""); // "" = todas; "__none" = sem pasta
  const [newFolder, setNewFolder] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  // Uma única busca: /api/v1/favorites já devolve as publicações completas.
  useEffect(() => {
    authFetch(`${API_BASE}/api/v1/favorites`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]));
    authFetch(`${API_BASE}/api/v1/favorites/meta`)
      .then((r) => (r.ok ? r.json() : EMPTY_META))
      .then((m: FavoritesMeta) => setMeta(normalizeMeta(m)))
      .catch(() => {});
  }, []);

  // Salva 500ms depois da última mudança (o servidor guarda o estado inteiro).
  const updateMeta = (next: FavoritesMeta) => {
    setMeta(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      authFetch(`${API_BASE}/api/v1/favorites/meta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      })
        .then((r) => { if (!r.ok) throw new Error(); })
        .catch(() => toast("Não foi possível salvar status, pastas e notas", "error"));
    }, 500);
  };

  const createFolder = () => {
    const name = (newFolder ?? "").trim().slice(0, 60);
    setNewFolder(null);
    if (!name || meta.folders.includes(name)) return;
    updateMeta({ ...meta, folders: [...meta.folders, name] });
    setFolder(name);
  };

  const deleteFolder = (name: string) => {
    if (!confirm(`Apagar a pasta “${name}”? As publicações continuam nos favoritos, sem pasta.`)) return;
    const items = Object.fromEntries(
      Object.entries(meta.items)
        .map(([k, v]) => [k, v.folder === name ? { ...v, folder: "" } : v] as const)
        .filter(([, v]) => v.note || v.folder || v.status),
    );
    updateMeta({ folders: meta.folders.filter((f) => f !== name), items });
    setFolder("");
  };

  // Desfavoritar aqui some da lista na hora.
  const saved = (articles ?? []).filter((a) => favorites.has(a.id));
  const statusOf = (a: Article) => itemOf(meta, a.id).status;
  const folderOf = (a: Article) => itemOf(meta, a.id).folder;
  const needle = fold(text.trim());
  const inFolder = saved.filter((a) => !folder || (folder === "__none" ? !folderOf(a) : folderOf(a) === folder));
  const visible = inFolder
    .filter((a) => status === "todos" || statusOf(a) === status)
    // o texto procura também nas notas
    .filter((a) => !needle || fold(`${articleTitle(a, 400)} ${articleOrgan(a)} ${a.normalized_data?.process_number ?? ""} ${itemOf(meta, a.id).note}`).includes(needle))
    .sort(ORDERS.find((o) => o.id === order)!.compare);
  const openGroup = visible.filter(hasOpenDeadline);
  const otherGroup = visible.filter((a) => !hasOpenDeadline(a));
  const openCount = saved.filter(hasOpenDeadline).length;

  const loading = !loaded || articles === null;
  const tabs = [
    { id: "todos" as const, label: "Todos", count: inFolder.length },
    ...STATUSES.map((s) => ({ id: s.id, label: s.label, count: inFolder.filter((a) => statusOf(a) === s.id).length })),
  ];
  const fieldStyle = { border: "1px solid var(--color-text)", background: "var(--color-field)", color: "var(--color-text)" };
  const groupHead = "py-3 text-[12px] font-bold uppercase";

  return (
    <AuthGuard>
      <DashboardLayout>
        <header className="flex items-end justify-between gap-6 flex-wrap pt-8 pb-6 px-4 sm:px-12">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[32px] font-extrabold tracking-[-0.02em]" style={{ fontFamily: "var(--font-heading)" }}>Favoritos</h1>
            <p className="text-[14px]" style={muted}>
              {loading ? " " : `${plural(saved.length, "publicação salva", "publicações salvas")}${openCount ? ` · ${plural(openCount, "com prazo aberto", "com prazo aberto")}` : ""}`}
            </p>
          </div>
          {!loading && saved.length > 0 && (
            <div className="flex gap-2.5 flex-wrap items-center">
              <label>
                <span className="sr-only-text">Buscar nos favoritos</span>
                <input
                  type="search"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Buscar nos favoritos…"
                  className="w-[260px] max-w-full h-11 px-3 text-[14px]"
                  style={fieldStyle}
                />
              </label>
              <label className="flex items-center gap-2 text-[13px]" style={muted}>
                Ordenar
                <select value={order} onChange={(e) => setOrder(e.target.value as Order)} className="h-11 px-3 text-[14px] font-semibold cursor-pointer" style={fieldStyle}>
                  {ORDERS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </label>
              <button
                type="button"
                onClick={() => downloadCsv(visible, meta)}
                className="h-11 px-4 text-[14px] font-bold cursor-pointer"
                style={{ border: "2px solid var(--color-text)", background: "transparent", color: "var(--color-text)" }}
              >
                Exportar
              </button>
            </div>
          )}
        </header>

        {!loading && saved.length > 0 && (
          <>
            <div role="tablist" aria-label="Situação" className="flex flex-wrap mx-4 sm:mx-12" style={{ borderBottom: "2px solid var(--color-text)" }}>
              {tabs.map((t) => {
                const active = status === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatus(t.id)}
                    className={`h-12 px-[18px] text-[14px] cursor-pointer ${active ? "font-extrabold" : "font-semibold"}`}
                    style={{
                      color: active ? "var(--color-text)" : "var(--color-muted)",
                      borderBottom: active ? "4px solid var(--color-accent)" : "4px solid transparent",
                      marginBottom: -2,
                    }}
                  >
                    {t.label} · {t.count}
                  </button>
                );
              })}
            </div>

            <div className="mx-4 sm:mx-12 py-3 flex flex-wrap items-center gap-3" style={{ borderBottom: "1px solid var(--color-line)" }}>
              <label className="flex items-center gap-2 text-[13px]" style={muted}>
                Pasta
                <select value={folder} onChange={(e) => setFolder(e.target.value)} className="h-9 px-2 text-[13px] font-semibold cursor-pointer" style={fieldStyle}>
                  <option value="">Todas</option>
                  {meta.folders.map((f) => <option key={f} value={f}>{f}</option>)}
                  {meta.folders.length > 0 && <option value="__none">Sem pasta</option>}
                </select>
              </label>
              {folder && folder !== "__none" && (
                <button type="button" onClick={() => deleteFolder(folder)} className="h-9 text-[13px] font-semibold underline cursor-pointer" style={{ color: "var(--color-accent-text)" }}>
                  Apagar pasta
                </button>
              )}
              {newFolder === null ? (
                <button type="button" onClick={() => setNewFolder("")} className="h-9 text-[13px] font-semibold underline cursor-pointer" style={{ color: "var(--color-text)" }}>
                  + Nova pasta
                </button>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); createFolder(); }} className="flex">
                  <label>
                    <span className="sr-only-text">Nome da nova pasta</span>
                    <input
                      value={newFolder}
                      onChange={(e) => setNewFolder(e.target.value)}
                      onBlur={createFolder}
                      onKeyDown={(e) => e.key === "Escape" && setNewFolder(null)}
                      autoFocus
                      maxLength={60}
                      placeholder="Nome da pasta"
                      className="h-9 px-2 text-[13px] w-44"
                      style={fieldStyle}
                    />
                  </label>
                </form>
              )}
            </div>
          </>
        )}

        <section className="mx-4 sm:mx-12 mb-16">
          {loading ? (
            <ArticleRowSkeleton count={5} />
          ) : favorites.size === 0 ? (
            <div className="py-12 max-w-md">
              <p className="text-[15px] font-bold mb-1">Nenhum favorito ainda.</p>
              <p className="text-[14px] mb-4" style={muted}>
                Toque na estrela de qualquer publicação para acompanhá-la por aqui.
              </p>
              <Link href="/busca" className="inline-flex items-center h-11 px-4 text-[14px] font-bold" style={{ background: "var(--color-accent)", color: "#fff" }}>
                Buscar
              </Link>
            </div>
          ) : visible.length === 0 ? (
            <div className="py-12 max-w-md">
              <p className="text-[14px]" style={muted}>
                {text ? <>Nenhum favorito com “{text}” aqui.</> : <>Nenhuma publicação nesta {status !== "todos" ? "situação" : "pasta"} ainda.</>}{" "}
                <button onClick={() => { setText(""); setFolder(""); setStatus("todos"); }} className="underline font-bold cursor-pointer" style={{ color: "var(--color-text)" }}>
                  Ver todos
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className={`hidden md:grid ${GRID} py-3 text-[12px] font-bold uppercase`} style={{ letterSpacing: "0.1em", ...muted, borderBottom: "1px solid var(--color-line)" }}>
                <span>Edital</span>
                <span className="hidden xl:block text-right">Valor</span>
                <span className="hidden xl:block">Prazo</span>
                <span>Status</span>
                <span />
              </div>
              {[
                { label: "Prazo aberto", items: openGroup, strong: true },
                { label: "Sem prazo de abertura", items: otherGroup, strong: false },
              ].map((g) =>
                g.items.length === 0 ? null : (
                  <div key={g.label}>
                    <p className={groupHead} style={{ letterSpacing: "0.1em", color: g.strong ? "var(--color-text)" : "var(--color-muted)", borderBottom: "1px solid var(--color-line)" }}>
                      {g.label} · {g.items.length}
                    </p>
                    {g.items.map((a) => <FavoriteRow key={a.id} article={a} meta={meta} onChange={updateMeta} />)}
                  </div>
                ),
              )}
            </>
          )}
        </section>
      </DashboardLayout>
    </AuthGuard>
  );
}

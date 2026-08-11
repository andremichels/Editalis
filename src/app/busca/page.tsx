"use client";

import { useState, useCallback } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchHeader } from "@/components/busca/SearchHeader";
import { SearchFilters } from "@/components/busca/SearchFilters";
import { SearchResultsHeader } from "@/components/busca/SearchResultsHeader";
import { SearchResultItem } from "@/components/busca/SearchResultItem";
import { Pagination } from "@/components/busca/Pagination";
import { useFavorites } from "@/lib/useFavorites";
import { useToast } from "@/components/Toast";
import type { Article } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";
const PAGE_SIZE = 10;

export default function BuscaPage() {
  const { toggle, isFavorite } = useFavorites();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [elapsed, setElapsed] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [booleanMode, setBooleanMode] = useState(true);
  const [semanticMode, setSemanticMode] = useState(false);
  const [smartMode, setSmartMode] = useState(false);
  const [smartFilters, setSmartFilters] = useState<Record<string, any> | null>(null);

  // Filters
  const [organs, setOrgans] = useState<string[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [valueMin, setValueMin] = useState("");
  const [valueMax, setValueMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const doSearch = useCallback(
    async (q: string, p: number = 1) => {
      if (!q || q.trim().length < 3) return;
      setLoading(true);
      setSearched(true);
      setQuery(q);
      setPage(p);
      const t0 = performance.now();

      try {
        const offset = (p - 1) * PAGE_SIZE;
        const modeParam = booleanMode ? "&mode=boolean" : "";
        const sortParam = "&sort_by=date";  // default: date (most recent first)
        const dateFromParam = dateFrom ? `&published_since=${dateFrom}` : "";
        const dateToParam = dateTo ? `&published_until=${dateTo}` : "";
        const searchPath = semanticMode ? "search/semantic" : "search";
        const hybridParam = semanticMode ? "&hybrid=true" : "";
        const url = `${API_BASE}/api/v1/${searchPath}?q=${encodeURIComponent(q)}&limit=${PAGE_SIZE}&offset=${offset}${modeParam}${dateFromParam}${dateToParam}${sortParam}${hybridParam}`;
        const res = await fetch(url);
        const body = await res.json();
        const all: Article[] = body.results || [];
        const apiTotal: number = body.count || 0;

        // Client-side filtering
        let filtered = all;
        if (organs.length > 0) {
          filtered = filtered.filter(
            (a) => a.organ && organs.some((o) => a.organ!.toLowerCase().includes(o.toLowerCase()))
          );
        }
        if (modalities.length > 0) {
          filtered = filtered.filter((a) => {
            const m = a.normalized_data?.modality;
            return m && modalities.some((f) => f.toLowerCase() === m.toLowerCase());
          });
        }
        if (ufs.length > 0) {
          filtered = filtered.filter((a) => {
            const au = a.normalized_data?.ufs || [];
            return ufs.some((u) => au.map((x) => x.toUpperCase()).includes(u.toUpperCase()));
          });
        }
        const vMin = valueMin ? parseFloat(valueMin) : 0;
        const vMax = valueMax ? parseFloat(valueMax) : Infinity;
        if (vMin > 0 || vMax < Infinity) {
          filtered = filtered.filter((a) => {
            const v = a.normalized_data?.value;
            if (v == null) return vMin === 0;
            return v >= vMin && v <= vMax;
          });
        }

        setResults(filtered);
        setTotal(apiTotal);
      } catch {
        setResults([]);
        setTotal(0);
      }
      setElapsed(`${((performance.now() - t0) / 1000).toFixed(2).replace(".", ",")} s`);
      setLoading(false);
    },
    [organs, modalities, ufs, valueMin, valueMax, booleanMode, semanticMode]
  );

  const handleSmartSearch = async (q: string) => {
    if (!q || q.trim().length < 5) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/search/parse?q=${encodeURIComponent(q)}`, { method: "POST" });
      const filters = await res.json();
      setSmartFilters(filters);
      // Apply parsed filters
      if (filters.modalities?.length) setModalities(filters.modalities);
      if (filters.ufs?.length) setUfs(filters.ufs);
      if (filters.value_min) setValueMin(String(filters.value_min));
      if (filters.value_max) setValueMax(String(filters.value_max));
      if (filters.organ) setOrgans([filters.organ]);
      // Use remaining keywords as search query
      const searchQ = filters.keywords?.join(" ") || q;
      doSearch(searchQ);
    } catch {
      doSearch(q);
    }
    setLoading(false);
  };

  const handleClearFilters = () => {
    setOrgans([]);
    setModalities([]);
    setUfs([]);
    setValueMin("");
    setValueMax("");
    setDateFrom("");
    setDateTo("");
  };

  const handleSaveAsAlert = () => {
    if (!query) return;
    const params = new URLSearchParams();
    params.set("name", query.slice(0, 50));
    params.set("keywords", query);
    if (organs.length) params.set("organs", organs.join(","));
    if (ufs.length) params.set("ufs", ufs.join(","));
    if (modalities.length) params.set("modalities", modalities.join(","));
    if (valueMin) params.set("value_min", valueMin);
    if (valueMax) params.set("value_max", valueMax);
    window.location.href = `/alertas?prefill=${encodeURIComponent(params.toString())}`;
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <SearchHeader
          onSearch={(q) => doSearch(q)}
          loading={loading}
          booleanMode={booleanMode}
          onToggleMode={setBooleanMode}
          semanticMode={semanticMode}
          onToggleSemantic={setSemanticMode}
          smartMode={smartMode}
          onSmartSearch={handleSmartSearch}
          onToggleSmart={setSmartMode}
        />
        <div className="grid grid-cols-[268px_1fr]" style={{ minHeight: 600 }}>
          <SearchFilters
            organs={organs} setOrgans={setOrgans}
            modalities={modalities} setModalities={setModalities}
            ufs={ufs} setUfs={setUfs}
            valueMin={valueMin} setValueMin={setValueMin}
            valueMax={valueMax} setValueMax={setValueMax}
            dateFrom={dateFrom} setDateFrom={setDateFrom}
            dateTo={dateTo} setDateTo={setDateTo}
            onApply={() => { if (query) doSearch(query); }}
            onClear={handleClearFilters}
          />
          <div className="min-w-0">
            {!searched ? (
              <div className="py-24 text-center">
                <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
                  Use o campo de busca para pesquisar atos oficiais. Ative 🧠 para busca em linguagem natural.
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--color-neutral-400)" }}>
                  Operadores booleanos ativos: AND, OR, NOT (-), "frase exata"
                </p>
              </div>
            ) : loading ? (
              <div className="py-16 px-10 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 skeleton" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-bold mb-1">Nenhum resultado encontrado.</p>
                <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
                  Tente outros termos ou remova filtros.
                </p>
              </div>
            ) : (
              <>
                {smartFilters && (
                <div className="px-10 py-3 text-sm" style={{ background: "var(--color-neutral-100)", borderBottom: "1px solid var(--color-divider)" }}>
                  <span style={{ color: "var(--color-neutral-600)" }}>Entendi: </span>
                  {smartFilters.modalities?.length > 0 && <span className="font-bold">{smartFilters.modalities.join(", ")} </span>}
                  {smartFilters.ufs?.length > 0 && <span className="font-bold">em {smartFilters.ufs.join(", ")} </span>}
                  {smartFilters.value_min && <span className="font-bold">acima de R$ {smartFilters.value_min.toLocaleString("pt-BR")} </span>}
                  {smartFilters.keywords?.length > 0 && <span style={{ color: "var(--color-neutral-500)" }}>— {smartFilters.keywords.join(" ")}</span>}
                </div>
              )}
              <SearchResultsHeader total={total.toLocaleString("pt-BR")} elapsed={elapsed} />
                {results.map((a) => (
                  <SearchResultItem
                    key={a.id}
                    article={a}
                    favorita={isFavorite(a.id)}
                    onToggleFavorita={() => toggle(a.id)}
                  />
                ))}
                <Pagination
                  pages={Math.ceil(total / PAGE_SIZE)}
                  current={page}
                  onPage={(p) => doSearch(query, p)}
                />

                {/* Save as alert */}
                <div className="px-10 py-4" style={{ borderTop: '1px solid var(--color-divider)' }}>
                  <button
                    onClick={handleSaveAsAlert}
                    className="text-sm font-bold underline cursor-pointer"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Salvar busca como alerta →
                  </button>
                  <span className="text-xs ml-2" style={{ color: 'var(--color-neutral-500)' }}>
                    Receba novos resultados por e-mail
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

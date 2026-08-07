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
import type { Article } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";
const PAGE_SIZE = 10;

export default function BuscaPage() {
  const { toggle, isFavorite } = useFavorites();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [elapsed, setElapsed] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Filters
  const [organs, setOrgans] = useState<string[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [valueMin, setValueMin] = useState("");
  const [valueMax, setValueMax] = useState("");

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
        const url = `${API_BASE}/api/v1/search?q=${encodeURIComponent(q)}&limit=${PAGE_SIZE}&offset=${offset}`;
        const res = await fetch(url);
        const data: Article[] = await res.json();

        // Client-side filtering for modalities, UFs, value
        let filtered = data || [];
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
            if (v == null) return vMin === 0; // include if no value filter min
            return v >= vMin && v <= vMax;
          });
        }

        setResults(filtered);
        setTotal(filtered.length);
      } catch {
        setResults([]);
        setTotal(0);
      }
      setElapsed(`${((performance.now() - t0) / 1000).toFixed(2).replace(".", ",")} s`);
      setLoading(false);
    },
    [organs, modalities, ufs, valueMin, valueMax]
  );

  const handleClearFilters = () => {
    setOrgans([]);
    setModalities([]);
    setUfs([]);
    setValueMin("");
    setValueMax("");
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <SearchHeader onSearch={(q) => doSearch(q)} loading={loading} />
        <div className="grid grid-cols-[268px_1fr]" style={{ minHeight: 600 }}>
          <SearchFilters
            organs={organs} setOrgans={setOrgans}
            modalities={modalities} setModalities={setModalities}
            ufs={ufs} setUfs={setUfs}
            valueMin={valueMin} setValueMin={setValueMin}
            valueMax={valueMax} setValueMax={setValueMax}
            onApply={() => { if (query) doSearch(query); }}
            onClear={handleClearFilters}
          />
          <div className="min-w-0">
            {!searched ? (
              <div className="py-24 text-center">
                <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
                  Use o campo de busca para pesquisar atos oficiais.
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
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

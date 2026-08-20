"use client";

import { useState, useCallback, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchHeader } from "@/components/busca/SearchHeader";
import { SearchFilters } from "@/components/busca/SearchFilters";
import { SearchResultsHeader } from "@/components/busca/SearchResultsHeader";
import { SearchResultItem } from "@/components/busca/SearchResultItem";
import { Pagination } from "@/components/busca/Pagination";
import { useFavorites } from "@/lib/useFavorites";
import { useToast } from "@/components/Toast";
import { track } from "@/lib/analytics";
import { getPreferences, getVerticals } from "@/lib/api";
import type { SearchPreferences } from "@/lib/api";
import type { Article, Vertical } from "@/lib/types";

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters
  const [organs, setOrgans] = useState<string[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [verticals, setVerticals] = useState<string[]>([]);
  const [availableVerticals, setAvailableVerticals] = useState<Vertical[]>([]);
  const [valueMin, setValueMin] = useState("");
  const [valueMax, setValueMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [sectorOnly, setSectorOnly] = useState(true);
  const [profilePrefs, setProfilePrefs] = useState<SearchPreferences | null>(null);

  // Aplica as preferências do perfil como filtros default (P1: busca respeita o perfil)
  useEffect(() => {
    Promise.all([getPreferences(), getVerticals()])
      .then(([prefs, verts]) => {
        setAvailableVerticals(verts);
        setProfilePrefs(prefs);
        const hasScope = (prefs.verticals?.length || 0) > 0
          || (prefs.ufs_padrao?.length || 0) > 0
          || prefs.valor_minimo_interesse != null;
        if (hasScope) {
          setVerticals(prefs.verticals ?? []);
          setUfs(prefs.ufs_padrao ?? []);
          if (prefs.valor_minimo_interesse != null) setValueMin(String(prefs.valor_minimo_interesse));
          setSectorOnly(true);
        } else {
          setSectorOnly(false);
        }
      })
      .catch(() => {
        // fallback: ao menos carrega as verticais pra renderizar os chips
        getVerticals().then(setAvailableVerticals).catch(() => {});
      });
  }, []);

  const doSearch = useCallback(
    async (
      q: string,
      p: number = 1,
      opts?: { verticals?: string[]; ufs?: string[]; valueMin?: string; valueMax?: string; sortBy?: 'relevance' | 'date' }
    ) => {
      if (!q || q.trim().length < 3) return;
      setLoading(true);
      setSearched(true);
      setQuery(q);
      setPage(p);
      const t0 = performance.now();

      const v = opts?.verticals ?? verticals;
      const u = opts?.ufs ?? ufs;
      const vmin = opts?.valueMin ?? valueMin;
      const vmax = opts?.valueMax ?? valueMax;
      const sort = opts?.sortBy ?? sortBy;

      try {
        const offset = (p - 1) * PAGE_SIZE;
        const modeParam = booleanMode ? "&mode=boolean" : "";
        const sortParam = `&sort_by=${sort}`;
        const dateFromParam = dateFrom ? `&published_since=${dateFrom}` : "";
        const dateToParam = dateTo ? `&published_until=${dateTo}` : "";
        const verticalsParam = v.length ? `&verticals=${v.join(",")}` : "";
        const ufsParam = u.length ? `&ufs=${u.join(",")}` : "";
        const valueMinParam = vmin ? `&value_min=${vmin}` : "";
        const valueMaxParam = vmax ? `&value_max=${vmax}` : "";
        const searchPath = semanticMode ? "search/semantic" : "search";
        const hybridParam = semanticMode ? "&hybrid=true" : "";
        const url = `${API_BASE}/api/v1/${searchPath}?q=${encodeURIComponent(q)}&limit=${PAGE_SIZE}&offset=${offset}${modeParam}${dateFromParam}${dateToParam}${sortParam}${hybridParam}${verticalsParam}${ufsParam}${valueMinParam}${valueMaxParam}`;
        const res = await fetch(url);
        const body = await res.json();
        const all: Article[] = body.results || [];
        const apiTotal: number = body.count || 0;

        // Client-side filtering (só órgão e modalidade — backend já trata verticais/UFs/valor)
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

        setResults(filtered);
        setTotal(apiTotal);
        track('search_performed', {
          query_length: q.trim().length,
          mode: semanticMode ? 'semantic' : booleanMode ? 'boolean' : 'keyword',
          results_count: apiTotal,
          page: p,
        });
      } catch {
        setResults([]);
        setTotal(0);
      }
      setElapsed(`${((performance.now() - t0) / 1000).toFixed(2).replace(".", ",")} s`);
      setLoading(false);
    },
    [organs, modalities, verticals, ufs, valueMin, valueMax, sortBy, booleanMode, semanticMode]
  );

  const handleSmartSearch = async (q: string) => {
    if (!q || q.trim().length < 5) return;
    setLoading(true);
    track('smart_search_used', { query_length: q.trim().length });
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

  // P3 — toggle "só meu setor": liga/desliga a personalização do perfil
  const handleSectorOnly = (on: boolean) => {
    setSectorOnly(on);
    const prefs = profilePrefs;
    if (on && prefs) {
      setVerticals(prefs.verticals ?? []);
      setUfs(prefs.ufs_padrao ?? []);
      if (prefs.valor_minimo_interesse != null) setValueMin(String(prefs.valor_minimo_interesse));
    } else {
      setVerticals([]);
      setUfs([]);
      setValueMin("");
    }
    track('search_sector_only', { on });
    if (query) {
      doSearch(query, 1, {
        verticals: on && prefs ? (prefs.verticals ?? []) : [],
        ufs: on && prefs ? (prefs.ufs_padrao ?? []) : [],
        valueMin: on && prefs && prefs.valor_minimo_interesse != null ? String(prefs.valor_minimo_interesse) : "",
      });
    }
  };

  // Troca de ordenação (relevância vs data)
  const handleSortChange = (s: 'relevance' | 'date') => {
    setSortBy(s);
    track('search_sort_changed', { sort: s });
    if (query) doSearch(query, 1, { sortBy: s });
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

  const activeFilterCount = organs.length + modalities.length + ufs.length
    + (valueMin ? 1 : 0) + (valueMax ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const verticalNames = verticals
    .map((slug) => availableVerticals.find((v) => v.slug === slug)?.name)
    .filter(Boolean)
    .join(', ');
  const profileScoped = verticals.length > 0 || ufs.length > 0 || !!valueMin;

  const handleApplyFilters = () => {
    track('filter_applied', {
      organs_count: organs.length,
      modalities_count: modalities.length,
      ufs_count: ufs.length,
      has_value_range: !!(valueMin || valueMax),
      has_date_range: !!(dateFrom || dateTo),
    });
    if (query) doSearch(query);
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
          sectorOnly={sectorOnly}
          onSectorOnly={handleSectorOnly}
        />
        {/* Mobile filters trigger */}
        <div className="lg:hidden px-10 py-3 flex items-center" style={{ borderBottom: '1px solid var(--color-divider)' }}>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="text-[13px] font-bold py-2 px-4 cursor-pointer"
            style={{ border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
          >
            Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>

        {/* Mobile filters bottom sheet */}
        {mobileFiltersOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileFiltersOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-h-[85vh] overflow-y-auto"
              style={{ background: 'var(--color-bg)', borderTop: '3px solid var(--color-text)' }}
            >
              <div style={{ width: 44, height: 4, background: 'var(--color-neutral-400)' }} className="mx-auto mt-3 mb-1" />
              <SearchFilters
                organs={organs} setOrgans={setOrgans}
                modalities={modalities} setModalities={setModalities}
                ufs={ufs} setUfs={setUfs}
                verticals={verticals} setVerticals={setVerticals}
                availableVerticals={availableVerticals}
                valueMin={valueMin} setValueMin={setValueMin}
                valueMax={valueMax} setValueMax={setValueMax}
                dateFrom={dateFrom} setDateFrom={setDateFrom}
                dateTo={dateTo} setDateTo={setDateTo}
                onApply={() => { handleApplyFilters(); setMobileFiltersOpen(false); }}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        )}

        {profileScoped && (
          <div className="px-5 py-3 flex items-center justify-between gap-3" style={{ background: 'var(--color-neutral-100)', borderBottom: '1px solid var(--color-divider)' }}>
            <span className="text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>
              {verticalNames ? (
                <>Buscando no seu setor: <strong>{verticalNames}</strong>{ufs.length > 0 ? ` · ${ufs.join('/')}` : ''}{valueMin ? ` · a partir de R$ ${Number(valueMin).toLocaleString('pt-BR')}` : ''}</>
              ) : (
                <>Filtros do seu perfil aplicados</>
              )}
            </span>
            <button
              onClick={() => handleSectorOnly(false)}
              className="text-[12px] font-bold underline cursor-pointer border-0 bg-transparent shrink-0"
              style={{ color: 'var(--color-accent)' }}
            >
              mostrar tudo
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[268px_1fr]" style={{ minHeight: 600 }}>
          <div className="hidden lg:block" style={{ borderRight: '2px solid var(--color-text)' }}>
            <SearchFilters
              organs={organs} setOrgans={setOrgans}
              modalities={modalities} setModalities={setModalities}
              ufs={ufs} setUfs={setUfs}
              verticals={verticals} setVerticals={setVerticals}
              availableVerticals={availableVerticals}
              valueMin={valueMin} setValueMin={setValueMin}
              valueMax={valueMax} setValueMax={setValueMax}
              dateFrom={dateFrom} setDateFrom={setDateFrom}
              dateTo={dateTo} setDateTo={setDateTo}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
          </div>
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
              <SearchResultsHeader total={total.toLocaleString("pt-BR")} elapsed={elapsed} sortBy={sortBy} onSortChange={handleSortChange} />
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

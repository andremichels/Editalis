"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchHeader, type SearchMode } from "@/components/busca/SearchHeader";
import { SearchFilters } from "@/components/busca/SearchFilters";
import { SearchResultsHeader } from "@/components/busca/SearchResultsHeader";
import { SearchResultItem } from "@/components/busca/SearchResultItem";
import { Pagination } from "@/components/busca/Pagination";
import { track } from "@/lib/analytics";
import { getPreferences, getVerticals } from "@/lib/api";
import type { SearchPreferences } from "@/lib/api";
import type { Article, Vertical } from "@/lib/types";
import { articleKind, articleTitle, formatDateShort, formatMoney, modalityLabel } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";
const PAGE_SIZE = 10;
const LAST_SEARCH_KEY = "editalis_last_search";

/** Última busca da sessão — restaurada ao voltar de uma publicação. */
interface SavedSearch {
  q: string;
  page: number;
  organs: string[];
  modalities: string[];
  ufs: string[];
  verticals: string[];
  valueMin: string;
  valueMax: string;
  dateFrom: string;
  dateTo: string;
  sortBy: "relevance" | "date";
  booleanMode: boolean;
  semanticMode: boolean;
  sectorOnly: boolean;
}

function readSavedSearch(): SavedSearch | null {
  try {
    const raw = sessionStorage.getItem(LAST_SEARCH_KEY);
    return raw ? (JSON.parse(raw) as SavedSearch) : null;
  } catch {
    return null;
  }
}

function downloadSearchCsv(articles: Article[]) {
  if (!articles.length) return;
  const header = ["Título", "Órgão", "Modalidade", "Tipo", "Valor (R$)", "UFs", "Processo", "Abertura", "Publicado", "Link"];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = articles.map((a) => {
    const nd = a.normalized_data;
    return [
      articleTitle(a, 300),
      a.organ_level_1 || a.organ || "",
      modalityLabel(nd?.modality),
      articleKind(a),
      nd?.value != null ? nd.value : "",
      (nd?.ufs || []).join(";"),
      nd?.process_number || "",
      nd?.opening_date || "",
      a.published_date || "",
      `https://www.in.gov.br/web/dou/-/${a.slug}`,
    ];
  });
  const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `editalis-busca-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function BuscaPage() {
  // Última busca da sessão (ao voltar de uma publicação): inicializa os filtros
  // direto no estado; a tela fica atrás do esqueleto do AuthGuard no 1º render.
  const [saved] = useState<SavedSearch | null>(() => (typeof window === "undefined" ? null : readSavedSearch()));
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [elapsed, setElapsed] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [booleanMode, setBooleanMode] = useState(saved?.booleanMode ?? true);
  const [semanticMode, setSemanticMode] = useState(saved?.semanticMode ?? false);
  const [smartMode, setSmartMode] = useState(false);
  const [smartFilters, setSmartFilters] = useState<Record<string, any> | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters
  const [organs, setOrgans] = useState<string[]>(saved?.organs ?? []);
  const [modalities, setModalities] = useState<string[]>(saved?.modalities ?? []);
  const [ufs, setUfs] = useState<string[]>(saved?.ufs ?? []);
  const [verticals, setVerticals] = useState<string[]>(saved?.verticals ?? []);
  const [availableVerticals, setAvailableVerticals] = useState<Vertical[] | null>(null);
  const [valueMin, setValueMin] = useState(saved?.valueMin ?? "");
  const [valueMax, setValueMax] = useState(saved?.valueMax ?? "");
  const [dateFrom, setDateFrom] = useState(saved?.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(saved?.dateTo ?? "");
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>(saved?.sortBy ?? 'relevance');
  const [sectorOnly, setSectorOnly] = useState(saved?.sectorOnly ?? true);
  const [profilePrefs, setProfilePrefs] = useState<SearchPreferences | null>(null);
  // Total sem o escopo do setor, quando a busca com escopo deu zero
  const [unscopedTotal, setUnscopedTotal] = useState<number | null>(null);
  // Restauração da última busca (sessionStorage) ao voltar para esta tela
  const restoredRef = useRef(saved !== null);
  // Ignora respostas de buscas antigas (filtros mudam rápido e as buscas se cruzam)
  const requestId = useRef(0);
  const pendingRestore = useRef<SavedSearch | null>(saved);
  const initialQuery = saved?.q ?? "";



  // Aplica as preferências do perfil como filtros default (P1: busca respeita o perfil)
  useEffect(() => {
    Promise.all([getPreferences(), getVerticals()])
      .then(([prefs, verts]) => {
        setAvailableVerticals(verts);
        setProfilePrefs(prefs);
        if (restoredRef.current) return; // a busca restaurada já trouxe seus filtros
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
        getVerticals().then(setAvailableVerticals).catch(() => setAvailableVerticals([]));
      });
  }, []);

  const doSearch = useCallback(
    async (
      q: string,
      p: number = 1,
      opts?: { verticals?: string[]; ufs?: string[]; valueMin?: string; valueMax?: string; sortBy?: 'relevance' | 'date' }
    ) => {
      if (!q || q.trim().length < 3) return;
      const id = ++requestId.current;
      setLoading(true);
      setSearched(true);
      setUnscopedTotal(null);
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
        if (id !== requestId.current) return;
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
        try {
          const saved: SavedSearch = {
            q, page: p, organs, modalities, ufs: u, verticals: v, valueMin: vmin, valueMax: vmax,
            dateFrom, dateTo, sortBy: sort, booleanMode, semanticMode, sectorOnly,
          };
          sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(saved));
        } catch {}

        // "Somente meu setor" pode esconder tudo: conta quantos haveria sem ele,
        // para oferecer "ver todos" em vez de um zero seco.
        if (apiTotal === 0 && (v.length || u.length || vmin)) {
          const unscopedUrl = `${API_BASE}/api/v1/${searchPath}?q=${encodeURIComponent(q)}&limit=1&offset=0${modeParam}${dateFromParam}${dateToParam}${sortParam}${hybridParam}${valueMaxParam}`;
          fetch(unscopedUrl)
            .then((r) => r.json())
            .then((b) => setUnscopedTotal(b.count || 0))
            .catch(() => {});
        }
        track('search_performed', {
          query_length: q.trim().length,
          mode: semanticMode ? 'semantic' : booleanMode ? 'boolean' : 'keyword',
          results_count: apiTotal,
          page: p,
        });
      } catch {
        if (id !== requestId.current) return;
        setResults([]);
        setTotal(0);
      }
      if (id !== requestId.current) return;
      setElapsed(`${((performance.now() - t0) / 1000).toFixed(2).replace(".", ",")} s`);
      setLoading(false);
    },
    [organs, modalities, verticals, ufs, valueMin, valueMax, sortBy, booleanMode, semanticMode, dateFrom, dateTo, sectorOnly]
  );

  useEffect(() => {
    const restore = pendingRestore.current;
    if (!restore) return;
    pendingRestore.current = null;
    doSearch(restore.q, restore.page);
  }, [doSearch]);

  // Filtros instantâneos: qualquer mudança refaz a busca (com uma pequena
  // espera para agrupar cliques e digitação de valores).
  const filterKey = JSON.stringify([organs, modalities, ufs, verticals, valueMin, valueMax, dateFrom, dateTo, sortBy, booleanMode, semanticMode]);
  const lastFilterKey = useRef(filterKey);
  useEffect(() => {
    if (filterKey === lastFilterKey.current) return;
    lastFilterKey.current = filterKey;
    if (!query) return;
    const t = setTimeout(() => {
      doSearch(query, 1);
      track('filter_applied', {
        organs_count: organs.length,
        modalities_count: modalities.length,
        ufs_count: ufs.length,
        has_value_range: !!(valueMin || valueMax),
        has_date_range: !!(dateFrom || dateTo),
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const mode: SearchMode = smartMode ? "ia" : semanticMode ? "semantica" : "palavras";
  const handleModeChange = (m: SearchMode) => {
    setSmartMode(m === "ia");
    setSemanticMode(m === "semantica");
    setBooleanMode(true);
    track('search_mode_changed', { mode: m });
  };

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
  };

  // Troca de ordenação (relevância vs data)
  const handleSortChange = (s: 'relevance' | 'date') => {
    setSortBy(s);
    track('search_sort_changed', { sort: s });
  };

  const handleExportCsv = () => {
    downloadSearchCsv(results);
    track('search_export_csv', { count: results.length });
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
    router.push(`/alertas?prefill=${encodeURIComponent(params.toString())}`);
  };

  // Chips dos filtros ativos — cada um remove o seu filtro.
  const chips: { key: string; label: string; remove: () => void }[] = [
    ...verticals.map((slug) => ({
      key: `v:${slug}`,
      label: availableVerticals?.find((x) => x.slug === slug)?.name ?? slug,
      remove: () => setVerticals(verticals.filter((x) => x !== slug)),
    })),
    ...ufs.map((uf) => ({ key: `u:${uf}`, label: uf, remove: () => setUfs(ufs.filter((x) => x !== uf)) })),
    ...modalities.map((m) => ({ key: `m:${m}`, label: modalityLabel(m), remove: () => setModalities(modalities.filter((x) => x !== m)) })),
    ...organs.map((o) => ({ key: `o:${o}`, label: o, remove: () => setOrgans(organs.filter((x) => x !== o)) })),
    ...(valueMin ? [{ key: 'vmin', label: `a partir de ${formatMoney(valueMin)}`, remove: () => setValueMin('') }] : []),
    ...(valueMax ? [{ key: 'vmax', label: `até ${formatMoney(valueMax)}`, remove: () => setValueMax('') }] : []),
    ...(dateFrom ? [{ key: 'df', label: `desde ${formatDateShort(dateFrom)}`, remove: () => setDateFrom('') }] : []),
    ...(dateTo ? [{ key: 'dt', label: `até ${formatDateShort(dateTo)}`, remove: () => setDateTo('') }] : []),
  ];

  const chipStyle = { border: "1px solid var(--color-text)", background: "var(--color-field)", color: "var(--color-text)" };
  const chipList = (
    <>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.remove}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 text-[13px] font-semibold cursor-pointer"
          style={chipStyle}
          aria-label={`Remover filtro ${c.label}`}
        >
          {c.label} <span aria-hidden>×</span>
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => { handleClearFilters(); setVerticals([]); }}
          className="h-8 px-1.5 text-[13px] font-semibold underline cursor-pointer"
          style={{ color: "var(--color-accent-text)", background: "transparent", border: 0 }}
        >
          Limpar tudo
        </button>
      )}
    </>
  );

  const activeFilterCount = organs.length + modalities.length + ufs.length
    + (valueMin ? 1 : 0) + (valueMax ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const verticalNames = verticals
    .map((slug) => availableVerticals?.find((v) => v.slug === slug)?.name)
    .filter(Boolean)
    .join(', ');
  const scopeSummary = sectorOnly
    ? [verticalNames, ufs.join(', '), valueMin ? `a partir de ${formatMoney(valueMin)}` : ''].filter(Boolean).join(' · ')
    : [
        (profilePrefs?.verticals ?? []).map((slug) => availableVerticals?.find((v) => v.slug === slug)?.name).filter(Boolean).join(', '),
        (profilePrefs?.ufs_padrao ?? []).join(', '),
      ].filter(Boolean).join(' · ');


  return (
    <AuthGuard>
      <DashboardLayout>
        <SearchHeader
          onSearch={(q) => doSearch(q)}
          loading={loading}
          mode={mode}
          onModeChange={handleModeChange}
          onSmartSearch={handleSmartSearch}
          initialQuery={initialQuery}
        />
        {/* Mobile filters trigger */}
        <div className="lg:hidden px-4 sm:px-12 py-3 flex items-center" style={{ borderBottom: '1px solid var(--color-line)' }}>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="h-11 text-[14px] font-bold px-4 cursor-pointer"
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
                sectorOnly={sectorOnly} onSectorOnly={handleSectorOnly} scopeSummary={scopeSummary}
                onDone={() => setMobileFiltersOpen(false)}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[288px_minmax(0,1fr)]" style={{ minHeight: 600 }}>
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
              sectorOnly={sectorOnly} onSectorOnly={handleSectorOnly} scopeSummary={scopeSummary}
              onClear={handleClearFilters}
            />
          </div>
          <div className="min-w-0 px-4 sm:px-12 pb-16">
            {!searched ? (
              <div className="py-16">
                <p className="text-[14px]" style={{ color: "var(--color-neutral-700)" }}>
                  Digite o que procura no campo acima — um assunto, um órgão ou um número de processo.
                </p>
              </div>
            ) : loading ? (
              <div className="py-10 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 skeleton" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="py-16 max-w-xl">
                {unscopedTotal ? (
                  <>
                    <p className="text-[15px] font-bold mb-1">Nenhum resultado no seu setor.</p>
                    <p className="text-[14px] mb-4" style={{ color: "var(--color-neutral-700)" }}>
                      Mas há {unscopedTotal.toLocaleString("pt-BR")} resultado{unscopedTotal === 1 ? "" : "s"} para “{query}” em todos os setores.
                    </p>
                    <button
                      onClick={() => handleSectorOnly(false)}
                      className="py-2.5 px-4 text-[13px] font-bold cursor-pointer"
                      style={{ background: "var(--color-accent)", color: "#fff", border: "none" }}
                    >
                      Ver todos os {unscopedTotal.toLocaleString("pt-BR")}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[15px] font-bold mb-1">Nenhum resultado encontrado.</p>
                    <p className="text-[14px]" style={{ color: "var(--color-neutral-700)" }}>
                      Tente outros termos ou remova filtros.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                {smartFilters && (
                <div className="mt-5 px-4 py-3 text-sm" style={{ background: "var(--color-field)", border: "1px solid var(--color-line)" }}>
                  <span style={{ color: "var(--color-neutral-700)" }}>Entendi: </span>
                  {smartFilters.modalities?.length > 0 && <span className="font-bold">{smartFilters.modalities.join(", ")} </span>}
                  {smartFilters.ufs?.length > 0 && <span className="font-bold">em {smartFilters.ufs.join(", ")} </span>}
                  {smartFilters.value_min && <span className="font-bold">acima de R$ {smartFilters.value_min.toLocaleString("pt-BR")} </span>}
                  {smartFilters.keywords?.length > 0 && <span style={{ color: "var(--color-neutral-700)" }}>— {smartFilters.keywords.join(" ")}</span>}
                </div>
              )}
              <SearchResultsHeader
                total={total.toLocaleString("pt-BR")}
                query={query}
                elapsed={elapsed}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                onExportCsv={handleExportCsv}
                onSaveAlert={handleSaveAsAlert}
                chips={chips.length > 0 ? chipList : undefined}
              />
                {results.map((a) => (
                  <SearchResultItem
                    key={a.id}
                    article={a}
                    query={query}
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

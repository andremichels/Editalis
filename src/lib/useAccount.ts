"use client";

import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/auth";
import { authFetch } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";
const LAST_VIEWED_KEY = "editalis_last_viewed";

/*
 * Dados da conta usados pelo menu e pelo Painel, buscados uma vez por usuário
 * e compartilhados entre todos os componentes.
 *
 * Antes Sidebar, MobileNav e Painel buscavam /alerts cada um por conta própria;
 * quando um deles corria antes da sessão estar pronta recebia 401, lia
 * `{detail}.length` como undefined e o menu mostrava "Alertas 0" numa tela e
 * "3" na outra.
 */

export interface AlertSummary {
  id: number;
  name: string;
  enabled: boolean;
  match_count: number;
  /** Como o alerta avisa ("app" = só no Editalis). */
  channel?: "email" | "whatsapp" | "app";
}

export interface LastViewed {
  slug: string;
  title: string;
}

interface AccountSnapshot {
  name: string;
  email: string;
  planLabel: string | null;
  /** null = ainda carregando */
  alerts: AlertSummary[] | null;
  lastViewed: LastViewed | null;
}

const EMPTY: AccountSnapshot = { name: "", email: "", planLabel: null, alerts: null, lastViewed: null };

let snapshot: AccountSnapshot = EMPTY;
let loadedFor: string | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function set(patch: Partial<AccountSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const r = await authFetch(`${API_BASE}${path}`);
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

function load(uid: string) {
  if (loadedFor === uid) return;
  loadedFor = uid;
  fetchJson<AlertSummary[]>("/api/v1/alerts").then((alerts) => {
    if (loadedFor === uid) set({ alerts: Array.isArray(alerts) ? alerts : [] });
  });
  fetchJson<{ plan_label?: string }>("/api/v1/account/subscription").then((sub) => {
    if (loadedFor === uid) set({ planLabel: sub?.plan_label ?? null });
  });
}

function readLastViewed(): LastViewed | null {
  try {
    const raw = localStorage.getItem(LAST_VIEWED_KEY);
    return raw ? (JSON.parse(raw) as LastViewed) : null;
  } catch {
    return null;
  }
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  snapshot = { ...snapshot, lastViewed: readLastViewed() };
  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    // fora do callback: métodos de auth dentro dele podem travar o lock do supabase-js
    setTimeout(() => {
      if (!user) {
        loadedFor = null;
        set({ ...EMPTY, lastViewed: snapshot.lastViewed });
        return;
      }
      set({
        name: user.user_metadata?.nome || user.email?.split("@")[0] || "",
        email: user.email || "",
      });
      load(user.id);
    }, 0);
  });
}

function subscribe(listener: () => void) {
  init();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAccount(): AccountSnapshot {
  return useSyncExternalStore(
    subscribe,
    () => {
      init();
      return snapshot;
    },
    () => EMPTY,
  );
}

/** Recarrega os alertas (após criar, editar, pausar ou remover um). */
export function refreshAlerts() {
  fetchJson<AlertSummary[]>("/api/v1/alerts").then((alerts) => {
    if (Array.isArray(alerts)) set({ alerts });
  });
}

/** Atualiza os alertas do menu com uma lista já buscada (evita outro request). */
export function setAlertsSnapshot(alerts: AlertSummary[]) {
  set({ alerts });
}

/** Guarda a última publicação aberta, para o atalho "Última consultada". */
export function rememberLastViewed(item: LastViewed) {
  try {
    localStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(item));
  } catch {}
  set({ lastViewed: item });
}

/** Soma de resultados dos alertas ativos — é o número que importa no menu. */
export function newMatchesCount(alerts: AlertSummary[] | null): number {
  return (alerts ?? []).filter((a) => a.enabled).reduce((sum, a) => sum + (a.match_count || 0), 0);
}

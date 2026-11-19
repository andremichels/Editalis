"use client";

import { useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";

/*
 * "Novo" = chegou ao Editalis (created_at) depois da visita anterior.
 * A visita anterior é lida uma vez por aba (sessionStorage segura o valor
 * durante a navegação) e a atual é gravada para a próxima vez.
 */

const KEY = "editalis_last_visit";
const SESSION_KEY = "editalis_prev_visit";
let prev: number | null | undefined;

function load(): number | null {
  if (prev !== undefined) return prev;
  if (typeof window === "undefined") return null;
  try {
    const kept = sessionStorage.getItem(SESSION_KEY);
    if (kept !== null) {
      prev = kept ? Number(kept) : null;
    } else {
      const stored = localStorage.getItem(KEY);
      prev = stored ? Number(stored) : null;
      sessionStorage.setItem(SESSION_KEY, stored ?? "");
      localStorage.setItem(KEY, String(Date.now()));
    }
  } catch {
    prev = null;
  }
  return prev;
}

const noop = () => () => {};

/** Momento da visita anterior (ms) — null na primeira visita ou no servidor. */
export function usePreviousVisit(): number | null {
  return useSyncExternalStore(noop, load, () => null);
}

export function isNewSince(a: Article, previousVisit: number | null): boolean {
  if (!previousVisit || !a.created_at) return false;
  const t = new Date(a.created_at).getTime();
  return Number.isFinite(t) && t > previousVisit;
}

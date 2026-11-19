"use client";

import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/auth";
import { authFetch } from "@/lib/api";

/*
 * Publicações já abertas pelo usuário ("lidas"). Mesmo padrão do
 * useFavorites: localStorage primeiro (instantâneo), sincronizado com
 * /api/v1/reads uma vez por usuário logado.
 */

const STORAGE_KEY = "editalis_reads";
const MAX = 2000;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";
const EMPTY: Set<number> = new Set();

let reads: Set<number> = EMPTY;
let userId: string | null = null;
let syncedUserId: string | null = null;
let initialized = false;
// Abertas antes de a sessão ser conhecida (1º carregamento): enviadas depois.
let pending: number[] = [];
const listeners = new Set<() => void>();

function publish(next: Set<number>) {
  reads = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next].slice(-MAX)));
  } catch {}
  listeners.forEach((l) => l());
}

function post(articleId: number) {
  authFetch(`${API_BASE}/api/v1/reads/${articleId}`, { method: "POST" }).catch(() => {});
}

function sync(uid: string) {
  const queued = pending;
  pending = [];
  queued.forEach(post);
  if (syncedUserId === uid) return;
  syncedUserId = uid;
  authFetch(`${API_BASE}/api/v1/reads`)
    .then((r) => (r.ok ? r.json() : []))
    .then((ids: number[]) => {
      if (!Array.isArray(ids) || syncedUserId !== uid) return;
      publish(new Set([...reads, ...ids]));
    })
    .catch(() => {
      if (syncedUserId === uid) syncedUserId = null;
    });
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) reads = new Set(JSON.parse(raw) as number[]);
  } catch {}
  supabase.auth.onAuthStateChange((_event, session) => {
    const uid = session?.user.id ?? null;
    setTimeout(() => {
      userId = uid;
      if (uid) sync(uid);
      else syncedUserId = null;
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

/** Marca como lida (local na hora; API em segundo plano). */
export function markRead(articleId: number) {
  init();
  if (reads.has(articleId)) return;
  publish(new Set([...reads, articleId]));
  if (userId) post(articleId);
  else pending.push(articleId);
}

export function useIsRead(articleId: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      init();
      return reads.has(articleId);
    },
    () => false,
  );
}

/** Todas as lidas (para filtrar listas, ex.: "Esconder vistos"). */
export function useReadIds(): Set<number> {
  return useSyncExternalStore(
    subscribe,
    () => {
      init();
      return reads;
    },
    () => EMPTY,
  );
}

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { supabase } from "@/lib/auth";
import { authFetch } from "@/lib/api";
import { track } from "@/lib/analytics";

const STORAGE_KEY = "editalis_favorites";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

/*
 * Store de favoritos compartilhado no nível do módulo.
 *
 * Antes cada chamada de useFavorites() tinha seu próprio estado e fazia seu
 * próprio GET /api/v1/favorites — ~12 requests idênticos no /dashboard, e o
 * contador da Sidebar não refletia um ★ clicado em outro componente. Agora
 * existe um único Set para a aba inteira, sincronizado com a API uma vez por
 * usuário logado (e de novo se o usuário da sessão mudar).
 */

interface Snapshot {
  favorites: Set<number>;
  loaded: boolean;
}

const SERVER_SNAPSHOT: Snapshot = { favorites: new Set(), loaded: false };

let snapshot: Snapshot = SERVER_SNAPSHOT;
let userId: string | null = null;
let syncedUserId: string | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function setFavorites(next: Set<number>) {
  snapshot = { favorites: next, loaded: true };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {}
  listeners.forEach((l) => l());
}

function syncWithApi(uid: string) {
  if (syncedUserId === uid) return;
  syncedUserId = uid;
  authFetch(`${API_BASE}/api/v1/favorites`)
    .then((r) => r.json())
    .then((articles: { id: number }[]) => {
      if (!Array.isArray(articles) || syncedUserId !== uid) return;
      const merged = new Set(snapshot.favorites);
      articles.forEach((a) => merged.add(a.id));
      setFavorites(merged);
    })
    .catch(() => {
      // permite nova tentativa numa próxima mudança de sessão
      if (syncedUserId === uid) syncedUserId = null;
    });
}

function setUser(uid: string | null) {
  userId = uid;
  if (uid) syncWithApi(uid);
  else syncedUserId = null;
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Local primeiro (instantâneo)
  const ids = new Set<number>();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) (JSON.parse(raw) as number[]).forEach((id) => ids.add(id));
  } catch {}
  snapshot = { favorites: ids, loaded: true };

  // Depois sincroniza com a API, uma vez por usuário. onAuthStateChange já
  // dispara INITIAL_SESSION ao registrar, então dispensa um getSession() extra.
  // O setTimeout segue a recomendação do supabase-js: chamar métodos de auth
  // (authFetch → getSession) direto dentro do callback pode travar o lock.
  supabase.auth.onAuthStateChange((_event, session) => {
    const uid = session?.user.id ?? null;
    setTimeout(() => setUser(uid), 0);
  });
}

function subscribe(listener: () => void) {
  init();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function toggleFavorite(articleId: number) {
  const next = new Set(snapshot.favorites);
  const removing = next.has(articleId);
  if (removing) next.delete(articleId);
  else next.add(articleId);
  setFavorites(next);

  track(removing ? "article_unfavorited" : "article_favorited", { article_id: articleId });
  if (userId) {
    authFetch(`${API_BASE}/api/v1/favorites/${articleId}`, { method: removing ? "DELETE" : "POST" }).catch(() => {});
  }
}

export function useFavorites() {
  const { favorites, loaded } = useSyncExternalStore(
    subscribe,
    () => {
      init();
      return snapshot;
    },
    () => SERVER_SNAPSHOT,
  );

  const isFavorite = useCallback((articleId: number) => favorites.has(articleId), [favorites]);

  return { favorites, toggle: toggleFavorite, isFavorite, loaded };
}

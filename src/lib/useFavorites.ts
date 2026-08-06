"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/auth";

const STORAGE_KEY = "editalis_favorites";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get userId from Supabase session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUserId(data.session.user.id);
    });
  }, []);

  // Load from localStorage + API
  useEffect(() => {
    const ids = new Set<number>();

    // Local first (instant)
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        JSON.parse(raw).forEach((id: number) => ids.add(id));
      }
    } catch {}

    setFavorites(ids);
    setLoaded(true);

    // Then sync with API (async, merge)
    if (userId) {
      fetch(`${API_BASE}/api/v1/favorites?user_id=${userId}`)
        .then((r) => r.json())
        .then((articles: any[]) => {
          if (Array.isArray(articles)) {
            setFavorites((prev) => {
              const merged = new Set(prev);
              articles.forEach((a: any) => merged.add(a.id));
              localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged]));
              return merged;
            });
          }
        })
        .catch(() => {});
    }
  }, [userId]);

  const toggle = useCallback((articleId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
        if (userId) {
          fetch(`${API_BASE}/api/v1/favorites/${articleId}?user_id=${userId}`, { method: "DELETE" }).catch(() => {});
        }
      } else {
        next.add(articleId);
        if (userId) {
          fetch(`${API_BASE}/api/v1/favorites/${articleId}?user_id=${userId}`, { method: "POST" }).catch(() => {});
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, [userId]);

  const isFavorite = useCallback((articleId: number) => favorites.has(articleId), [favorites]);

  return { favorites, toggle, isFavorite, loaded };
}

"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "editalis_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids: number[] = JSON.parse(raw);
        setFavorites(new Set(ids));
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Persist to localStorage
  const persist = useCallback((ids: Set<number>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  }, []);

  const toggle = useCallback((articleId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      persist(next);
      return next;
    });
  }, [persist]);

  const isFavorite = useCallback((articleId: number) => {
    return favorites.has(articleId);
  }, [favorites]);

  return { favorites, toggle, isFavorite, loaded };
}

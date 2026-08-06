"use client";

import { useFavorites } from "@/lib/useFavorites";

export function FavoriteButton({ articleId, size = "sm" }: { articleId: number; size?: "sm" | "md" }) {
  const { isFavorite, toggle, loaded } = useFavorites();

  if (!loaded) return null;

  const active = isFavorite(articleId);
  const dims = size === "md" ? { w: 28, h: 28, fs: 16 } : { w: 22, h: 22, fs: 12 };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(articleId);
      }}
      className="inline-flex items-center justify-center shrink-0 cursor-pointer transition-opacity hover:opacity-80"
      style={{
        width: dims.w,
        height: dims.h,
        fontSize: dims.fs,
        color: active ? "#ec3013" : "var(--color-neutral-500)",
        background: "transparent",
        border: "none",
      }}
      title={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {active ? "★" : "☆"}
    </button>
  );
}

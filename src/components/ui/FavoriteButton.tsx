"use client";

import { useFavorites } from "@/lib/useFavorites";

/**
 * Estrela de favorito. Neutra (não vermelha) e com área de clique de 32px —
 * o vermelho fica reservado para a ação principal e para prazos urgentes.
 */
export function FavoriteButton({ articleId, size = "sm" }: { articleId: number; size?: "sm" | "md" }) {
  const { isFavorite, toggle, loaded } = useFavorites();

  if (!loaded) return <span className="inline-block w-8 h-8" aria-hidden />;

  const active = isFavorite(articleId);
  const fs = size === "md" ? 20 : 17;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(articleId);
      }}
      className="inline-flex items-center justify-center shrink-0 w-8 h-8 cursor-pointer transition-opacity hover:opacity-70"
      style={{
        fontSize: fs,
        color: active ? "var(--color-text)" : "var(--color-neutral-600)",
        background: "transparent",
        border: "none",
      }}
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      title={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {active ? "★" : "☆"}
    </button>
  );
}

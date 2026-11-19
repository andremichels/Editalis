"use client";

import { useFavorites } from "@/lib/useFavorites";
import { StarIcon } from "@/components/ui/Icons";

/**
 * Estrela de favorito com área de clique de 44px. `boxed` desenha a borda
 * (versão completa da Busca); sem borda nas listas compactas.
 */
export function FavoriteButton({ articleId, boxed = false }: { articleId: number; boxed?: boolean }) {
  const { isFavorite, toggle, loaded } = useFavorites();

  if (!loaded) return <span className="inline-block w-11 h-11 shrink-0" aria-hidden />;

  const active = isFavorite(articleId);
  const label = active ? "Remover dos favoritos" : "Adicionar aos favoritos";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(articleId);
      }}
      className="inline-flex items-center justify-center shrink-0 w-11 h-11 cursor-pointer"
      style={
        boxed
          ? { border: "1px solid var(--color-text)", background: active ? "var(--color-text)" : "var(--color-field)", color: active ? "#fff" : "var(--color-text)" }
          : { border: "none", background: "transparent", color: "var(--color-text)" }
      }
      aria-pressed={active}
      aria-label={label}
      title={label}
    >
      <StarIcon filled={active} />
    </button>
  );
}

interface MatchArticle {
  id: number;
  slug: string;
  title: string;
  title_marker?: string;
  published_date: string;
  organ_level_1?: string;
}

interface MatchesListProps {
  loading: boolean;
  matches: MatchArticle[];
}

export function MatchesList({ loading, matches }: MatchesListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 skeleton" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <p className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>
        Nenhum artigo encontrado com esses critérios.
      </p>
    );
  }

  return (
    <div>
      {matches.map((a) => (
        <a
          key={a.id}
          href={`/artigo/${a.slug}`}
          className="block py-3 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ borderBottom: '1px solid var(--color-divider)', textDecoration: 'none' }}
        >
          <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-accent)' }}>
            {a.organ_level_1 || 'DOU'}
          </div>
          <div className="text-[13px] font-bold leading-snug" style={{ color: 'var(--color-text)' }}>
            {a.title_marker || a.title}
          </div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--color-neutral-500)' }}>
            {new Date(a.published_date).toLocaleDateString('pt-BR')}
          </div>
        </a>
      ))}
    </div>
  );
}

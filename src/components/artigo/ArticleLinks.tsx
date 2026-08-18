import type { Article } from '@/lib/types';

export function ArticleLinks({ article }: { article: Article }) {
  const links = article.links || [];
  const anexos = links.filter((l) => l.type === 'anexo');
  const portais = links.filter((l) => l.type === 'portal').slice(0, 4);
  const douLink = `https://www.in.gov.br/web/dou/-/${article.slug}`;

  if (anexos.length === 0 && portais.length === 0) return null;

  return (
    <div className="px-6 py-5" style={{ borderTop: '2px solid var(--color-divider)' }}>
      <h3
        className="text-[13px] font-black uppercase tracking-[0.06em] mb-3"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
      >
        Links úteis
      </h3>

      <a
        href={douLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block py-2 text-[13px] font-bold cursor-pointer"
        style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
      >
        Ver no Diário Oficial ↗
      </a>

      {anexos.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-2 text-[13px] font-bold cursor-pointer"
          style={{ color: 'var(--color-text)', textDecoration: 'none' }}
        >
          📎 Anexo — {l.text || l.url}
        </a>
      ))}

      {portais.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-2 text-[13px] font-bold cursor-pointer truncate"
          style={{ color: 'var(--color-text)', textDecoration: 'none' }}
        >
          {l.url.replace(/^https?:\/\//, '')}
        </a>
      ))}
    </div>
  );
}

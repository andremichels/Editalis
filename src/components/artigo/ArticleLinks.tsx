import type { Article } from '@/lib/types';
import { asideH2, asideH2Style } from '@/components/artigo/ArticleMeta';

/** Anexos e portais citados na publicação (o link do DOU fica no cabeçalho). */
export function ArticleLinks({ article }: { article: Article }) {
  const links = article.links || [];
  const anexos = links.filter((l) => l.type === 'anexo');
  const portais = links.filter((l) => l.type === 'portal').slice(0, 4);

  if (anexos.length === 0 && portais.length === 0) return null;

  const rowStyle = { borderBottom: '1px solid var(--color-line)' };

  return (
    <section className="print:hidden">
      <h2 className={asideH2} style={asideH2Style}>Links</h2>
      {anexos.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="block py-3 text-[14px] font-semibold leading-[1.4]" style={rowStyle}>
          Anexo — {l.text || l.url} <span aria-hidden>↗</span>
        </a>
      ))}
      {portais.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="block py-3 text-[14px] font-semibold truncate" style={rowStyle}>
          {l.url.replace(/^https?:\/\//, '')} <span aria-hidden>↗</span>
        </a>
      ))}
    </section>
  );
}

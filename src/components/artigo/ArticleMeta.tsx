import type { Article } from '@/lib/types';
import { formatDate, parseSectionNumber } from '@/lib/utils';

const sectionLabel = 'text-[11px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-600)' };

export function ArticleMeta({ article }: { article: Article }) {
  const sectionNumber = parseSectionNumber(article.section);
  const edition = article.edition?.replace('Edição:', '').trim();
  const orgTrail = [article.organ_level_1, article.organ_level_2, article.organ_level_3]
    .filter(Boolean)
    .join(' › ');

  const rows: [string, string][] = [
    ['Publicado em', formatDate(article.published_date)],
    ...(sectionNumber ? ([['Seção', sectionNumber]] as [string, string][]) : []),
    ...(article.page ? ([['Página', article.page]] as [string, string][]) : []),
    ...(edition ? ([['Edição', edition]] as [string, string][]) : []),
  ];

  return (
    <div>
      <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
        <div className={`${sectionLabel} mb-4`} style={sectionLabelStyle}>Detalhes da publicação</div>
        <div className="text-sm">
          {rows.map(([label, value], i) => (
            <div
              key={label}
              className="flex justify-between py-2.5"
              style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
            >
              <span style={{ color: 'var(--color-neutral-700)' }}>{label}</span>
              <span className="font-bold text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
      {orgTrail && (
        <div className="p-6">
          <div className={`${sectionLabel} mb-3`} style={sectionLabelStyle}>Órgão</div>
          <div className="text-sm leading-[1.6]">{orgTrail}</div>
        </div>
      )}
    </div>
  );
}

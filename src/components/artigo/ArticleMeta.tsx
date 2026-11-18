import Link from 'next/link';
import type { Article } from '@/lib/types';
import { parseSectionNumber } from '@/lib/utils';
import { daysUntil, docTypeLabel, formatDateLong, formatMoney, modalityLabel } from '@/lib/format';

const sectionLabel = 'text-[11px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-700)' };

export function ArticleMeta({ article }: { article: Article }) {
  const sectionNumber = parseSectionNumber(article.section);
  const edition = article.edition?.replace('Edição:', '').trim();
  const orgTrail = [article.organ_level_1, article.organ_level_2, article.organ_level_3]
    .filter(Boolean)
    .join(' › ');
  const n = article.normalized_data;

  const rows: [string, string][] = [
    ['Publicado em', formatDateLong(article.published_date)],
    ...(sectionNumber ? ([['Seção', sectionNumber]] as [string, string][]) : []),
    ...(article.page ? ([['Página', article.page]] as [string, string][]) : []),
    ...(edition ? ([['Edição', edition]] as [string, string][]) : []),
  ];

  // Normalized fields
  if (n) {
    if (n.doc_type) {
      rows.push(['Tipo', docTypeLabel(n.doc_type)]);
    }
    if (n.modality) {
      rows.push(['Modalidade', modalityLabel(n.modality)]);
    }
    if (n.process_number) {
      rows.push(['Processo', n.process_number]);
    }
    if (n.contract_number) {
      rows.push(['Contrato', n.contract_number]);
    }
    if (n.opening_date) {
      rows.push(['Abertura', formatDateLong(n.opening_date)]);
    }
  }

  return (
    <div>
      {n?.value !== undefined && (
        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={sectionLabel} style={{ ...sectionLabelStyle, marginBottom: 6 }}>Valor</div>
          <div className="text-[32px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)' }}>
            {formatMoney(n.value)}
          </div>
        </div>
      )}

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
              <span className="font-bold text-right" style={label === 'Abertura' && (daysUntil(n?.opening_date) ?? 99) >= 0 && (daysUntil(n?.opening_date) ?? 99) <= 3 ? { color: 'var(--color-accent-text)' } : undefined}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* UF badges */}
      {n?.ufs && n.ufs.length > 0 && (
        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-3`} style={sectionLabelStyle}>UF</div>
          <div className="flex flex-wrap gap-2">
            {n.ufs.map((uf) => (
              <span key={uf} className="px-2 py-0.5 text-xs font-bold"
                style={{ border: '1px solid var(--color-text)', color: 'var(--color-text)' }}>
                {uf}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CNPJs */}
      {n?.cnpjs && n.cnpjs.length > 0 && (
        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-3`} style={sectionLabelStyle}>CNPJs mencionados</div>
          <div className="text-xs space-y-1 font-mono">
            {n.cnpjs.map((cnpj) => (
              <Link key={cnpj} href={`/busca/cnpj?cnpj=${cnpj.replace(/\D/g, '')}`} className="block underline py-0.5" style={{ color: 'var(--color-text)' }} title="Ver outras publicações deste CNPJ">
                {cnpj}
              </Link>
            ))}
          </div>
        </div>
      )}

      {orgTrail && (
        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-3`} style={sectionLabelStyle}>Órgão</div>
          <div className="text-sm leading-[1.6]">{orgTrail}</div>
        </div>
      )}

      {/* DOU original link */}
      <div className="p-6">
        <div className={`${sectionLabel} mb-3`} style={sectionLabelStyle}>Fonte oficial</div>
        <a
          href={`https://www.in.gov.br/web/dou/-/${article.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold underline inline-flex items-center gap-1"
          style={{ color: 'var(--color-text)' }}
        >
          Ver no Diário Oficial ↗
        </a>
        <div className="text-xs mt-1" style={{ color: 'var(--color-neutral-700)' }}>
          DOU · publicado em {formatDateLong(article.published_date)}
        </div>
      </div>
    </div>
  );
}

import type { Article } from '@/lib/types';
import { formatDate, parseSectionNumber, formatMoney } from '@/lib/utils';

const sectionLabel = 'text-[11px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-600)' };

const TYPE_LABELS: Record<string, string> = {
  licitacao: 'Licitação',
  contrato: 'Contrato',
  aditivo: 'Aditivo',
  rescisao: 'Rescisão',
  dispensa: 'Dispensa',
  inexigibilidade: 'Inexigibilidade',
  adjudicacao: 'Adjudicação',
  homologacao: 'Homologação',
  suspensao: 'Suspensão',
  revogacao: 'Revogação',
  nomeacao: 'Nomeação',
  exoneracao: 'Exoneração',
  portaria: 'Portaria',
  acordo: 'Acordo',
  convenio: 'Convênio',
};

const MODALITY_LABELS: Record<string, string> = {
  pregao: 'Pregão',
  pregao_eletronico: 'Pregão eletrônico',
  concorrencia: 'Concorrência',
  dispensa: 'Dispensa',
  inexigibilidade: 'Inexigibilidade',
  tomada_precos: 'Tomada de preços',
  concurso: 'Concurso',
  leilao: 'Leilão',
  rdc: 'RDC',
};

export function ArticleMeta({ article }: { article: Article }) {
  const sectionNumber = parseSectionNumber(article.section);
  const edition = article.edition?.replace('Edição:', '').trim();
  const orgTrail = [article.organ_level_1, article.organ_level_2, article.organ_level_3]
    .filter(Boolean)
    .join(' › ');
  const n = article.normalized_data;

  const rows: [string, string][] = [
    ['Publicado em', formatDate(article.published_date)],
    ...(sectionNumber ? ([['Seção', sectionNumber]] as [string, string][]) : []),
    ...(article.page ? ([['Página', article.page]] as [string, string][]) : []),
    ...(edition ? ([['Edição', edition]] as [string, string][]) : []),
  ];

  // Normalized fields
  if (n) {
    if (n.doc_type && TYPE_LABELS[n.doc_type]) {
      rows.push(['Tipo', TYPE_LABELS[n.doc_type]]);
    }
    if (n.modality && MODALITY_LABELS[n.modality]) {
      rows.push(['Modalidade', MODALITY_LABELS[n.modality]]);
    }
    if (n.process_number) {
      rows.push(['Processo', n.process_number]);
    }
    if (n.contract_number) {
      rows.push(['Contrato', n.contract_number]);
    }
    if (n.opening_date) {
      rows.push(['Abertura', formatDate(n.opening_date)]);
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
              <span className="font-bold text-right" style={label === 'Abertura' ? { color: 'var(--color-accent)' } : undefined}>{value}</span>
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
                style={{ background: 'var(--color-accent)', color: '#fff' }}>
                {uf}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {n?.keywords && n.keywords.length > 0 && (
        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-3`} style={sectionLabelStyle}>Palavras-chave</div>
          <div className="flex flex-wrap gap-1.5">
            {n.keywords.map((kw) => (
              <span key={kw} className="px-2 py-0.5 text-xs"
                style={{ background: 'var(--color-neutral-200)', color: 'var(--color-neutral-700)' }}>
                {kw}
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
              <div key={cnpj} style={{ color: 'var(--color-neutral-700)' }}>{cnpj}</div>
            ))}
          </div>
        </div>
      )}

      {orgTrail && (
        <div className="p-6">
          <div className={`${sectionLabel} mb-3`} style={sectionLabelStyle}>Órgão</div>
          <div className="text-sm leading-[1.6]">{orgTrail}</div>
        </div>
      )}
    </div>
  );
}

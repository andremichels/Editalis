import Link from 'next/link';
import type { Article } from '@/lib/types';
import { parseSectionNumber } from '@/lib/utils';
import { docTypeLabel, formatDateShort } from '@/lib/format';

export const asideH2 = 'pb-3 text-[18px] font-extrabold';
export const asideH2Style = { borderBottom: '2px solid var(--color-text)' };

/** Coluna lateral do Detalhe: dados da publicação, empresas citadas e órgão. */
export function ArticleMeta({ article }: { article: Article }) {
  const sectionNumber = parseSectionNumber(article.section);
  const edition = article.edition?.replace('Edição:', '').trim();
  const n = article.normalized_data;
  const organ = article.organ_level_1 || article.organ || '';

  const rows: [string, string][] = [
    ['Publicado', formatDateShort(article.published_date)],
    ...(sectionNumber ? ([['Seção', sectionNumber]] as [string, string][]) : []),
    ...(article.page ? ([['Página', article.page]] as [string, string][]) : []),
    ...(edition ? ([['Edição', edition]] as [string, string][]) : []),
    ...(n?.doc_type ? ([['Classificação', docTypeLabel(n.doc_type)]] as [string, string][]) : []),
  ];

  const alertPrefill = new URLSearchParams({ name: organ.slice(0, 50), organs: organ }).toString();

  return (
    <>
      <section>
        <h2 className={asideH2} style={asideH2Style}>Publicação</h2>
        <dl>
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[110px_1fr] gap-3 py-3 text-[14px]" style={{ borderBottom: '1px solid var(--color-line)' }}>
              <dt style={{ color: 'var(--color-muted)' }}>{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {n?.cnpjs && n.cnpjs.length > 0 && (
        <section>
          <h2 className={asideH2} style={asideH2Style}>Empresas citadas</h2>
          {n.cnpjs.map((cnpj) => (
            <Link
              key={cnpj}
              href={`/busca/cnpj?cnpj=${cnpj.replace(/\D/g, '')}`}
              className="flex items-center justify-between gap-3 py-3 text-[14px]"
              style={{ borderBottom: '1px solid var(--color-line)' }}
            >
              <span className="font-mono font-semibold">{cnpj}</span>
              <span className="text-[13px] underline" style={{ color: 'var(--color-muted)' }}>outras publicações</span>
            </Link>
          ))}
        </section>
      )}

      {organ && (
        <section className="print:hidden">
          <h2 className={asideH2} style={asideH2Style}>Mais deste órgão</h2>
          <p className="pt-3 text-[14px] leading-[1.5]" style={{ color: 'var(--color-muted)' }}>{organ}</p>
          <div className="flex flex-col items-start gap-2 pt-2">
            <Link href={`/busca?q=${encodeURIComponent(`"${organ}"`)}`} className="text-[13px] font-bold underline">
              Ver publicações do órgão
            </Link>
            <Link href={`/alertas?prefill=${encodeURIComponent(alertPrefill)}`} className="text-[13px] font-bold underline">
              Criar alerta para este órgão
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

"use client";

import { useState } from 'react';
import type { Article } from '@/lib/types';
import { articleKind, articleTitle, keywordLabel, modalityLabel } from '@/lib/format';

function formatContent(raw: string): React.ReactNode[] {
  const paragraphs = raw.split(/\n{2,}/);
  return paragraphs.map((para, i) => {
    const lines = para.trim().split('\n');

    // Single line in all caps = header
    if (lines.length === 1 && lines[0].length < 120 && lines[0] === lines[0].toUpperCase() && lines[0].length > 5) {
      return (
        <h3 key={i} className="text-[15px] font-extrabold mt-5 first:mt-0 mb-2.5"
          style={{ color: 'var(--color-text)' }}>
          {lines[0]}
        </h3>
      );
    }

    return (
      <p key={i} className="mb-3 last:mb-0 leading-[1.75] text-[15px]"
        style={{ color: 'var(--color-text)' }}>
        {lines.map((line, j) => (
          <span key={j}>
            {line}
            {j < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

export function ArticleContent({ article }: { article: Article }) {
  const [copied, setCopied] = useState(false);
  // Só mostra o resumo quando ele acrescenta algo: o objeto já virou o título,
  // e resumos curtos/cortados repetiam o subtítulo.
  const rawSummary = article.normalized_data?.summary?.trim() || '';
  const title = articleTitle(article, 1000).toLowerCase();
  const summary =
    rawSummary.length >= 80 && !title.startsWith(rawSummary.slice(0, 40).toLowerCase()) ? rawSummary : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(article.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const n = article.normalized_data;
  const resumo: [string, React.ReactNode][] = [
    ...(summary ? [['O que é', summary] as [string, React.ReactNode]] : []),
    ...(n?.modality ? [['Modalidade', modalityLabel(n.modality)] as [string, React.ReactNode]] : []),
    ['Tipo de ato', articleKind(article)],
    ...(n?.ufs?.length ? [['UF', n.ufs.join(', ')] as [string, React.ReactNode]] : []),
    ...(n?.keywords?.length ? [['Assuntos', n.keywords.slice(0, 8).map(keywordLabel).join(' · ')] as [string, React.ReactNode]] : []),
  ];
  const h2 = 'text-[13px] font-bold uppercase';

  return (
    <div className="flex flex-col gap-9 min-w-0">
      {resumo.length > 1 && (
        <section className="flex flex-col">
          <h2 className={`${h2} mb-3`} style={{ letterSpacing: '0.14em' }}>Em resumo</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-[150px_minmax(0,1fr)]" style={{ borderTop: '1px solid var(--color-line)' }}>
            {resumo.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="pt-3.5 sm:py-3.5 text-[14px] font-bold sm:border-b" style={{ borderColor: 'var(--color-line)' }}>{label}</dt>
                <dd className="pb-3.5 sm:py-3.5 text-[15px] leading-[1.5]" style={{ borderBottom: '1px solid var(--color-line)' }}>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className={h2} style={{ letterSpacing: '0.14em' }}>Texto da publicação</h2>
          <button
            onClick={handleCopy}
            className="h-9 px-3 text-[13px] font-semibold cursor-pointer print:hidden"
            style={{ border: '1px solid var(--color-text)', background: copied ? 'var(--color-text)' : 'transparent', color: copied ? '#fff' : 'var(--color-text)' }}
          >
            {copied ? '✓ Copiado' : 'Copiar texto'}
          </button>
        </div>
        <div className="p-5 sm:p-6 max-w-[760px]" style={{ background: 'var(--color-field)', border: '1px solid var(--color-line)' }}>
          {formatContent(article.content)}
        </div>
      </section>
    </div>
  );
}

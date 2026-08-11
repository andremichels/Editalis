"use client";

import { useState } from 'react';
import type { Article } from '@/lib/types';

function formatContent(raw: string): React.ReactNode[] {
  const paragraphs = raw.split(/\n{2,}/);
  return paragraphs.map((para, i) => {
    const lines = para.trim().split('\n');

    // Single line in all caps = header
    if (lines.length === 1 && lines[0].length < 120 && lines[0] === lines[0].toUpperCase() && lines[0].length > 5) {
      return (
        <h3 key={i} className="text-sm font-extrabold mt-6 mb-2 tracking-wide"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
          {lines[0]}
        </h3>
      );
    }

    return (
      <p key={i} className="mb-3 leading-[1.7] text-[15px]"
        style={{ color: 'var(--color-neutral-800)' }}>
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
  const summary = article.normalized_data?.summary || article.normalized_data?.object_summary;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(article.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 px-10 min-w-0" style={{ borderRight: '2px solid var(--color-text)' }}>
      {summary && (
        <div className="mb-7 p-5" style={{ border: '2px solid var(--color-accent)', background: 'var(--color-accent-100)' }}>
          <div className="text-[11px] font-bold uppercase mb-2" style={{ letterSpacing: '0.14em', color: 'var(--color-accent-800)' }}>
            Resumo
          </div>
          <p className="text-[15px] leading-[1.6]" style={{ color: 'var(--color-neutral-800)' }}>
            {summary}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
          Texto da publicação
        </div>
        <button
          onClick={handleCopy}
          className="text-[11px] font-bold px-3 py-1 cursor-pointer transition-colors"
          style={{
            border: '1px solid var(--color-divider)',
            color: copied ? '#155724' : 'var(--color-neutral-500)',
            background: copied ? '#d4edda' : 'transparent',
          }}
        >
          {copied ? '✓ Copiado' : '📋 Copiar texto'}
        </button>
      </div>
      <div>
        {formatContent(article.content)}
      </div>
    </div>
  );
}

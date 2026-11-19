'use client';

import type { Article } from '@/lib/types';

/**
 * Extract items/lots from article content.
 * Looks for patterns like:
 * - ITEM 1 - description
 * - LOTE 1 - description
 * - Table-like structures with quantities and values
 */
function extractItems(content: string): { number: string; description: string; quantity?: string; value?: string }[] {
  const items: { number: string; description: string; quantity?: string; value?: string }[] = [];

  // Pattern: ITEM/LOTE followed by number, then description
  const itemRegex = /(?:ITEM|LOTE)\s+(\d+[\.\-\s]*\d*)\s*[:-]\s*(.+?)(?=\n\s*(?:ITEM|LOTE)\s+\d+|$)/gi;
  let match;
  while ((match = itemRegex.exec(content)) !== null) {
    const desc = match[2].trim().slice(0, 200);
    items.push({ number: match[1], description: desc });
  }

  // If no structured items found, try numbered list
  if (items.length === 0) {
    const numberedRegex = /(?:^|\n)\s*(\d{1,2})[\.\)]\s+(.+?)(?=\n\s*\d{1,2}[\.\)]\s+|$)/gm;
    let count = 0;
    while ((match = numberedRegex.exec(content)) !== null && count < 15) {
      count++;
      const desc = match[2].trim().slice(0, 200);
      items.push({ number: match[1], description: desc });
    }
  }

  return items.slice(0, 20);
}

// Doc types where a real "itens/lotes" breakdown can plausibly exist.
// Everything else (portaria, nomeação, pauta de julgamento, etc.) tends to
// have unrelated numbered lists (observações, processos) that the generic
// fallback in extractItems() would otherwise misidentify as items.
const ITEMIZABLE_DOC_TYPES = new Set([
  'licitacao', 'dispensa', 'inexigibilidade', 'adjudicacao', 'homologacao', 'contrato', 'aditivo',
]);

export function ArticleItems({ article }: { article: Article }) {
  const docType = article.normalized_data?.doc_type;

  if (docType && !ITEMIZABLE_DOC_TYPES.has(docType)) return null;

  const items = extractItems(article.content);

  if (items.length === 0) return null;

  // Check if it looks like a real items list (not random numbered lines)
  if (items.length < 2) return null;

  return (
    <section className="mt-9">
      <div className="mb-3">
        <h2 className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.14em' }}>
          Itens / lotes ({items.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-text)' }}>
              <th className="text-left py-2 pr-4 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-muted)' }}>#</th>
              <th className="text-left py-2 pr-4 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-muted)' }}>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--color-line)' : 'none' }}>
                <td className="py-2.5 pr-4 font-bold text-xs" style={{ color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{item.number}</td>
                <td className="py-2.5 text-[13px] leading-[1.5]" style={{ color: 'var(--color-text)' }}>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

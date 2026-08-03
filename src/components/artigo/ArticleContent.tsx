import type { Article } from '@/lib/types';

export function ArticleContent({ article }: { article: Article }) {
  return (
    <div className="py-8 px-10 min-w-0" style={{ borderRight: '2px solid var(--color-text)' }}>
      <div className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
        Texto da publicação
      </div>
      <div className="text-base leading-[1.6] whitespace-pre-wrap" style={{ color: 'var(--color-neutral-900)' }}>
        {article.content}
      </div>
    </div>
  );
}

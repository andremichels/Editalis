import Link from 'next/link';
import type { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function ArticleDetailHeader({ article }: { article: Article }) {
  const orgTrail = [article.organ_level_1, article.organ_level_2, article.organ_level_3]
    .filter(Boolean)
    .join(' › ');

  return (
    <>
      <div className="py-4 px-10" style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <Link href="/dashboard" className="text-[13px] font-semibold" style={{ color: 'var(--color-neutral-700)' }}>
          ← Voltar ao painel
        </Link>
      </div>
      <div className="py-8 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          <span
            className="text-[11px] font-bold uppercase py-1 px-2"
            style={{ letterSpacing: '0.08em', background: 'var(--color-accent)', color: '#fff' }}
          >
            {article.organ_level_1 || 'DOU'}
          </span>
          <span className="text-[13px]" style={{ color: 'var(--color-neutral-600)' }}>{formatDate(article.published_date)}</span>
        </div>
        <h1 className="text-[28px] sm:text-[36px] font-black tracking-[-0.03em] leading-[1.06] mb-3 max-w-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {article.title_marker || article.title}
        </h1>
        {(orgTrail || article.organ) && (
          <div className="text-[15px]" style={{ color: 'var(--color-neutral-700)' }}>{orgTrail || article.organ}</div>
        )}
      </div>
    </>
  );
}

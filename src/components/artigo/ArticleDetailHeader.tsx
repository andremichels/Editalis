'use client';

import Link from 'next/link';
import type { Article } from '@/lib/types';
import { useState, useSyncExternalStore } from 'react';
import { useToast } from '@/components/Toast';
import { articleKind, articleTitle, formatDateLong, modalityLabel } from '@/lib/format';
import { backHrefServer, backHrefSnapshot, backLabel, subscribeBack } from '@/lib/backLink';
import { useFavorites } from '@/lib/useFavorites';

export function ArticleDetailHeader({ article }: { article: Article }) {
  const { isFavorite, toggle, loaded } = useFavorites();
  const favorita = loaded && isFavorite(article.id);

  const orgTrail = [article.organ_level_1, article.organ_level_2, article.organ_level_3]
    .filter(Boolean)
    .join(' › ');
  const n = article.normalized_data;
  const backHref = useSyncExternalStore(subscribeBack, backHrefSnapshot, backHrefServer);
  const back = { href: backHref, label: backLabel(backHref) };
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Compartilhar: menu nativo do sistema quando existe (celular), senão copia o link.
  const share = async () => {
    const url = window.location.href;
    const title = articleTitle(article, 120);
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} — Diário Oficial da União`, url });
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast('Link copiado', 'success');
    } catch {
      toast('Não foi possível copiar o link', 'error');
    }
  };

  // "Baixar PDF": a impressão do navegador permite "Salvar como PDF"; o CSS
  // de impressão esconde menu, botões e semelhantes.
  const savePdf = () => window.print();

  const actionStyle = { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' };

  return (
    <>
      <div className="py-4 px-10 print:hidden" style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <Link href={back.href} className="text-[13px] font-semibold py-1 inline-block" style={{ color: 'var(--color-text)' }}>
          ← {back.label}
        </Link>
      </div>
      <div className="py-8 px-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start" style={{ borderBottom: '2px solid var(--color-text)' }}>
        <div>
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span
              className="text-[11px] font-bold uppercase py-1 px-2"
              style={{ letterSpacing: '0.08em', border: '1px solid var(--color-text)', color: 'var(--color-text)' }}
            >
              {articleKind(article)}
            </span>
            {n?.modality && (
              <span className="text-[13px] font-bold" style={{ color: 'var(--color-text)' }}>{modalityLabel(n.modality)}</span>
            )}
            <span className="text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>publicado em {formatDateLong(article.published_date)}</span>
          </div>
          <h1 className="text-[24px] sm:text-[30px] font-black tracking-[-0.02em] leading-[1.15] mb-3 max-w-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {articleTitle(article, 240)}
          </h1>
          {(orgTrail || article.organ) && (
            <div className="text-[15px]" style={{ color: 'var(--color-neutral-700)' }}>{orgTrail || article.organ}</div>
          )}
        </div>
        <div className="flex flex-row lg:flex-col gap-2 flex-wrap print:hidden">
          {loaded && (
            <button
              onClick={() => toggle(article.id)}
              className="text-left text-sm font-bold py-3 px-4 cursor-pointer whitespace-nowrap"
              style={favorita
                ? { border: '2px solid var(--color-text)', background: 'var(--color-text)', color: 'var(--color-bg)' }
                : actionStyle}
              aria-pressed={favorita}
            >
              {favorita ? '★ Nos favoritos' : '☆ Favoritar'}
            </button>
          )}
          <button onClick={share} className="text-left text-sm font-bold py-3 px-4 cursor-pointer whitespace-nowrap" style={actionStyle}>
            {copied ? '✓ Link copiado' : 'Compartilhar'}
          </button>
          <button onClick={savePdf} className="text-left text-sm font-bold py-3 px-4 cursor-pointer whitespace-nowrap" style={actionStyle}>
            Baixar PDF
          </button>
        </div>
      </div>
    </>
  );
}

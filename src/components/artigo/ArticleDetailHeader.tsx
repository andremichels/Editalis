'use client';

import Link from 'next/link';
import type { Article } from '@/lib/types';
import { useState, useSyncExternalStore } from 'react';
import { useToast } from '@/components/Toast';
import { articleKind, articleTitle, formatDateShort, modalityLabel } from '@/lib/format';
import { parseSectionNumber } from '@/lib/utils';
import { StarIcon } from '@/components/ui/Icons';
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

  const actionClass = 'inline-flex items-center gap-2 h-11 px-4 text-[14px] font-bold cursor-pointer whitespace-nowrap';
  const actionStyle = { border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' };
  const sectionNumber = parseSectionNumber(article.section);
  const source = [
    'Diário Oficial da União',
    sectionNumber ? `seção ${sectionNumber}` : '',
    article.page ? `p. ${article.page}` : '',
  ].filter(Boolean).join(', ');
  const [mainOrgan, ...restOrgan] = (orgTrail || article.organ || '').split(' › ');
  const ufs = (n?.ufs ?? []).filter(Boolean).join(', ');

  return (
    <>
      <nav aria-label="Voltar" className="py-3.5 px-4 sm:px-12 print:hidden" style={{ borderBottom: '1px solid var(--color-line)' }}>
        <Link href={back.href} className="inline-flex items-center gap-2 h-10 text-[14px] font-semibold">
          <span aria-hidden>←</span> {back.label}
        </Link>
      </nav>
      <header className="flex flex-col gap-3.5 pt-8 pb-7 px-4 sm:px-12">
        <p className="flex items-center gap-2.5 flex-wrap text-[13px]" style={{ color: 'var(--color-muted)' }}>
          <span className="py-[3px] px-2 text-[12px] font-bold" style={{ background: 'var(--color-text)', color: '#fff' }}>
            {n?.modality ? modalityLabel(n.modality) : articleKind(article)}
          </span>
          {n?.modality ? `${articleKind(article)} · ` : ''}{source} · {formatDateShort(article.published_date)}
        </p>
        <h1 className="text-[26px] sm:text-[32px] font-extrabold leading-[1.2] tracking-[-0.015em] max-w-[980px]" style={{ fontFamily: 'var(--font-heading)' }}>
          {articleTitle(article, 240)}
        </h1>
        {mainOrgan && (
          <p className="text-[15px]">
            <Link href={`/busca?q=${encodeURIComponent(`"${mainOrgan}"`)}`} className="font-bold underline">{mainOrgan}</Link>
            {(restOrgan.length > 0 || ufs) && (
              <span style={{ color: 'var(--color-muted)' }}>
                {restOrgan.length > 0 ? ` › ${restOrgan.join(' › ')}` : ''}{ufs ? ` · ${ufs}` : ''}
              </span>
            )}
          </p>
        )}
        <div className="flex gap-2.5 flex-wrap pt-1.5 print:hidden">
          {loaded && (
            <button
              onClick={() => toggle(article.id)}
              className={actionClass}
              style={favorita ? actionStyle : { ...actionStyle, background: 'var(--color-text)', color: '#fff' }}
              aria-pressed={favorita}
            >
              <StarIcon filled={favorita} size={18} />
              {favorita ? 'Nos favoritos' : 'Favoritar'}
            </button>
          )}
          <a href={`https://www.in.gov.br/web/dou/-/${article.slug}`} target="_blank" rel="noopener noreferrer" className={actionClass} style={actionStyle}>
            Ver no Diário Oficial <span aria-hidden>↗</span>
          </a>
          <button onClick={savePdf} className={actionClass} style={actionStyle}>
            Baixar PDF
          </button>
          <button onClick={share} className={actionClass} style={actionStyle}>
            {copied ? '✓ Link copiado' : 'Compartilhar'}
          </button>
        </div>
      </header>
    </>
  );
}

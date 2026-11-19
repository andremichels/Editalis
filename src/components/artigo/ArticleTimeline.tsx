'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { docTypeLabel, formatDateShort, parseDate } from '@/lib/format';
import type { Article, ProcessoAto } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

interface TimelineData {
  published_date?: string;
  dates: { date: string; kind: 'assinatura' | 'vigencia_inicio' | 'vigencia_fim' }[];
  processo: { id: number; numero?: string; total_artigos?: number } | null;
  atos: ProcessoAto[];
}

interface Event {
  date: string;
  label: string;
  note?: string;
  href?: string;
  current?: boolean;
}

const DATE_LABELS = {
  assinatura: 'Assinatura',
  vigencia_inicio: 'Início da vigência',
  vigencia_fim: 'Fim da vigência',
} as const;

function buildEvents(article: Article, data: TimelineData): Event[] {
  const events: Event[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const d of data.dates) {
    const future = (parseDate(d.date)?.getTime() ?? 0) > today.getTime();
    events.push({
      date: d.date,
      label: DATE_LABELS[d.kind],
      note: d.kind === 'vigencia_fim' && future ? 'nova licitação provável perto desta data' : undefined,
    });
  }
  for (const ato of data.atos) {
    if (!ato.published_date) continue;
    const current = ato.slug === article.slug;
    events.push({
      date: ato.published_date,
      label: current ? 'Esta publicação no DOU' : `${docTypeLabel(ato.doc_type) || 'Publicação'} no DOU`,
      href: current || !ato.slug ? undefined : `/artigo/${ato.slug}`,
      current,
    });
  }
  if (!data.atos.some((a) => a.slug === article.slug) && article.published_date) {
    events.push({ date: article.published_date, label: 'Esta publicação no DOU', current: true });
  }
  const opening = article.normalized_data?.opening_date;
  if (opening) events.push({ date: opening.slice(0, 10), label: 'Abertura das propostas' });

  // mesma data + mesmo rótulo (ex.: o ato atual vindo do processo) só uma vez
  const seen = new Set<string>();
  return events
    .filter((e) => {
      const k = `${e.date}|${e.label}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Linha do tempo: datas do próprio ato (assinatura, vigência), abertura e os
 * outros atos do mesmo processo. Só aparece com pelo menos dois marcos reais.
 */
export function ArticleTimeline({ article }: { article: Article }) {
  const [data, setData] = useState<TimelineData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/v1/article/${encodeURIComponent(article.slug)}/timeline`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [article.slug]);

  if (!data) return null;
  const events = buildEvents(article, data);
  if (events.length < 2) return null;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="flex flex-col mt-9">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-[13px] font-bold uppercase" style={{ letterSpacing: '0.14em' }}>Linha do tempo</h2>
        {data.processo && (
          <Link href={`/processo/${data.processo.id}`} className="text-[13px] font-semibold underline" style={{ color: 'var(--color-text)' }}>
            Ver processo{data.processo.numero ? ` ${data.processo.numero}` : ''}
          </Link>
        )}
      </div>
      <ol className="flex flex-col" style={{ borderTop: '1px solid var(--color-line)' }}>
        {events.map((e) => {
          const future = e.date > today;
          return (
            <li key={`${e.date}-${e.label}`} className="grid grid-cols-[110px_18px_minmax(0,1fr)] items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--color-line)' }}>
              <span className="text-[14px] tabular-nums" style={{ color: future ? 'var(--color-muted)' : 'var(--color-text)' }}>{formatDateShort(e.date)}</span>
              <span
                aria-hidden
                className="mt-1 w-3 h-3"
                style={
                  e.current
                    ? { background: 'var(--color-accent)' }
                    : future
                      ? { border: '2px solid var(--color-muted)' }
                      : { background: 'var(--color-text)' }
                }
              />
              <span className="flex flex-col text-[14px]">
                {e.href ? (
                  <Link href={e.href} className="font-semibold underline" style={{ color: 'var(--color-text)' }}>{e.label}</Link>
                ) : (
                  <span className={e.current ? 'font-bold' : 'font-semibold'}>{e.label}</span>
                )}
                {e.note && <span className="text-[13px]" style={{ color: 'var(--color-accent-text)' }}>{e.note}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

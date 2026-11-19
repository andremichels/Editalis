import Link from 'next/link';
import type { Article } from '@/lib/types';
import { daysUntil, deadlineText, formatDateShort, formatMoney, isUrgent, openingWhen } from '@/lib/format';

interface Fact {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  big?: boolean;
}

/** ", 9h" quando a abertura tem horário. */
function openingTime(value: string): string {
  const when = openingWhen(value);
  return when.includes(', ') ? `, ${when.split(', ')[1]}` : '';
}

/** Faixa com os dados principais (valor, abertura, empresa, processo). */
export function ArticleFacts({ article }: { article: Article }) {
  const n = article.normalized_data;
  const facts: Fact[] = [];

  if (n?.value != null && Number(n.value) > 0) {
    facts.push({ label: 'Valor', value: formatMoney(n.value), big: true });
  }
  if (n?.opening_date) {
    const days = daysUntil(n.opening_date);
    const open = days != null && days >= 0;
    facts.push({
      label: 'Abertura',
      value: `${formatDateShort(n.opening_date)}${openingTime(n.opening_date)}`,
      hint: open ? (
        <span className={isUrgent(days) ? 'font-bold' : undefined} style={{ color: isUrgent(days) ? 'var(--color-accent-text)' : undefined }}>{deadlineText(days!)}</span>
      ) : (
        'prazo encerrado'
      ),
    });
  }
  if (n?.cnpjs && n.cnpjs.length > 0) {
    const cnpj = n.cnpjs[0];
    facts.push({
      label: n.cnpjs.length > 1 ? `CNPJs (${n.cnpjs.length})` : 'CNPJ',
      value: (
        <Link href={`/busca/cnpj?cnpj=${cnpj.replace(/\D/g, '')}`} className="underline font-mono" title="Ver outras publicações deste CNPJ">
          {cnpj}
        </Link>
      ),
      hint: 'outras publicações deste CNPJ',
    });
  }
  if (n?.process_number || n?.contract_number) {
    facts.push({
      label: n?.contract_number ? 'Contrato' : 'Processo',
      value: n?.contract_number || n?.process_number,
      hint: n?.contract_number && n?.process_number ? `Processo ${n.process_number}` : undefined,
    });
  }

  if (facts.length === 0) return null;

  return (
    <section
      aria-label="Dados principais"
      className={`mx-4 sm:mx-12 grid grid-cols-1 sm:grid-cols-2 ${facts.length >= 3 ? 'xl:grid-cols-4' : ''}`}
      style={{ borderTop: '2px solid var(--color-text)', borderBottom: '2px solid var(--color-text)' }}
    >
      {facts.map((f, i) => (
        <div
          key={f.label}
          className={`py-5 ${i === 0 ? 'pr-5' : 'sm:px-5'} min-w-0`}
          style={{ borderRight: i < facts.length - 1 ? '1px solid var(--color-line)' : undefined }}
        >
          <p className="text-[12px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'var(--color-muted)' }}>{f.label}</p>
          <p className={`mt-1.5 ${f.big ? 'text-[28px] font-extrabold tracking-[-0.01em]' : 'text-[18px] font-bold'} break-words`}>{f.value}</p>
          {f.hint && <p className="mt-1 text-[13px]" style={{ color: 'var(--color-muted)' }}>{f.hint}</p>}
        </div>
      ))}
    </section>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// DOU API returns section as a combined label like "Seção: 3|Página:226" — pull just the number out.
export function parseSectionNumber(section?: string): string | undefined {
  if (!section) return undefined;
  const match = section.match(/Seção:\s*([^|]+)/);
  return match ? match[1].trim() : undefined;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

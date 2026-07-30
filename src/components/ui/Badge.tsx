interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'neutral' | 'outline';
  className?: string;
}

const variants = {
  accent: 'bg-[var(--color-accent-100)] text-[var(--color-accent-700)]',
  neutral: 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)]',
  outline:
    'border-2 border-[var(--color-divider)] bg-transparent text-[var(--color-neutral-600)]',
} as const;

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </span>
  );
}

import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

export function Card({
  className = '',
  padding = 'md',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-[var(--color-surface)] ${paddings[padding]} ${className}`}
      style={{ border: '2px solid var(--color-divider)' }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardSection({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-t-2 border-[var(--color-divider)] pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0 ${className}`}
      {...props}
    />
  );
}

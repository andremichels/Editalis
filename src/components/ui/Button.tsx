'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

const variants = {
  primary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-600)] active:bg-[var(--color-accent-700)]',
  secondary:
    'border-2 border-[var(--color-divider)] text-[var(--color-text)] hover:bg-[var(--color-neutral-200)] active:bg-[var(--color-neutral-300)]',
  ghost:
    'text-[var(--color-text)] hover:bg-[var(--color-accent-100)] active:bg-[var(--color-accent-200)]',
  outline:
    'border-2 border-[var(--color-divider)] text-[var(--color-text)] hover:bg-[var(--color-neutral-100)]',
  danger:
    'bg-[#dc3545] text-white hover:bg-[#c82333] active:bg-[#bd2130]',
} as const;

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', icon, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center gap-2 font-semibold transition-colors
        disabled:opacity-45 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
      {...props}
    >
      {icon}
      {/* Labels flush left — never centered */}
      <span className="text-left flex-1">{children}</span>
    </button>
  )
);

Button.displayName = 'Button';

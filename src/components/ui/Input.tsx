'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', icon, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={`w-full bg-white px-4 py-2.5 text-sm text-[var(--color-text)]
          placeholder:text-[var(--color-neutral-400)]
          border-2 border-[var(--color-divider)]
          focus:border-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2
          transition-colors
          ${icon ? 'pl-10' : ''} ${className}`}
        style={{ fontFamily: 'var(--font-body)' }}
        {...props}
      />
    </div>
  )
);

Input.displayName = 'Input';

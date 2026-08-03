import { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormField({ label, id, className = '', ...props }: FormFieldProps) {
  const inputId = id ?? label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-xs font-bold uppercase mb-2"
        style={{ letterSpacing: '0.1em', color: 'var(--color-text)' }}
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-3.5 text-[15px] ${className}`}
        style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)', color: 'var(--color-text)' }}
        {...props}
      />
    </div>
  );
}

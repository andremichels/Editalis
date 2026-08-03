'use client';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'px-[18px] py-2.5 text-[13px]',
  md: 'px-3 py-3 text-sm',
} as const;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  fullWidth = false,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div className={`${fullWidth ? 'flex w-full' : 'inline-flex'} ${className}`} style={{ border: '2px solid var(--color-text)' }}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`${fullWidth ? 'flex-1' : ''} font-bold cursor-pointer ${sizeClasses[size]}`}
            style={{
              background: active ? 'var(--color-text)' : 'transparent',
              color: active ? 'var(--color-bg)' : 'var(--color-text)',
              borderLeft: i > 0 ? '2px solid var(--color-text)' : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

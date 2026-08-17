'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  target: number;
  suffix?: string;
  duration?: number;
}

/**
 * Counts up from 0 to `target` once scrolled into view. Ported from the
 * design-handoff's `data-count`/`contar()` (ease-out-cubic, ~1.1s).
 */
export function CountUp({ target, suffix = '', duration = 1100 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => Math.round(target).toLocaleString('pt-BR'));
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(Math.round(target).toLocaleString('pt-BR'));
      return;
    }

    setDisplay('0');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || startedRef.current) return;
          startedRef.current = true;
          observer.unobserve(el);
          const t0 = Date.now();
          const step = () => {
            const p = Math.min(1, (Date.now() - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(target * eased).toLocaleString('pt-BR'));
            if (p < 1) requestAnimationFrame(step);
          };
          step();
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);

    const safety = setTimeout(() => {
      if (startedRef.current) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        startedRef.current = true;
        setDisplay(Math.round(target).toLocaleString('pt-BR'));
      }
    }, 1400);

    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [target, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

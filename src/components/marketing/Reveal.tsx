'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Fade + slide-up on scroll into view. Ported from the design-handoff's
 * `data-anim`/`setupAnim()` system (IntersectionObserver, 620ms cubic-bezier,
 * safety fallback for content already in view on mount).
 */
export function Reveal({ children, delay = 0, className, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(el);
          setTimeout(() => setVisible(true), delay);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);

    // Safety fallback: content already in the viewport when the observer
    // is set up sometimes doesn't fire in time (e.g. above-the-fold on load).
    const safety = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) setVisible(true);
    }, 1400);

    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(16px)',
        transition: 'opacity 620ms cubic-bezier(.2,.7,.2,1), transform 620ms cubic-bezier(.2,.7,.2,1)',
      }}
    >
      {children}
    </div>
  );
}

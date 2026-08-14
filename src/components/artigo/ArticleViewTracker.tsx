'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export function ArticleViewTracker({ slug, docType }: { slug: string; docType?: string }) {
  useEffect(() => {
    track('article_viewed', { slug, doc_type: docType });
  }, [slug, docType]);

  return null;
}

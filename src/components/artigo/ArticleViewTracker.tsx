'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { rememberLastViewed } from '@/lib/useAccount';

export function ArticleViewTracker({ slug, title, docType }: { slug: string; title: string; docType?: string }) {
  useEffect(() => {
    track('article_viewed', { slug, doc_type: docType });
    rememberLastViewed({ slug, title });
  }, [slug, title, docType]);

  return null;
}

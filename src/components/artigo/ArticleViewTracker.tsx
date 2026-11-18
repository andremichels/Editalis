'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { rememberLastViewed } from '@/lib/useAccount';
import { markRead } from '@/lib/useReads';

export function ArticleViewTracker({ id, slug, title, docType }: { id: number; slug: string; title: string; docType?: string }) {
  useEffect(() => {
    track('article_viewed', { slug, doc_type: docType });
    rememberLastViewed({ slug, title });
    markRead(id);
  }, [id, slug, title, docType]);

  return null;
}

import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArticleDetailHeader } from '@/components/artigo/ArticleDetailHeader';
import { ArticleContent } from '@/components/artigo/ArticleContent';
import { ArticleMeta } from '@/components/artigo/ArticleMeta';
import { ArticleFacts } from '@/components/artigo/ArticleFacts';
import { ArticleItems } from '@/components/artigo/ArticleItems';
import { ArticleTimeline } from '@/components/artigo/ArticleTimeline';
import { ArticleLinks } from '@/components/artigo/ArticleLinks';
import { SimilarArticles } from '@/components/artigo/SimilarArticles';
import { ArticleViewTracker } from '@/components/artigo/ArticleViewTracker';
import { getArticle } from '@/lib/api';
import { articleTitle } from '@/lib/format';
import { notFound } from 'next/navigation';

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let article;

  try {
    article = await getArticle(slug);
  } catch {
    notFound();
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <ArticleViewTracker id={article.id} slug={slug} title={articleTitle(article, 90)} docType={article.normalized_data?.doc_type} />
        <ArticleDetailHeader article={article} />
        <ArticleFacts article={article} />
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-12 mt-10 mb-16 mx-4 sm:mx-12">
          <div className="min-w-0">
            <ArticleContent article={article} />
            <ArticleItems article={article} />
            <ArticleTimeline article={article} />
          </div>
          <aside className="flex flex-col gap-8">
            <ArticleMeta article={article} />
            <ArticleLinks article={article} />
            <SimilarArticles slug={slug} />
          </aside>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

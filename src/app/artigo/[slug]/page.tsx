import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArticleDetailHeader } from '@/components/artigo/ArticleDetailHeader';
import { ArticleContent } from '@/components/artigo/ArticleContent';
import { ArticleMeta } from '@/components/artigo/ArticleMeta';
import { getArticle } from '@/lib/api';
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
        <ArticleDetailHeader article={article} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
          <ArticleContent article={article} />
          <ArticleMeta article={article} />
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

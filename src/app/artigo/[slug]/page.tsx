import { PageLayout } from '@/components/layout/PageLayout';
import { Badge } from '@/components/ui/Badge';
import { getArticle } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
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
    <PageLayout>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Voltar para busca
        </Link>

        <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
          {article.title}
        </h1>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="blue">{formatDate(article.published_date)}</Badge>
          {article.section && <Badge>{article.section}</Badge>}
          {article.edition && <Badge variant="green">{article.edition}</Badge>}
          {article.page && <Badge variant="amber">Pág. {article.page}</Badge>}
        </div>

        {article.organ && (
          <p className="text-sm text-gray-500 mb-6">
            {article.organ}
          </p>
        )}

        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
          {article.content}
        </div>
      </article>
    </PageLayout>
  );
}

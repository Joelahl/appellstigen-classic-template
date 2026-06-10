import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/payload'
import RenderBlocks from '@/components/RenderBlocks'
import CreditCardCard from '@/components/CreditCardCard'
import { AuthorByline, AuthorBio } from '@/components/Author'
import { BestCardBox, ComparisonTable } from '@/components/CategoryParts'
import siteConfig from '@/siteConfig'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = true
export const revalidate = 300
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  const title = page.seo.metaTitle || page.title
  const description = page.seo.metaDescription || page.excerpt
  const canonical = `https://${siteConfig.domain}/${slug}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      ...(page.seo.ogImageUrl && { images: [{ url: page.seo.ogImageUrl }] }),
    },
    alternates: { canonical },
  }
}

export default async function GenericPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  const isCategory = page.pageType === 'category'
  const toplist = page.toplistCards || []

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header section with byline + last updated */}
      <header className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
        {page.excerpt && <p className="mt-2 max-w-3xl text-gray-600">{page.excerpt}</p>}
        <div className="mt-4">
          <AuthorByline author={page.author} updatedAt={page.updatedAt} />
        </div>
      </header>

      {/* Category extras: best-card box, toplist, comparison table */}
      {isCategory && (
        <div className="mt-8 space-y-10">
          {page.bestCard && (
            <BestCardBox card={page.bestCard} summary={page.bestCardSummary} categoryTitle={page.title} />
          )}

          {toplist.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Topplista — {page.title}</h2>
              <div className="space-y-4">
                {toplist.map((card, i) => (
                  <CreditCardCard key={card.id} card={card} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          {toplist.length > 0 && <ComparisonTable cards={toplist} />}
        </div>
      )}

      {/* Main content: blocks or migrated HTML */}
      <div className="mt-10">
        {page.layout && page.layout.length > 0 ? (
          <RenderBlocks blocks={page.layout} />
        ) : page.content ? (
          <article
            className="prose prose-sm sm:prose max-w-none prose-headings:font-semibold prose-a:text-blue-700"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : null}
      </div>

      {/* Author bio footer */}
      <AuthorBio author={page.author} />
    </div>
  )
}

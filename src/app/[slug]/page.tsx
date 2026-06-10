import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage, getSite } from '@/lib/payload'
import RenderBlocks from '@/components/RenderBlocks'
import Breadcrumbs from '@/components/Breadcrumbs'
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
  const [page, site] = await Promise.all([getPage(slug), getSite()])
  if (!page) notFound()

  const isCategory = page.pageType === 'category'
  const toplist = page.toplistCards || []
  const heroImg = site?.branding?.heroImageUrl

  return (
    <>
      {/* Breadcrumb bar — just below the navigation */}
      <div className="bg-white">
        <div className="mx-auto max-w-5xl px-4 pt-3">
          <Breadcrumbs items={[{ label: page.title }]} />
        </div>
      </div>

      {/* Hero banner — toplist width, single faded color, responsive h1 */}
      {isCategory ? (
        <section
          className="relative overflow-hidden text-gray-900"
          style={{
            background: heroImg ? undefined : 'color-mix(in srgb, var(--brand,#1d4ed8) 12%, white)',
            ...(heroImg ? { backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
          }}
        >
          {heroImg && <div className="absolute inset-0 bg-white/70" />}
          <div className="relative mx-auto max-w-5xl px-4 py-10">
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--brand-accent,#f59e0b)' }}>
              Jämförelse
            </p>
            <h1 className="mt-1 font-bold leading-[1.05] text-[2.5rem] lg:text-[4.5rem]">{page.title}</h1>
            {page.excerpt && <p className="mt-3 max-w-2xl text-gray-700">{page.excerpt}</p>}
            <div className="mt-5">
              <AuthorByline author={page.author} updatedAt={page.updatedAt} />
            </div>
          </div>
        </section>
      ) : (
        <header className="mx-auto max-w-5xl px-4 pb-6 pt-8">
          <h1 className="font-bold leading-[1.1] text-[2.5rem] lg:text-[4.5rem] text-gray-900">{page.title}</h1>
          {page.excerpt && <p className="mt-2 max-w-3xl text-gray-600">{page.excerpt}</p>}
          <div className="mt-4">
            <AuthorByline author={page.author} updatedAt={page.updatedAt} />
          </div>
        </header>
      )}

      <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Category extras: best-card box, toplist, comparison table */}
      {isCategory && (
        <div className="space-y-10">
          {page.bestCardSummary && (
            <BestCardBox summary={page.bestCardSummary} categoryTitle={page.title} />
          )}

          {toplist.length > 0 && (
            <section>
              <h2 className="mb-6 flex flex-wrap items-center gap-3 text-2xl font-bold text-gray-900">
                Topplista — {page.title}
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-500">
                  {toplist.length} kort
                </span>
              </h2>
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
    </>
  )
}

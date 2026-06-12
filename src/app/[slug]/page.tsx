import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPage, getSite } from '@/lib/payload'
import RenderBlocks from '@/components/RenderBlocks'
import Breadcrumbs from '@/components/Breadcrumbs'
import CreditCardCard from '@/components/CreditCardCard'
import { AuthorByline, AuthorBio } from '@/components/Author'
import { BestCardBox, ComparisonTable } from '@/components/CategoryParts'
import { extractToc } from '@/lib/toc'
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
  const metaTitle = page.seo.metaTitle
  const title = metaTitle || page.title
  const description = page.seo.metaDescription || page.excerpt
  const canonical = `https://${siteConfig.domain}/${slug}`
  return {
    // Use the CMS metaTitle verbatim (no "| brand" suffix) when present.
    title: metaTitle ? { absolute: metaTitle } : title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      ...((page.seo.ogImageUrl || siteConfig.defaultOgImageUrl) && {
        images: [{ url: (page.seo.ogImageUrl || siteConfig.defaultOgImageUrl) as string }],
      }),
    },
    twitter: { card: 'summary_large_image', title: title as string, description },
    alternates: { canonical },
  }
}

export default async function GenericPage({ params }: Props) {
  const { slug } = await params
  const [page, site] = await Promise.all([getPage(slug), getSite()])
  if (!page) notFound()
  // The homepage lives only at `/`. If its slug is requested, redirect there
  // so there's a single canonical home URL (avoids duplicate content).
  if (page.pageType === 'homepage') permanentRedirect('/')

  const isCategory = page.pageType === 'category'
  const toplist = page.toplistCards || []
  const heroImg = site?.branding?.heroImageUrl
  const tw = page.title.trim().split(/\s+/)
  const titleLead = tw.slice(0, -1).join(' ')
  const titleAccent = tw[tw.length - 1]

  // Quick-nav: pull H2s from migrated HTML content and anchor-link to them.
  const usesHtml = !(page.layout && page.layout.length > 0) && !!page.content
  const { html: contentHtml, items: toc } = usesHtml
    ? extractToc(page.content as string)
    : { html: page.content || '', items: [] }

  return (
    <>
      {/* Breadcrumb bar — same background as hero, thin lines above and below */}
      <div className="border-y border-[#e5e7eb]" style={{ background: 'var(--hero-bg)' }}>
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <Breadcrumbs items={[{ label: page.title }]} />
        </div>
      </div>

      {/* Hero banner — nav width, single faded color, responsive accented h1 */}
      <section
        className="relative overflow-hidden text-gray-900"
        style={{
          background: heroImg ? undefined : 'var(--hero-bg)',
          ...(heroImg ? { backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
        }}
      >
        {heroImg && <div className="absolute inset-0 bg-white/70" />}
        <div className="relative mx-auto max-w-6xl px-4 py-10">
          {isCategory && (
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--brand-accent,#f59e0b)' }}>
              Jämförelse
            </p>
          )}
          <h1 className="mt-1 font-bold leading-[1.05] text-[2.5rem] lg:text-[4.5rem]">
            {titleLead && <span>{titleLead} </span>}
            <span style={{ color: 'var(--brand-accent, #f59e0b)' }}>{titleAccent}</span>
          </h1>
          {page.excerpt && <p className="mt-3 max-w-2xl text-lg text-gray-700">{page.excerpt}</p>}
          <div className="mt-5">
            <AuthorByline author={page.author} updatedAt={page.updatedAt} createdAt={page.createdAt} />
          </div>

          {/* Quick-nav — tight pills that jump to the H2 sections below */}
          {toc.length > 1 && (
            <nav className="mt-5 flex flex-wrap gap-2" aria-label="Snabbnavigering">
              {toc.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:text-blue-700 hover:shadow"
                >
                  {t.text}
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Category extras: best-card box, toplist, comparison table */}
      {isCategory && (
        <div className="space-y-10">
          {page.bestCardSummary && (
            <BestCardBox
              summary={page.bestCardSummary}
              categoryTitle={page.title}
              title={page.bestCardTitle}
            />
          )}

          {toplist.length > 0 && (
            <section>
              <h2 className="mb-6 flex flex-wrap items-center gap-3 text-2xl font-bold text-gray-900">
                Topplista — {page.title}
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-500">
                  {toplist.length} kort
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {toplist.map((card, i) => (
                  <CreditCardCard key={card.id} card={card} rank={i + 1} reviewPath={site?.reviewSlug} />
                ))}
              </div>
            </section>
          )}

          {toplist.length > 0 && <ComparisonTable cards={toplist} reviewPath={site?.reviewSlug} />}
        </div>
      )}

      {/* Main content: blocks or migrated HTML */}
      <div className="mt-10">
        {page.layout && page.layout.length > 0 ? (
          <RenderBlocks blocks={page.layout} />
        ) : contentHtml ? (
          <article
            className="prose prose-sm sm:prose max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-blue-700"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : null}
      </div>

      {/* Author bio footer */}
      <AuthorBio author={page.author} />
      </div>
    </>
  )
}

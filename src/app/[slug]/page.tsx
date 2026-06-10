import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/payload'
import RenderBlocks from '@/components/RenderBlocks'
import siteConfig from '@/siteConfig'

interface Props {
  params: Promise<{ slug: string }>
}

// ISR + on-demand: render pages on first request, no build-time CMS dependency.
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">{page.title}</h1>
      {page.layout && page.layout.length > 0 ? (
        <RenderBlocks blocks={page.layout} />
      ) : page.content ? (
        <article
          className="prose prose-sm sm:prose max-w-none prose-headings:font-semibold prose-a:text-blue-700"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <p className="text-gray-500">Inget innehåll ännu.</p>
      )}
    </div>
  )
}

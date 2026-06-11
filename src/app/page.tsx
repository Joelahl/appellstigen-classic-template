import type { Metadata } from 'next'
import Link from 'next/link'
import { getCreditCards, getSite, getAuthors, getPages } from '@/lib/payload'
import CreditCardCard from '@/components/CreditCardCard'
import { AuthorsSection } from '@/components/Author'
import Breadcrumbs from '@/components/Breadcrumbs'
import siteConfig from '@/siteConfig'

export const revalidate = 300

// Homepage SEO comes from the CMS homepage page (seo.metaTitle/metaDescription),
// falling back to siteConfig. `title.absolute` bypasses the layout titleTemplate
// so the CMS title is used verbatim.
export async function generateMetadata(): Promise<Metadata> {
  const pages = await getPages()
  const home = pages.find((p) => p.pageType === 'homepage')
  const title = home?.seo.metaTitle || home?.title || siteConfig.defaultTitle
  const description = home?.seo.metaDescription || home?.excerpt || siteConfig.defaultDescription
  const url = `https://${siteConfig.domain}`
  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url,
      ...(home?.seo.ogImageUrl && { images: [{ url: home.seo.ogImageUrl }] }),
    },
    alternates: { canonical: url },
  }
}

const FEATURES = [
  { icon: '💳', title: 'Bonuskort', desc: 'Tjäna pengar på dina köp', href: '/kreditkort-med-bonus' },
  { icon: '💰', title: 'Cashback', desc: 'Få tillbaka på allt du handlar', href: '/cashback' },
  { icon: '📉', title: 'Låg ränta', desc: 'Kort med fördelaktiga villkor', href: '/kreditkort-med-lag-ranta' },
  { icon: '🎁', title: 'Billiga kort', desc: 'Kort utan eller med låg avgift', href: '/billiga-kreditkort' },
]

export default async function HomePage() {
  const [cards, site, authors, pages] = await Promise.all([
    getCreditCards(),
    getSite(),
    getAuthors(),
    getPages(),
  ])

  const featured = cards.filter((c) => c.featured)
  const sorted = [...featured, ...cards.filter((c) => !c.featured)]
  const home = pages.find((p) => p.pageType === 'homepage')
  const hero = site?.branding?.heroImageUrl
  const tagline = site?.branding?.tagline || 'Hitta det bästa kreditkortet för dig'
  const [taglineFirst, ...taglineRest] = tagline.split(' ')

  return (
    <>
      {/* Breadcrumb bar — same background as hero, thin lines above and below */}
      <div className="border-y border-[#e5e7eb]" style={{ background: 'var(--hero-bg)' }}>
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <Breadcrumbs items={[]} />
        </div>
      </div>

      {/* Hero band — single faded color; contains h1, intro and the category grid */}
      <section
        className="relative overflow-hidden py-10 text-gray-900 sm:py-12"
        style={{
          background: hero ? undefined : 'var(--hero-bg)',
          ...(hero ? { backgroundImage: `url(${hero})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
        }}
      >
        {hero && <div className="absolute inset-0 bg-white/65" />}
        <div className="relative mx-auto max-w-6xl px-4 text-left">
          <h1 className="font-bold leading-[1.05] text-[2.5rem] lg:text-[4.5rem]">
            <span style={{ color: 'var(--brand-accent, #f59e0b)' }}>{taglineFirst}</span>{' '}
            {taglineRest.join(' ')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-700">
            {home?.excerpt ||
              `Vi jämför ${cards.length} kreditkort efter avgift, ränta, bonus och försäkringar.`}
          </p>

          {/* Primary CTA — jump to the toplist on the same page */}
          <a href="#toplist" className="btn-primary mt-6">
            Jämför kreditkort
          </a>

          {/* Quick category navigation — small horizontal buttons */}
          <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Kategorier
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:text-blue-700 hover:shadow"
              >
                <span aria-hidden>{f.icon}</span>
                {f.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Toplist */}
      <section id="toplist" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
        <h2 className="mb-6 flex flex-wrap items-center gap-3 text-2xl font-bold text-gray-900">
          Bästa kreditkorten {new Date().getFullYear()}
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-500">
            {sorted.length} kort
          </span>
        </h2>
        {sorted.length === 0 ? (
          <p className="text-gray-500">Inga kreditkort hittades.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sorted.map((card, i) => (
              <CreditCardCard key={card.id} card={card} rank={i + 1} reviewPath={site?.reviewSlug} />
            ))}
          </div>
        )}
        <p className="mt-8 text-xs leading-relaxed text-gray-400">{siteConfig.disclaimer}</p>
      </section>

      {/* Homepage editorial content from the CMS page */}
      {home?.content && (
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <article
            className="prose prose-sm sm:prose max-w-none prose-headings:font-semibold prose-a:text-blue-700"
            dangerouslySetInnerHTML={{ __html: home.content }}
          />
        </section>
      )}

      {/* What we do */}
      {site?.about?.text && (
        <section className="bg-gray-50 py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900">{site.about.heading || 'Vad vi gör'}</h2>
            <div
              className="prose prose-sm mx-auto mt-3 max-w-none text-gray-600 prose-a:text-blue-700"
              dangerouslySetInnerHTML={{ __html: site.about.text }}
            />
          </div>
        </section>
      )}

      {/* Editorial team */}
      <AuthorsSection authors={authors} />
    </>
  )
}

import type { Metadata } from 'next'
import { getCreditCards, getSite, getAuthors, getPages } from '@/lib/payload'
import CreditCardCard from '@/components/CreditCardCard'
import { AuthorsSection } from '@/components/Author'
import siteConfig from '@/siteConfig'

export const revalidate = 300

export const metadata: Metadata = {
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    url: `https://${siteConfig.domain}`,
  },
  alternates: { canonical: `https://${siteConfig.domain}` },
}

const FEATURES = [
  { icon: '💳', title: 'Bonuskort', desc: 'Tjäna pengar på dina köp' },
  { icon: '💰', title: 'Cashback', desc: 'Få tillbaka på allt du handlar' },
  { icon: '📉', title: 'Låg ränta', desc: 'Kort med fördelaktiga villkor' },
  { icon: '🎁', title: 'Utan avgift', desc: 'Gratis kort utan årsavgift' },
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

  return (
    <>
      {/* Hero — site-themed */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 py-16 text-white"
        style={hero ? { backgroundImage: `url(${hero})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {hero && <div className="absolute inset-0 bg-blue-900/70" />}
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            {site?.branding?.tagline || 'Hitta det bästa kreditkortet för dig'}
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Vi jämför {cards.length} kreditkort efter avgift, ränta, bonus och försäkringar.
          </p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto -mt-8 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <div className="text-3xl">{f.icon}</div>
              <p className="mt-2 font-semibold text-gray-900">{f.title}</p>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Toplist */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Bästa kreditkorten {new Date().getFullYear()}
        </h2>
        {sorted.length === 0 ? (
          <p className="text-gray-500">Inga kreditkort hittades.</p>
        ) : (
          <div className="space-y-4">
            {sorted.map((card, i) => (
              <CreditCardCard key={card.id} card={card} rank={i + 1} />
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
            <p className="mt-3 whitespace-pre-line text-gray-600">{site.about.text}</p>
          </div>
        </section>
      )}

      {/* Editorial team */}
      <AuthorsSection authors={authors} />
    </>
  )
}

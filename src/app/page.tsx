import type { Metadata } from 'next'
import Link from 'next/link'
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
      {/* Hero — site-themed, bright faded background with dark text */}
      <section
        className="relative overflow-hidden py-16 text-gray-900"
        style={{
          background: hero
            ? undefined
            : 'linear-gradient(135deg, color-mix(in srgb, var(--brand,#1d4ed8) 16%, white), color-mix(in srgb, var(--brand-accent,#f59e0b) 14%, white))',
          ...(hero ? { backgroundImage: `url(${hero})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
        }}
      >
        {hero && <div className="absolute inset-0 bg-white/65" />}
        <div className="relative mx-auto max-w-4xl px-4 text-left">
          <h1 className="text-4xl font-bold sm:text-5xl">
            <span style={{ color: 'var(--brand-accent, #f59e0b)' }}>{taglineFirst}</span>{' '}
            {taglineRest.join(' ')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-700">
            Vi jämför {cards.length} kreditkort efter avgift, ränta, bonus och försäkringar.
          </p>
        </div>
      </section>

      {/* Feature cards — clickable category groups */}
      <section className="mx-auto -mt-8 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="text-3xl">{f.icon}</div>
              <p className="mt-2 font-semibold text-gray-900 group-hover:text-blue-700">{f.title}</p>
              <p className="text-sm text-gray-500">{f.desc}</p>
              <span
                className="mt-3 inline-block text-sm font-medium"
                style={{ color: 'var(--brand, #1d4ed8)' }}
              >
                Se korten →
              </span>
            </Link>
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

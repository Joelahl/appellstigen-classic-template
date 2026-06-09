import type { Metadata } from 'next'
import { getCreditCards } from '@/lib/payload'
import CreditCardCard from '@/components/CreditCardCard'
import siteConfig from '@/siteConfig'

export const metadata: Metadata = {
  title: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    url: `https://${siteConfig.domain}`,
  },
  alternates: {
    canonical: `https://${siteConfig.domain}`,
  },
}

// Homepage JSON-LD: ItemList of credit cards
function HomePageSchema({ cardCount }: { cardCount: number }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    url: `https://${siteConfig.domain}`,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Bästa kreditkorten',
      numberOfItems: cardCount,
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function HomePage() {
  const cards = await getCreditCards()
  const featured = cards.filter((c) => c.featured)
  const rest = cards.filter((c) => !c.featured)
  const sorted = [...featured, ...rest]

  return (
    <>
      <HomePageSchema cardCount={cards.length} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Hitta det bästa kreditkortet för dig
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            Vi jämför {cards.length} kreditkort och rankar dem efter årsavgift, ränta, bonus och
            försäkringar — så att du snabbt hittar rätt.
          </p>
          <p className="mt-2 text-sm text-blue-300">
            Uppdaterat {new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </section>

      {/* Filter bar — placeholder for future interactive filtering */}
      <div className="sticky top-[57px] z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-4 py-3 text-sm">
          <span className="font-semibold text-gray-600">Filtrera:</span>
          <FilterChip label="Utan årsavgift" />
          <FilterChip label="Bäst cashback" />
          <FilterChip label="Reseförsäkring" />
          <FilterChip label="Bra bonus" />
        </div>
      </div>

      {/* Card list */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Bästa kreditkorten {new Date().getFullYear()}
        </h2>

        {sorted.length === 0 ? (
          <p className="text-gray-500">Inga kreditkort hittades. Kontrollera att CMS är konfigurerat.</p>
        ) : (
          <div className="space-y-4">
            {sorted.map((card, i) => (
              <CreditCardCard key={card.id} card={card} rank={i + 1} />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-gray-400 leading-relaxed">{siteConfig.disclaimer}</p>
      </section>
    </>
  )
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="shrink-0 rounded-full border border-gray-200 px-4 py-1.5 text-gray-600 hover:border-blue-600 hover:text-blue-700 transition">
      {label}
    </button>
  )
}

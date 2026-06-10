import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCreditCard } from '@/lib/payload'
import StarRating from '@/components/StarRating'
import CreditCardSchema from '@/components/CreditCardSchema'
import Breadcrumbs from '@/components/Breadcrumbs'
import siteConfig from '@/siteConfig'

interface Props {
  params: Promise<{ slug: string }>
}

// ISR + on-demand: build without a live CMS, render on first request.
export const dynamicParams = true
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const card = await getCreditCard(slug)
  if (!card) return {}

  const title = card.seo.metaTitle || `${card.cardName} — Recension & Omdöme`
  const description =
    card.seo.metaDescription || card.verdict || `Läs vår recension av ${card.cardName}.`
  const canonical = `https://${siteConfig.domain}/kreditkort/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      ...(card.seo.ogImageUrl && { images: [{ url: card.seo.ogImageUrl }] }),
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical },
  }
}

export default async function CardDetailPage({ params }: Props) {
  const { slug } = await params
  const card = await getCreditCard(slug)
  if (!card) notFound()

  const allFacts: Array<[string, string | undefined]> = [
    ['Årskostnad', card.fees.annualCost],
    ['Maxkredit', card.fees.maxCredit],
    ['Kreditränta', card.fees.interestRate],
    ['Räntefri period', card.fees.interestFreePeriod],
    ['Valutaavgift', card.fees.currencyFee],
    ['Uttagsavgift', card.fees.withdrawalFee],
    ['Aviavgift', card.fees.invoiceFee],
    ['Påminnelseavgift', card.fees.reminderFee],
    ['Övertrasseringsavgift', card.fees.overdraftFee],
    ['Bonus', card.bonus],
    ['Concierge', card.concierge],
    ['Flyglounger', card.airportLounge],
    ['Ålderskrav', card.eligibility.minAge],
    ['Inkomstkrav', card.eligibility.minIncome],
    ['Betalningsanmärkningar', card.eligibility.paymentRemarks],
  ]
  const facts = allFacts.filter(([, v]) => v)

  return (
    <>
      <CreditCardSchema card={card} />

      <div className="mx-auto max-w-4xl px-4 pb-10 pt-6">
        <Breadcrumbs items={[{ label: 'Kreditkort', href: '/' }, { label: card.cardName }]} className="mb-6" />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <header className="card p-6">
              <div className="flex items-start gap-5">
                {card.cardImageUrl && (
                  <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-2">
                    <Image
                      src={card.cardImageUrl}
                      alt={`${card.cardName} kort`}
                      width={120}
                      height={76}
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  {card.cardType && (
                    <p className="text-sm font-medium text-gray-500">{card.cardType}</p>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">{card.cardName}</h1>
                  {typeof card.editorRating === 'number' && card.editorRating > 0 && (
                    <div className="mt-1">
                      <StarRating rating={card.editorRating} size="md" showLabel />
                    </div>
                  )}
                  {card.bestFor && (
                    <p className="mt-1 text-sm text-gray-500">Passar bra som: {card.bestFor}</p>
                  )}
                </div>
              </div>

              {card.verdict && (
                <blockquote className="mt-4 border-l-4 border-blue-500 pl-4 italic text-gray-600">
                  {card.verdict}
                </blockquote>
              )}
            </header>

            {/* Key facts */}
            {facts.length > 0 && (
              <section className="mt-6 card p-6">
                <h2 className="mb-4 text-lg font-semibold">Kortfakta</h2>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {facts.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-gray-500">{label}</dt>
                      <dd className="font-semibold text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Features */}
            {(card.applePay || card.googlePay || card.contactless) && (
              <section className="mt-6 card p-6">
                <h2 className="mb-4 text-lg font-semibold">Funktioner</h2>
                <div className="flex flex-wrap gap-2">
                  {card.applePay && <FeatureBadge label="Apple Pay" />}
                  {card.googlePay && <FeatureBadge label="Google Pay" />}
                  {card.contactless && <FeatureBadge label="Contactless" />}
                </div>
              </section>
            )}

            {/* Pros & cons */}
            {(card.pros.length > 0 || card.cons.length > 0) && (
              <section className="mt-6 grid gap-4 sm:grid-cols-2">
                {card.pros.length > 0 && (
                  <div className="card p-5 border-t-4 border-green-500">
                    <h2 className="mb-3 font-semibold text-green-700">Fördelar</h2>
                    <ul className="space-y-2">
                      {card.pros.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-green-500 shrink-0">✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {card.cons.length > 0 && (
                  <div className="card p-5 border-t-4 border-red-400">
                    <h2 className="mb-3 font-semibold text-red-600">Nackdelar</h2>
                    <ul className="space-y-2">
                      {card.cons.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-red-400 shrink-0">✗</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Full review (migrated HTML) */}
            {card.reviewContent && (
              <section className="mt-6 card p-6">
                <article
                  className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-blue-700"
                  dangerouslySetInnerHTML={{ __html: card.reviewContent }}
                />
              </section>
            )}
          </div>

          {/* Sidebar — sticky CTA */}
          <aside className="space-y-4">
            <div className="card sticky top-20 p-6 text-center">
              {typeof card.editorRating === 'number' && card.editorRating > 0 && (
                <>
                  <StarRating rating={card.editorRating} size="lg" showLabel />
                  <p className="mt-2 text-sm text-gray-500">Redaktörens betyg</p>
                  <div className="my-4 border-t border-gray-100" />
                </>
              )}

              {card.fees.annualCost && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Årskostnad</p>
                  <p className="text-2xl font-bold text-gray-900">{card.fees.annualCost}</p>
                </div>
              )}

              {card.affiliateLink && (
                <a
                  href={card.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="btn-primary w-full text-center block"
                >
                  {card.ctaText}
                </a>
              )}

              <p className="mt-3 text-xs text-gray-400">
                Du lämnar vår sajt. Vi kan få ersättning om du ansöker.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-green-200">
      ✓ {label}
    </span>
  )
}

function BreadcrumbSchema({ cardName, slug }: { cardName: string; slug: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: `https://${siteConfig.domain}` },
      { '@type': 'ListItem', position: 2, name: 'Kreditkort', item: `https://${siteConfig.domain}` },
      {
        '@type': 'ListItem',
        position: 3,
        name: cardName,
        item: `https://${siteConfig.domain}/kreditkort/${slug}`,
      },
    ],
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  )
}

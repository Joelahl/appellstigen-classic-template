import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCreditCard, getCreditCards } from '@/lib/payload'
import StarRating from '@/components/StarRating'
import CreditCardSchema from '@/components/CreditCardSchema'
import siteConfig from '@/siteConfig'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const cards = await getCreditCards()
  return cards.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const card = await getCreditCard(slug)
  if (!card) return {}

  const title = card.seo.metaTitle || `${card.cardName} — Recension & Omdöme`
  const description =
    card.seo.metaDescription ||
    `Läs vår recension av ${card.cardName}. Årsavgift: ${card.fees.annualFee !== undefined ? (card.fees.annualFee === 0 ? 'Gratis' : formatCurrency(card.fees.annualFee)) : '—'}. Betyg: ${card.editorRating}/5.`
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

  return (
    <>
      <CreditCardSchema card={card} />

      {/* Breadcrumb */}
      <BreadcrumbSchema cardName={card.cardName} slug={slug} />

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Breadcrumb nav */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-700">Hem</Link>
          <span>/</span>
          <Link href="/" className="hover:text-blue-700">Kreditkort</Link>
          <span>/</span>
          <span className="text-gray-900">{card.cardName}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Header */}
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
                  <p className="text-sm font-medium text-gray-500">{card.issuer}</p>
                  <h1 className="text-2xl font-bold text-gray-900">{card.cardName}</h1>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={card.editorRating} size="md" showLabel />
                    {card.lastVerified && (
                      <span className="text-xs text-gray-400">
                        Verifierad {new Date(card.lastVerified).toLocaleDateString('sv-SE')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {card.verdict && (
                <blockquote className="mt-4 border-l-4 border-blue-500 pl-4 italic text-gray-600">
                  {card.verdict}
                </blockquote>
              )}
            </header>

            {/* Key stats */}
            <section className="mt-6 card p-6">
              <h2 className="mb-4 text-lg font-semibold">Kortfakta</h2>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <FactItem
                  label="Årsavgift"
                  value={
                    card.fees.annualFee !== undefined
                      ? card.fees.annualFee === 0
                        ? 'Gratis'
                        : formatCurrency(card.fees.annualFee)
                      : '—'
                  }
                  note={card.fees.annualFeeNote}
                />
                <FactItem
                  label="Kreditränta"
                  value={card.fees.interestRate !== undefined ? formatPercent(card.fees.interestRate) : '—'}
                />
                <FactItem
                  label="Räntefria dagar"
                  value={card.fees.interestFreeDays ? `${card.fees.interestFreeDays} dagar` : '—'}
                />
                <FactItem
                  label="Cashback"
                  value={card.rewards.cashbackPercent !== undefined ? formatPercent(card.rewards.cashbackPercent) : '—'}
                  note={card.rewards.cashbackNote}
                />
                <FactItem
                  label="Välkomstbonus"
                  value={card.rewards.welcomeBonus || '—'}
                />
                <FactItem
                  label="Utlandsavgift"
                  value={card.fees.foreignTransactionFee || '—'}
                />
                {card.creditLimit?.max && (
                  <FactItem
                    label="Kreditgräns"
                    value={`upp till ${formatCurrency(card.creditLimit.max)}`}
                  />
                )}
                <FactItem
                  label="Lägsta ålder"
                  value={`${card.eligibility.minAge} år`}
                />
                {card.eligibility.minIncome && (
                  <FactItem
                    label="Lägsta inkomst"
                    value={formatCurrency(card.eligibility.minIncome) + '/år'}
                  />
                )}
              </dl>
            </section>

            {/* Insurance */}
            <section className="mt-6 card p-6">
              <h2 className="mb-4 text-lg font-semibold">Försäkringar</h2>
              <ul className="space-y-2">
                <InsuranceRow
                  label="Reseförsäkring"
                  active={card.insurance.travelInsurance}
                  note={card.insurance.travelInsuranceNote}
                />
                <InsuranceRow label="Köpskydd" active={card.insurance.purchaseProtection} />
                <InsuranceRow label="Avbeställningsskydd" active={card.insurance.cancellationProtection} />
                <InsuranceRow label="Prisskydd" active={card.insurance.priceProtection} />
              </ul>
            </section>

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

            {/* Benefits */}
            {card.benefits.length > 0 && (
              <section className="mt-6 card p-6">
                <h2 className="mb-4 text-lg font-semibold">Förmåner</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {card.benefits.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 shrink-0">→</span> {b}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar — sticky CTA */}
          <aside className="space-y-4">
            <div className="card sticky top-20 p-6 text-center">
              <StarRating rating={card.editorRating} size="lg" showLabel />
              <p className="mt-2 text-sm text-gray-500">Redaktörens betyg</p>

              <div className="my-4 border-t border-gray-100" />

              {card.fees.annualFee !== undefined && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Årsavgift</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.fees.annualFee === 0 ? 'Gratis' : formatCurrency(card.fees.annualFee)}
                  </p>
                  {card.fees.annualFeeNote && (
                    <p className="text-xs text-gray-400">{card.fees.annualFeeNote}</p>
                  )}
                </div>
              )}

              <a
                href={card.affiliateLink}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-primary w-full text-center block"
              >
                {card.ctaText}
              </a>

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

function FactItem({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-semibold text-gray-900">{value}</dd>
      {note && <p className="text-xs text-gray-400">{note}</p>}
    </div>
  )
}

function InsuranceRow({ label, active, note }: { label: string; active: boolean; note?: string }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <span className={active ? 'text-green-500 font-bold' : 'text-gray-300 font-bold'}>
        {active ? '✓' : '✗'}
      </span>
      <span className={active ? 'text-gray-800' : 'text-gray-400'}>
        {label}
        {note && <span className="ml-1 text-gray-500">({note})</span>}
      </span>
    </li>
  )
}

function BreadcrumbSchema({ cardName, slug }: { cardName: string; slug: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Hem',
        item: `https://${siteConfig.domain}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Kreditkort',
        item: `https://${siteConfig.domain}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cardName,
        item: `https://${siteConfig.domain}/kreditkort/${slug}`,
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

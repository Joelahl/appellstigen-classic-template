import Image from 'next/image'
import Link from 'next/link'
import type { CreditCard } from '@/types'

interface Props {
  card: CreditCard
  rank?: number
  /** URL segment for the review page (e.g. "kreditkort"). */
  reviewPath?: string
}

/**
 * Vertical, mobile-first comparison card used in the toplist grid.
 * Rank (top-left) + rating (top-right), image, name, key facts, CTA, review link.
 */
export default function CreditCardCard({ card, rank, reviewPath = 'kreditkort' }: Props) {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Header: rank + rating + image + name */}
      <div className="relative p-5 pb-4" style={{ background: 'var(--hero-bg)' }}>
        <div className="flex items-start justify-between">
          {rank && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-500 shadow-sm">
              {rank}
            </span>
          )}
          {typeof card.editorRating === 'number' && card.editorRating > 0 && (
            <span
              className="rounded-md px-2 py-1 text-sm font-bold text-white"
              style={{ background: 'var(--brand, #1d4ed8)' }}
            >
              {card.editorRating.toLocaleString('sv-SE')} <span className="font-normal opacity-80">/5</span>
            </span>
          )}
        </div>

        <div className="mt-3 flex h-16 items-center justify-center">
          {card.cardImageUrl ? (
            <Image
              src={card.cardImageUrl}
              alt={`${card.cardName} kortbild`}
              width={120}
              height={64}
              className="max-h-16 w-auto object-contain"
              itemProp="image"
            />
          ) : (
            <span className="text-lg font-bold text-gray-700">{card.cardName}</span>
          )}
        </div>

        <p className="mt-3 text-center">
          <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-gray-800">
            {card.cardName}
          </span>
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Key facts */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
          <Fact label="Bonus" value={card.bonus} />
          <Fact label="Årskostnad" value={card.fees.annualCost} />
          <Fact label="Ränta" value={card.fees.interestRate} />
          <Fact label="Passar" value={card.bestFor} />
        </div>

        {/* Feature chips */}
        {(card.applePay || card.googlePay || card.contactless) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.applePay && <Chip label="Apple Pay" />}
            {card.googlePay && <Chip label="Google Pay" />}
            {card.contactless && <Chip label="Contactless" />}
          </div>
        )}

        <div className="mt-4 flex-1" />

        {/* CTA */}
        {card.affiliateLink && (
          <a
            href={card.affiliateLink}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="btn-primary w-full"
            aria-label={`Ansök om ${card.cardName}`}
          >
            {card.ctaText}
          </a>
        )}
        <Link
          href={`/${reviewPath}/${card.slug}`}
          className="mt-2 block rounded-md border border-gray-200 py-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Läs recension →
        </Link>

        <p className="mt-3 text-center text-[11px] text-gray-400">
          Annonslänk · 18+ · Kontrollera villkoren hos utgivaren
        </p>
      </div>
    </article>
  )
}

function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || '—'}</p>
    </div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-700 ring-1 ring-green-100">
      {label}
    </span>
  )
}

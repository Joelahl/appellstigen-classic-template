import Image from 'next/image'
import Link from 'next/link'
import type { CreditCard } from '@/types'
import StarRating from './StarRating'

interface Props {
  card: CreditCard
  rank?: number
}

export default function CreditCardCard({ card, rank }: Props) {
  return (
    <article
      className="card overflow-hidden transition hover:shadow-md"
      itemScope
      itemType="https://schema.org/Product"
    >
      {card.featured && (
        <div className="bg-amber-400 px-4 py-1 text-center text-xs font-bold uppercase tracking-wider text-amber-900">
          Redaktörens val
        </div>
      )}

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {rank && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-400">
            {rank}
          </div>
        )}

        {/* Card image */}
        <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-50 p-2">
          {card.cardImageUrl ? (
            <Image
              src={card.cardImageUrl}
              alt={`${card.cardName} kortbild`}
              width={88}
              height={56}
              className="object-contain"
              itemProp="image"
            />
          ) : (
            <div className="text-center text-xs text-gray-400">{card.issuer || card.cardName}</div>
          )}
        </div>

        {/* Name & rating */}
        <div className="flex-1">
          {card.cardType && (
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {card.cardType}
            </p>
          )}
          <h2 className="text-lg font-bold text-gray-900" itemProp="name">
            <Link href={`/kreditkort/${card.slug}`} className="hover:text-blue-700">
              {card.cardName}
            </Link>
          </h2>
          {typeof card.editorRating === 'number' && card.editorRating > 0 && (
            <StarRating rating={card.editorRating} size="sm" showLabel />
          )}
          {card.bestFor && <p className="mt-0.5 text-xs text-gray-500">{card.bestFor}</p>}
        </div>

        {/* Key stats (text values from CMS) */}
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Årskostnad" value={card.fees.annualCost} />
          <Stat label="Ränta" value={card.fees.interestRate} />
          <Stat label="Bonus" value={card.bonus} />
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-1.5">
          {card.applePay && <Badge label="Apple Pay" />}
          {card.googlePay && <Badge label="Google Pay" />}
          {card.contactless && <Badge label="Contactless" />}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-2">
          {card.affiliateLink && (
            <a
              href={card.affiliateLink}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="btn-primary w-full text-center"
              aria-label={`Ansök om ${card.cardName}`}
            >
              {card.ctaText}
            </a>
          )}
          <Link href={`/kreditkort/${card.slug}`} className="text-xs text-blue-600 hover:underline">
            Läs recension →
          </Link>
        </div>
      </div>

      {card.verdict && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-sm text-gray-600 italic">
          {card.verdict}
        </div>
      )}
    </article>
  )
}

function Stat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value || '—'}</p>
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
      ✓ {label}
    </span>
  )
}

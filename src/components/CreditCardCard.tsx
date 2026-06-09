import Image from 'next/image'
import Link from 'next/link'
import type { CreditCard } from '@/types'
import StarRating from './StarRating'
import { formatCurrency, formatPercent } from '@/lib/utils'

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
        {/* Rank */}
        {rank && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
            {rank}
          </div>
        )}

        {/* Card image */}
        <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-2">
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
            <div className="text-center text-xs text-gray-400">{card.issuer}</div>
          )}
        </div>

        {/* Name & rating */}
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400" itemProp="brand">
            {card.issuer}
          </p>
          <h2 className="text-lg font-bold text-gray-900" itemProp="name">
            <Link href={`/kreditkort/${card.slug}`} className="hover:text-blue-700">
              {card.cardName}
            </Link>
          </h2>
          <StarRating rating={card.editorRating} size="sm" showLabel />
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
          <Stat
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
          <Stat
            label="Ränta"
            value={
              card.fees.interestRate !== undefined
                ? formatPercent(card.fees.interestRate)
                : '—'
            }
          />
          <Stat
            label="Cashback"
            value={
              card.rewards.cashbackPercent !== undefined
                ? formatPercent(card.rewards.cashbackPercent)
                : card.rewards.welcomeBonus
                  ? 'Bonus'
                  : '—'
            }
            note={card.rewards.cashbackNote || card.rewards.welcomeBonus}
          />
        </div>

        {/* Insurance badges */}
        <div className="flex flex-wrap gap-1.5">
          {card.insurance.travelInsurance && <Badge label="Reseförsäkring" />}
          {card.insurance.purchaseProtection && <Badge label="Köpskydd" />}
          {card.insurance.cancellationProtection && <Badge label="Avbeställning" />}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-2">
          <a
            href={card.affiliateLink}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="btn-primary w-full text-center"
            aria-label={`Ansök om ${card.cardName}`}
          >
            {card.ctaText}
          </a>
          <Link
            href={`/kreditkort/${card.slug}`}
            className="text-xs text-blue-600 hover:underline"
          >
            Läs recension →
          </Link>
        </div>
      </div>

      {/* Verdict */}
      {card.verdict && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-sm text-gray-600 italic">
          {card.verdict}
        </div>
      )}
    </article>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
      {note && <p className="text-xs text-gray-400 truncate max-w-[100px]" title={note}>{note}</p>}
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

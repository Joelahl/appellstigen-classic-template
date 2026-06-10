import Image from 'next/image'
import Link from 'next/link'
import type { CreditCard } from '@/types'
import StarRating from './StarRating'

/** "What's the best card?" answer box with a clear H2 and the winning card. */
export function BestCardBox({
  card,
  summary,
  categoryTitle,
}: {
  card?: CreditCard
  summary?: string
  categoryTitle: string
}) {
  if (!card) return null
  return (
    <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
      <h2 className="text-xl font-bold text-gray-900">
        Vilket är det bästa {categoryTitle.toLowerCase()}?
      </h2>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white p-2">
          {card.cardImageUrl ? (
            <Image src={card.cardImageUrl} alt={card.cardName} width={84} height={52} className="object-contain" />
          ) : (
            <span className="text-xs text-gray-400">{card.cardName}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">Vårt toppval</p>
          <p className="text-lg font-bold text-gray-900">{card.cardName}</p>
          {typeof card.editorRating === 'number' && card.editorRating > 0 && (
            <StarRating rating={card.editorRating} size="sm" showLabel />
          )}
        </div>
        {card.affiliateLink && (
          <a
            href={card.affiliateLink}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="btn-primary text-center"
          >
            {card.ctaText}
          </a>
        )}
      </div>
      {summary && <p className="mt-4 text-gray-700">{summary}</p>}
    </section>
  )
}

/** Comparison table driven by the curated toplist cards. */
export function ComparisonTable({ cards }: { cards: CreditCard[] }) {
  if (!cards?.length) return null
  return (
    <section className="overflow-x-auto">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Jämför korten</h2>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left text-gray-500">
            <th className="py-3 pr-4">#</th>
            <th className="py-3 pr-4">Kort</th>
            <th className="py-3 pr-4">Årskostnad</th>
            <th className="py-3 pr-4">Ränta</th>
            <th className="py-3 pr-4">Bonus</th>
            <th className="py-3 pr-4">Betyg</th>
            <th className="py-3 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c, i) => (
            <tr key={c.id} className="border-b border-gray-100 align-middle">
              <td className="py-3 pr-4 font-bold text-blue-700">{i + 1}</td>
              <td className="py-3 pr-4">
                <Link href={`/kreditkort/${c.slug}`} className="font-semibold text-gray-900 hover:text-blue-700">
                  {c.cardName}
                </Link>
              </td>
              <td className="py-3 pr-4">{c.fees.annualCost || '—'}</td>
              <td className="py-3 pr-4">{c.fees.interestRate || '—'}</td>
              <td className="py-3 pr-4">{c.bonus || '—'}</td>
              <td className="py-3 pr-4">
                {typeof c.editorRating === 'number' && c.editorRating > 0 ? `${c.editorRating}/5` : '—'}
              </td>
              <td className="py-3 pr-4">
                {c.affiliateLink && (
                  <a
                    href={c.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="inline-block rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    {c.ctaText}
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

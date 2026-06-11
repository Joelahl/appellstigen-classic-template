import Link from 'next/link'
import type { CreditCard } from '@/types'

/** "What's the best?" answer box — free-text answer with a clear H2. */
export function BestCardBox({
  summary,
  categoryTitle,
  title,
}: {
  summary?: string
  categoryTitle: string
  /** Optional CMS override heading (bestCardTitle). */
  title?: string
}) {
  if (!summary) return null
  const heading = title || `Vilket är det bästa ${categoryTitle.toLowerCase()}?`
  return (
    <section
      className="rounded-lg border bg-white p-6"
      style={{ borderColor: 'var(--brand-accent, #f59e0b)' }}
    >
      <span
        className="inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
        style={{
          color: 'var(--brand-accent,#f59e0b)',
          background: 'color-mix(in srgb, var(--brand-accent,#f59e0b) 14%, white)',
        }}
      >
        Expertens rekommendation
      </span>
      <h2 className="mt-3 text-xl font-bold text-gray-900">{heading}</h2>
      <div
        className="prose prose-sm mt-3 max-w-none text-gray-700 prose-a:text-blue-700"
        dangerouslySetInnerHTML={{ __html: summary }}
      />
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

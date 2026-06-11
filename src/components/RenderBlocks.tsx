import Link from 'next/link'
import type { LayoutBlock, CreditCard } from '@/types'
import { getCreditCards, getFeaturedCards } from '@/lib/payload'
import CreditCardCard from './CreditCardCard'

/** Renders a Pages `layout` array of blocks. */
export default async function RenderBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  if (!blocks?.length) return null
  return (
    <div className="space-y-10">
      {blocks.map((block, i) => (
        <Block key={block.id || i} block={block} />
      ))}
    </div>
  )
}

async function Block({ block }: { block: LayoutBlock }) {
  switch (block.blockType) {
    case 'richText':
      return block.html ? (
        <article
          className="prose prose-sm sm:prose max-w-none prose-headings:font-semibold prose-a:text-blue-700"
          dangerouslySetInnerHTML={{ __html: block.html as string }}
        />
      ) : null

    case 'hero':
      return (
        <section className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">{block.heading as string}</h2>
          {block.subheading ? (
            <p className="mx-auto mt-3 max-w-2xl text-blue-100">{block.subheading as string}</p>
          ) : null}
          {block.ctaLabel && block.ctaHref ? (
            <Link href={block.ctaHref as string} className="btn-primary mt-6 inline-block">
              {block.ctaLabel as string}
            </Link>
          ) : null}
        </section>
      )

    case 'cardComparison': {
      const source = (block.source as string) || 'all'
      const limit = (block.limit as number) || 10
      let cards: CreditCard[] = []
      if (source === 'featured') cards = await getFeaturedCards(limit)
      else if (source === 'manual') {
        // manual cards come populated via depth on the page fetch
        const raw = (block.cards as Array<Record<string, unknown>>) || []
        cards = raw
          .filter((c) => typeof c === 'object')
          .slice(0, limit)
          .map((c) => ({ ...(c as unknown as CreditCard) }))
      } else cards = (await getCreditCards()).slice(0, limit)

      return (
        <section>
          {block.heading ? (
            <h2 className="mb-6 text-2xl font-bold text-gray-900">{block.heading as string}</h2>
          ) : null}
          <div className="space-y-4">
            {cards.map((card, i) => (
              <CreditCardCard key={card.id || i} card={card} rank={i + 1} />
            ))}
          </div>
        </section>
      )
    }

    case 'cta':
      return (
        <section className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">{block.heading as string}</h2>
          {block.text ? <p className="mt-2 text-gray-600">{block.text as string}</p> : null}
          {block.buttonLabel && block.buttonHref ? (
            <a
              href={block.buttonHref as string}
              className="btn-primary mt-4 inline-block"
              rel="nofollow sponsored"
            >
              {block.buttonLabel as string}
            </a>
          ) : null}
        </section>
      )

    case 'faq': {
      const items = (block.items as Array<{ question: string; answer: string }>) || []
      return (
        <section>
          {block.heading ? (
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{block.heading as string}</h2>
          ) : null}
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
            {items.map((it, i) => (
              <details key={i} className="group p-4">
                <summary className="cursor-pointer font-medium text-gray-900">{it.question}</summary>
                <p className="mt-2 text-sm text-gray-600">{it.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )
    }

    case 'imageText': {
      const right = (block.imageSide as string) === 'right'
      return (
        <section className={`flex flex-col gap-6 sm:flex-row ${right ? 'sm:flex-row-reverse' : ''} sm:items-center`}>
          {block.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.imageUrl as string}
              alt={(block.heading as string) || ''}
              className="w-full rounded-xl object-cover sm:w-1/2"
            />
          ) : null}
          <div className="sm:w-1/2">
            {block.heading ? (
              <h2 className="text-2xl font-bold text-gray-900">{block.heading as string}</h2>
            ) : null}
            {block.text ? <p className="mt-2 text-gray-600">{block.text as string}</p> : null}
          </div>
        </section>
      )
    }

    default:
      return null
  }
}

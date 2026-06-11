import type { CreditCard } from '@/types'

interface Props {
  card: CreditCard
}

export default function CreditCardSchema({ card }: Props) {
  const hasRating = typeof card.editorRating === 'number' && card.editorRating > 0

  // Credit cards aren't priced products, so no Offer/price node (a price of "0"
  // is misleading). Product stays rich-result-eligible via aggregateRating.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: card.cardName,
    ...(card.issuer && { brand: { '@type': 'Brand', name: card.issuer } }),
    description: card.verdict || card.seo.metaDescription || card.bestFor,
    ...(card.cardImageUrl && { image: card.cardImageUrl }),
    ...(hasRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: card.editorRating,
        bestRating: 5,
        worstRating: 1,
        reviewCount: 1,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

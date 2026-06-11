import type { CreditCard } from '@/types'
import siteConfig from '@/siteConfig'

interface Props {
  card: CreditCard
  reviewPath?: string
}

export default function CreditCardSchema({ card, reviewPath = 'kreditkort' }: Props) {
  const hasRating = typeof card.editorRating === 'number' && card.editorRating > 0

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: card.cardName,
    ...(card.issuer && { brand: { '@type': 'Brand', name: card.issuer } }),
    description: card.verdict || card.seo.metaDescription || card.bestFor,
    ...(card.cardImageUrl && { image: card.cardImageUrl }),
    offers: {
      '@type': 'Offer',
      url: `https://${siteConfig.domain}/${reviewPath}/${card.slug}`,
      availability: 'https://schema.org/InStock',
      priceCurrency: 'SEK',
      price: '0',
    },
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

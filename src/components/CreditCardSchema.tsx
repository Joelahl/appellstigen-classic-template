import type { CreditCard } from '@/types'
import siteConfig from '@/siteConfig'

interface Props {
  card: CreditCard
}

export default function CreditCardSchema({ card }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: card.cardName,
    brand: { '@type': 'Brand', name: card.issuer },
    description: card.verdict || card.seo.metaDescription,
    ...(card.cardImageUrl && { image: card.cardImageUrl }),
    offers: {
      '@type': 'Offer',
      url: `https://${siteConfig.domain}/kreditkort/${card.slug}`,
      availability: 'https://schema.org/InStock',
      ...(card.fees.annualFee !== undefined && {
        price: card.fees.annualFee,
        priceCurrency: 'SEK',
      }),
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: card.editorRating,
      bestRating: 5,
      worstRating: 1,
      reviewCount: 1,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

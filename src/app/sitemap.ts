import type { MetadataRoute } from 'next'
import { getCreditCards, getReviewPath } from '@/lib/payload'
import siteConfig from '@/siteConfig'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${siteConfig.domain}`
  const [cards, reviewPath] = await Promise.all([getCreditCards(), getReviewPath()])

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/om-oss`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/integritetspolicy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const cardPages: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `${base}/${reviewPath}/${card.slug}`,
    lastModified: card.lastVerified ? new Date(card.lastVerified) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: card.featured ? 0.9 : 0.7,
  }))

  return [...staticPages, ...cardPages]
}

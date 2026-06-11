import type { MetadataRoute } from 'next'
import { getPages, getCreditCards, getReviewPath } from '@/lib/payload'
import siteConfig from '@/siteConfig'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${siteConfig.domain}`
  const [pages, cards, reviewPath] = await Promise.all([
    getPages(),
    getCreditCards(),
    getReviewPath(),
  ])

  // Every CMS page, with its real last-updated date.
  const pageEntries: MetadataRoute.Sitemap = pages.map((p) => ({
    url: p.pageType === 'homepage' ? base : `${base}/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency:
      p.pageType === 'homepage' ? 'daily' : p.pageType === 'category' ? 'weekly' : 'monthly',
    priority: p.pageType === 'homepage' ? 1 : p.pageType === 'category' ? 0.8 : 0.5,
  }))

  const cardEntries: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `${base}/${reviewPath}/${card.slug}`,
    lastModified: card.lastVerified ? new Date(card.lastVerified) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: card.featured ? 0.9 : 0.7,
  }))

  return [...pageEntries, ...cardEntries]
}

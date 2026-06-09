import { getCreditCards } from '@/lib/payload'
import siteConfig from '@/siteConfig'

export async function GET() {
  const base = `https://${siteConfig.domain}`
  const cards = await getCreditCards()

  const items = cards
    .slice(0, 20)
    .map(
      (card) => `
    <item>
      <title><![CDATA[${card.cardName} — Recension & Omdöme]]></title>
      <link>${base}/kreditkort/${card.slug}</link>
      <guid isPermaLink="true">${base}/kreditkort/${card.slug}</guid>
      <description><![CDATA[${card.verdict || `Läs vår recension av ${card.cardName} från ${card.issuer}.`}]]></description>
      ${card.lastVerified ? `<pubDate>${new Date(card.lastVerified).toUTCString()}</pubDate>` : ''}
    </item>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.siteName}</title>
    <link>${base}</link>
    <description>${siteConfig.defaultDescription}</description>
    <language>${siteConfig.locale}</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}

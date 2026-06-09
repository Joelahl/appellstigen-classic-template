import type { SiteConfig } from './types'

/**
 * siteConfig — the single source of truth for this site's identity.
 *
 * All site-specific values live here. The template reads from this file
 * and never hardcodes site identity elsewhere, which means the template
 * can be detached and deployed standalone by swapping this file.
 *
 * ENV overrides allow Coolify/Docker to inject values at deploy time without
 * rebuilding the image (useful when the same Docker image serves multiple envs).
 */
const siteConfig: SiteConfig = {
  siteId: process.env.NEXT_PUBLIC_SITE_ID || 'basta-kreditkort',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Bästa Kreditkort',
  domain: process.env.NEXT_PUBLIC_DOMAIN || 'bästa-kreditkort.nu',
  locale: process.env.NEXT_PUBLIC_LOCALE || 'sv',

  tagline: 'Hitta det bästa kreditkortet för dig',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#1e40af',
  accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR || '#f59e0b',

  titleTemplate: '%s | Bästa Kreditkort',
  defaultTitle: 'Bästa Kreditkort 2025 — Jämför & Hitta Rätt Kort',
  defaultDescription:
    'Jämför Sveriges bästa kreditkort. Vi listar årsavgifter, räntor, bonus och försäkringar så att du enkelt hittar kortet som passar dig.',

  navigation: [
    { label: 'Jämför kort', href: '/' },
    { label: 'Guider', href: '/guider' },
    { label: 'Om oss', href: '/om-oss' },
  ],

  affiliateDisclosure:
    'Den här sajten innehåller affiliatelänkar. Vi kan få ersättning om du ansöker om ett kort via våra länkar, utan extra kostnad för dig. Det påverkar inte våra omdömen.',
  disclaimer:
    'Informationen på denna sajt är endast i informationssyfte. Kontrollera alltid aktuella villkor direkt hos kortutgivaren innan du ansöker.',
}

export default siteConfig

export interface SiteConfig {
  siteId: string
  siteName: string
  domain: string
  locale: string
  tagline?: string
  primaryColor: string
  accentColor: string
  titleTemplate: string
  defaultTitle: string
  defaultDescription: string
  defaultOgImageUrl?: string
  googleVerification?: string
  gaId?: string
  affiliateDisclosure: string
  disclaimer: string
  navigation: Array<{ label: string; href: string }>
}

/**
 * CreditCard — mirrors the global CreditCards collection in the CMS.
 * Fee/rate values are strings (e.g. "0 kr", "21,40 %") to preserve source
 * formatting from the migrated WordPress data.
 */
export interface CreditCard {
  id: string
  cardName: string
  slug: string
  issuer?: string
  cardType?: string
  cardImageUrl?: string
  featured: boolean
  bestFor?: string
  description?: string

  editorRating?: number
  ratings?: {
    bonus?: number
    insurance?: number
    creditTerms?: number
    fees?: number
  }

  fees: {
    annualCost?: string
    maxCredit?: string
    interestRate?: string
    interestFreePeriod?: string
    currencyFee?: string
    withdrawalFee?: string
    invoiceFee?: string
    reminderFee?: string
    overdraftFee?: string
  }
  eligibility: {
    minAge?: string
    minIncome?: string
    paymentRemarks?: string
  }
  termsText?: string

  bonus?: string
  concierge?: string
  airportLounge?: string
  pros: string[]
  cons: string[]

  applePay: boolean
  googlePay: boolean
  contactless: boolean

  verdict?: string
  reviewContent?: string
  screenshotUrl?: string

  affiliateLink?: string
  ctaText: string

  seo: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
  }
  sortOrder?: number
  lastVerified?: string
}

/** A layout block from the Pages `layout` blocks field. */
export interface LayoutBlock {
  blockType: 'richText' | 'prose' | 'image' | 'hero' | 'cardComparison' | 'cta' | 'faq' | 'imageText'
  id?: string
  [key: string]: unknown
}

/** Author — byline / editorial team member. */
export interface Author {
  id: string
  name: string
  title?: string
  avatarUrl?: string
  bio?: string
  email?: string
  linkedin?: string
}

/** SiteData — per-site branding/design pulled from the CMS Sites collection. */
export interface SiteData {
  id: string
  name: string
  domain: string
  /** URL segment for individual reviews, e.g. "kreditkort" → /kreditkort/<slug>. */
  reviewSlug: string
  branding: {
    siteName?: string
    tagline?: string
    logoUrl?: string
    logoLightUrl?: string
    primaryColor?: string
    accentColor?: string
    faviconUrl?: string
    heroImageUrl?: string
    backgroundImageUrl?: string
  }
  company?: {
    legalName?: string
    orgNumber?: string
    address?: string
    email?: string
    phone?: string
    openingHours?: string
  }
  about?: { heading?: string; text?: string }
  navigation?: Array<{ label: string; href: string }>
}

/** Page — mirrors the Pages collection (homepage, category, info, legal). */
export interface Page {
  id: string
  title: string
  slug: string
  pageType: 'homepage' | 'category' | 'info' | 'legal' | 'other'
  menuOrder: number
  excerpt?: string
  content?: string
  layout?: LayoutBlock[]
  author?: Author
  bestCard?: CreditCard
  bestCardTitle?: string
  bestCardSummary?: string
  toplistCards?: CreditCard[]
  updatedAt?: string
  createdAt?: string
  seo: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
  }
}

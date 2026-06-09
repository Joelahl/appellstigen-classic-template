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

export interface CreditCard {
  id: string
  cardName: string
  slug: string
  issuer: string
  cardImageUrl?: string
  featured: boolean
  fees: {
    annualFee?: number
    annualFeeNote?: string
    interestRate?: number
    interestFreeDays?: number
    withdrawalFee?: string
    foreignTransactionFee?: string
  }
  creditLimit?: { min?: number; max?: number }
  rewards: {
    welcomeBonus?: string
    cashbackPercent?: number
    cashbackNote?: string
    pointsProgram?: string
  }
  benefits: string[]
  insurance: {
    travelInsurance: boolean
    travelInsuranceNote?: string
    purchaseProtection: boolean
    cancellationProtection: boolean
    priceProtection: boolean
  }
  eligibility: {
    minAge: number
    minIncome?: number
    requiresSwedishResident: boolean
  }
  editorRating: number
  pros: string[]
  cons: string[]
  verdict?: string
  affiliateLink: string
  ctaText: string
  sortOrder: number
  seo: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
  }
  lastVerified?: string
}

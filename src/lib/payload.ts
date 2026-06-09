import type { CreditCard } from '@/types'

const CMS_URL = process.env.PAYLOAD_CMS_URL || 'http://localhost:3001'
const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'basta-kreditkort'
const API_KEY = process.env.PAYLOAD_API_KEY || ''

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
}
if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`

async function fetchFromCMS<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${CMS_URL}/api${path}`, {
      ...options,
      headers,
      next: { revalidate: 300 }, // 5-minute ISR
    })
    if (!res.ok) throw new Error(`CMS fetch failed: ${res.status} ${path}`)
    return res.json() as Promise<T>
  } catch (err) {
    // During build the CMS may not be reachable — return empty data gracefully
    console.warn(`CMS unavailable (${CMS_URL}): ${err}`)
    return { docs: [], totalDocs: 0 } as unknown as T
  }
}

function mapCard(raw: Record<string, unknown>): CreditCard {
  const fees = (raw.fees as Record<string, unknown>) || {}
  const rewards = (raw.rewards as Record<string, unknown>) || {}
  const insurance = (raw.insurance as Record<string, unknown>) || {}
  const eligibility = (raw.eligibility as Record<string, unknown>) || {}
  const creditLimit = (raw.creditLimit as Record<string, unknown>) || {}
  const seo = (raw.seo as Record<string, unknown>) || {}
  const benefits = ((raw.benefits as Array<{ benefit: string }>) || []).map((b) => b.benefit)
  const pros = ((raw.pros as Array<{ item: string }>) || []).map((p) => p.item)
  const cons = ((raw.cons as Array<{ item: string }>) || []).map((c) => c.item)

  const cardImage = raw.cardImage as Record<string, unknown> | null
  const ogImage = seo.ogImage as Record<string, unknown> | null

  return {
    id: raw.id as string,
    cardName: raw.cardName as string,
    slug: raw.slug as string,
    issuer: raw.issuer as string,
    cardImageUrl: cardImage ? (`${CMS_URL}${cardImage.url}` as string) : undefined,
    featured: Boolean(raw.featured),
    fees: {
      annualFee: fees.annualFee as number | undefined,
      annualFeeNote: fees.annualFeeNote as string | undefined,
      interestRate: fees.interestRate as number | undefined,
      interestFreeDays: fees.interestFreedays as number | undefined,
      withdrawalFee: fees.withdrawalFee as string | undefined,
      foreignTransactionFee: fees.foreignTransactionFee as string | undefined,
    },
    creditLimit: {
      min: creditLimit.min as number | undefined,
      max: creditLimit.max as number | undefined,
    },
    rewards: {
      welcomeBonus: rewards.welcomeBonus as string | undefined,
      cashbackPercent: rewards.cashbackPercent as number | undefined,
      cashbackNote: rewards.cashbackNote as string | undefined,
      pointsProgram: rewards.pointsProgram as string | undefined,
    },
    benefits,
    insurance: {
      travelInsurance: Boolean(insurance.travelInsurance),
      travelInsuranceNote: insurance.travelInsuranceNote as string | undefined,
      purchaseProtection: Boolean(insurance.purchaseProtection),
      cancellationProtection: Boolean(insurance.cancellationProtection),
      priceProtection: Boolean(insurance.priceProtection),
    },
    eligibility: {
      minAge: (eligibility.minAge as number) || 18,
      minIncome: eligibility.minIncome as number | undefined,
      requiresSwedishResident: Boolean(eligibility.requiresSwedishResident),
    },
    editorRating: raw.editorRating as number,
    pros,
    cons,
    verdict: raw.verdict as string | undefined,
    affiliateLink: raw.affiliateLink as string,
    ctaText: (raw.ctaText as string) || 'Ansök nu',
    sortOrder: (raw.sortOrder as number) || 100,
    seo: {
      metaTitle: seo.metaTitle as string | undefined,
      metaDescription: seo.metaDescription as string | undefined,
      ogImageUrl: ogImage ? (`${CMS_URL}${ogImage.url}` as string) : undefined,
    },
    lastVerified: raw.lastVerified as string | undefined,
  }
}

export async function getCreditCards(): Promise<CreditCard[]> {
  type Response = { docs: Record<string, unknown>[]; totalDocs: number }
  const data = await fetchFromCMS<Response>(
    `/credit-cards?where[site.siteId][equals]=${SITE_ID}&where[status][equals]=published&sort=sortOrder&limit=100`,
  )
  return data.docs.map(mapCard)
}

export async function getCreditCard(slug: string): Promise<CreditCard | null> {
  type Response = { docs: Record<string, unknown>[] }
  const data = await fetchFromCMS<Response>(
    `/credit-cards?where[slug][equals]=${slug}&where[site.siteId][equals]=${SITE_ID}&limit=1`,
  )
  if (!data.docs.length) return null
  return mapCard(data.docs[0])
}

export async function getFeaturedCards(limit = 3): Promise<CreditCard[]> {
  type Response = { docs: Record<string, unknown>[] }
  const data = await fetchFromCMS<Response>(
    `/credit-cards?where[site.siteId][equals]=${SITE_ID}&where[status][equals]=published&where[featured][equals]=true&sort=sortOrder&limit=${limit}`,
  )
  return data.docs.map(mapCard)
}

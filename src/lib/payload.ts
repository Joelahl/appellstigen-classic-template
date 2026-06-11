import type { CreditCard, Page, Author, SiteData } from '@/types'
import { draftMode } from 'next/headers'

const CMS_URL = process.env.PAYLOAD_CMS_URL || 'http://localhost:3001'
const API_KEY = process.env.PAYLOAD_API_KEY || ''

/** Is the current request in Next draft-mode preview? */
async function isPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

async function fetchFromCMS<T>(path: string, draft = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  // In preview, authenticate with the Payload API key to read draft versions.
  if (draft && API_KEY) headers['Authorization'] = `users API-Key ${API_KEY}`
  const url = `${CMS_URL}/api${path}${draft ? '&draft=true' : ''}`
  try {
    const res = await fetch(url, {
      headers,
      // Drafts must never be cached; published content uses 5-min ISR.
      ...(draft ? { cache: 'no-store' as RequestCache } : { next: { revalidate: 300 } }),
    })
    if (!res.ok) throw new Error(`CMS fetch failed: ${res.status} ${path}`)
    return res.json() as Promise<T>
  } catch (err) {
    console.warn(`CMS unavailable (${CMS_URL}): ${err}`)
    return { docs: [], totalDocs: 0 } as unknown as T
  }
}

/** Resolve a media/upload field or string into an absolute URL. */
function resolveImage(val: unknown): string | undefined {
  if (!val) return undefined
  if (typeof val === 'string') {
    return val.startsWith('http') ? val : `${CMS_URL}${val}`
  }
  const obj = val as Record<string, unknown>
  const url = obj.url as string | undefined
  if (url) return url.startsWith('http') ? url : `${CMS_URL}${url}`
  return undefined
}

/** Minimal Lexical (Payload rich text) → HTML serializer for simple content
 *  (paragraphs, headings, lists, links, bold/italic/underline). */
function lexicalToHtml(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return typeof value === 'string' ? value : undefined
  const root = (value as Record<string, unknown>).root as Record<string, unknown> | undefined
  if (!root || !Array.isArray(root.children)) return undefined
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const text = (n: Record<string, unknown>): string => {
    let t = esc(String(n.text ?? ''))
    const f = Number(n.format || 0)
    if (f & 1) t = `<strong>${t}</strong>`
    if (f & 2) t = `<em>${t}</em>`
    if (f & 8) t = `<u>${t}</u>`
    return t
  }

  const kids = (arr: unknown): string =>
    (Array.isArray(arr) ? arr : []).map((c) => node(c as Record<string, unknown>)).join('')

  const node = (n: Record<string, unknown>): string => {
    switch (n.type) {
      case 'text':
        return text(n)
      case 'linebreak':
        return '<br/>'
      case 'paragraph': {
        const inner = kids(n.children)
        return inner ? `<p>${inner}</p>` : ''
      }
      case 'heading': {
        const tag = (n.tag as string) || 'h2'
        return `<${tag}>${kids(n.children)}</${tag}>`
      }
      case 'list': {
        const tag = n.tag === 'ol' || n.listType === 'number' ? 'ol' : 'ul'
        return `<${tag}>${kids(n.children)}</${tag}>`
      }
      case 'listitem':
        return `<li>${kids(n.children)}</li>`
      case 'quote':
        return `<blockquote>${kids(n.children)}</blockquote>`
      case 'link': {
        const url = ((n.fields as Record<string, unknown>)?.url as string) || '#'
        return `<a href="${esc(url)}">${kids(n.children)}</a>`
      }
      default:
        return kids(n.children)
    }
  }

  const html = kids(root.children).trim()
  return html || undefined
}

function mapCard(raw: Record<string, unknown>): CreditCard {
  const fees = (raw.fees as Record<string, unknown>) || {}
  const eligibility = (raw.eligibility as Record<string, unknown>) || {}
  const ratings = (raw.ratings as Record<string, unknown>) || {}
  const seo = (raw.seo as Record<string, unknown>) || {}
  const pros = ((raw.pros as Array<{ item: string }>) || []).map((p) => p.item).filter(Boolean)
  const cons = ((raw.cons as Array<{ item: string }>) || []).map((c) => c.item).filter(Boolean)

  // Prefer an uploaded media image; fall back to the migrated remote URL.
  const cardImageUrl = resolveImage(raw.cardImage) || resolveImage(raw.cardImageUrl)

  return {
    id: String(raw.id),
    cardName: raw.cardName as string,
    slug: raw.slug as string,
    issuer: raw.issuer as string | undefined,
    cardType: raw.cardType as string | undefined,
    cardImageUrl,
    featured: Boolean(raw.featured),
    bestFor: raw.bestFor as string | undefined,
    description: raw.description as string | undefined,
    editorRating: raw.editorRating as number | undefined,
    ratings: {
      bonus: ratings.bonus as number | undefined,
      insurance: ratings.insurance as number | undefined,
      creditTerms: ratings.creditTerms as number | undefined,
      fees: ratings.fees as number | undefined,
    },
    fees: {
      annualCost: fees.annualCost as string | undefined,
      maxCredit: fees.maxCredit as string | undefined,
      interestRate: fees.interestRate as string | undefined,
      interestFreePeriod: fees.interestFreePeriod as string | undefined,
      currencyFee: fees.currencyFee as string | undefined,
      withdrawalFee: fees.withdrawalFee as string | undefined,
      invoiceFee: fees.invoiceFee as string | undefined,
      reminderFee: fees.reminderFee as string | undefined,
      overdraftFee: fees.overdraftFee as string | undefined,
    },
    eligibility: {
      minAge: eligibility.minAge as string | undefined,
      minIncome: eligibility.minIncome as string | undefined,
      paymentRemarks: eligibility.paymentRemarks as string | undefined,
    },
    termsText: raw.termsText as string | undefined,
    bonus: raw.bonus as string | undefined,
    concierge: raw.concierge as string | undefined,
    airportLounge: raw.airportLounge as string | undefined,
    pros,
    cons,
    applePay: Boolean(raw.applePay),
    googlePay: Boolean(raw.googlePay),
    contactless: Boolean(raw.contactless),
    verdict: raw.verdict as string | undefined,
    reviewContent: raw.reviewContent as string | undefined,
    screenshotUrl: resolveImage(raw.screenshotUrl),
    affiliateLink: raw.affiliateLink as string | undefined,
    ctaText: (raw.ctaText as string) || 'Ansök nu',
    seo: {
      metaTitle: seo.metaTitle as string | undefined,
      metaDescription: seo.metaDescription as string | undefined,
      ogImageUrl: resolveImage(seo.ogImageUrl),
    },
    sortOrder: (raw.sortOrder as number) ?? 100,
    lastVerified: raw.lastVerified as string | undefined,
  }
}

function mapAuthor(raw: unknown): Author | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const a = raw as Record<string, unknown>
  if (!a.name) return undefined
  return {
    id: String(a.id),
    name: a.name as string,
    title: a.title as string | undefined,
    avatarUrl: resolveImage(a.avatar) || resolveImage(a.avatarUrl),
    bio: lexicalToHtml(a.bio),
    email: a.email as string | undefined,
    linkedin: a.linkedin as string | undefined,
  }
}

function mapCardRel(raw: unknown): CreditCard | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  return mapCard(raw as Record<string, unknown>)
}

/** Resolve Lexical richText fields and image uploads inside layout blocks. */
function mapLayout(layout: unknown): Page['layout'] {
  if (!Array.isArray(layout)) return []
  return layout.map((block) => {
    if (!block || typeof block !== 'object') return block as NonNullable<Page['layout']>[number]
    const b = block as Record<string, unknown>
    if (b.blockType === 'prose' && b.content) {
      // Lexical rich-text → HTML string for the front-end
      return { ...b, content: lexicalToHtml(b.content) } as unknown as NonNullable<Page['layout']>[number]
    }
    if (b.blockType === 'image' && b.image) {
      // Resolve uploaded image (media doc or id) to an absolute URL
      return { ...b, imageUrl: resolveImage(b.image) } as unknown as NonNullable<Page['layout']>[number]
    }
    return b as NonNullable<Page['layout']>[number]
  })
}

function mapPage(raw: Record<string, unknown>): Page {
  const seo = (raw.seo as Record<string, unknown>) || {}
  const toplist = ((raw.toplistCards as unknown[]) || [])
    .map(mapCardRel)
    .filter(Boolean) as CreditCard[]
  return {
    id: String(raw.id),
    title: raw.title as string,
    slug: raw.slug as string,
    pageType: (raw.pageType as Page['pageType']) || 'other',
    menuOrder: (raw.menuOrder as number) ?? 0,
    excerpt: raw.excerpt as string | undefined,
    content: raw.content as string | undefined,
    layout: mapLayout(raw.layout),
    author: mapAuthor(raw.author),
    bestCard: mapCardRel(raw.bestCard),
    bestCardTitle: raw.bestCardTitle as string | undefined,
    bestCardSummary: lexicalToHtml(raw.bestCardSummary),
    toplistCards: toplist,
    updatedAt: raw.updatedAt as string | undefined,
    createdAt: raw.createdAt as string | undefined,
    seo: {
      metaTitle: seo.metaTitle as string | undefined,
      metaDescription: seo.metaDescription as string | undefined,
      ogImageUrl: resolveImage(seo.ogImageUrl),
    },
  }
}

function mapSite(raw: Record<string, unknown>): SiteData {
  const b = (raw.branding as Record<string, unknown>) || {}
  const about = (raw.about as Record<string, unknown>) || {}
  return {
    id: String(raw.id),
    name: raw.name as string,
    domain: raw.domain as string,
    branding: {
      siteName: b.siteName as string | undefined,
      tagline: b.tagline as string | undefined,
      logoUrl: resolveImage(b.logo),
      logoLightUrl: resolveImage(b.logoLight) || resolveImage(b.logoLightUrl),
      primaryColor: b.primaryColor as string | undefined,
      accentColor: b.accentColor as string | undefined,
      faviconUrl: resolveImage(b.faviconImage) || resolveImage(b.faviconUrl),
      heroImageUrl: resolveImage(b.heroImage) || resolveImage(b.heroImageUrl),
      backgroundImageUrl: resolveImage(b.backgroundImage) || resolveImage(b.backgroundImageUrl),
    },
    company: (() => {
      const c = (raw.company as Record<string, unknown>) || {}
      return {
        legalName: c.legalName as string | undefined,
        orgNumber: c.orgNumber as string | undefined,
        address: c.address as string | undefined,
        email: c.email as string | undefined,
        phone: c.phone as string | undefined,
        openingHours: c.openingHours as string | undefined,
      }
    })(),
    about: { heading: about.heading as string | undefined, text: lexicalToHtml(about.text) },
    navigation: (raw.navigation as Array<{ label: string; href: string }>) || [],
  }
}

// ── Credit cards ────────────────────────────────────────────────────────────
// Draft visibility is governed by Payload's native drafts: published versions
// are returned to everyone; drafts only in preview (draft=true + API key).
export async function getCreditCards(): Promise<CreditCard[]> {
  type Res = { docs: Record<string, unknown>[] }
  const draft = await isPreview()
  const data = await fetchFromCMS<Res>(
    `/credit-cards?sort=sortOrder&limit=100&depth=1`,
    draft,
  )
  return data.docs.map(mapCard)
}

export async function getCreditCard(slug: string): Promise<CreditCard | null> {
  type Res = { docs: Record<string, unknown>[] }
  const draft = await isPreview()
  const data = await fetchFromCMS<Res>(
    `/credit-cards?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`,
    draft,
  )
  return data.docs.length ? mapCard(data.docs[0]) : null
}

export async function getFeaturedCards(limit = 3): Promise<CreditCard[]> {
  type Res = { docs: Record<string, unknown>[] }
  const draft = await isPreview()
  const data = await fetchFromCMS<Res>(
    `/credit-cards?where[featured][equals]=true&sort=sortOrder&limit=${limit}&depth=1`,
    draft,
  )
  return data.docs.map(mapCard)
}

// ── Pages ───────────────────────────────────────────────────────────────────
export async function getPages(): Promise<Page[]> {
  type Res = { docs: Record<string, unknown>[] }
  const draft = await isPreview()
  const data = await fetchFromCMS<Res>(`/pages?sort=menuOrder&limit=100&depth=0`, draft)
  return data.docs.map(mapPage)
}

export async function getPage(slug: string): Promise<Page | null> {
  type Res = { docs: Record<string, unknown>[] }
  const draft = await isPreview()
  const data = await fetchFromCMS<Res>(
    `/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=2`,
    draft,
  )
  return data.docs.length ? mapPage(data.docs[0]) : null
}

// ── Site & authors ──────────────────────────────────────────────────────────
const SITE_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || ''

/** The current site's CMS record (branding/design). Falls back to first site. */
export async function getSite(): Promise<SiteData | null> {
  type Res = { docs: Record<string, unknown>[] }
  let data = await fetchFromCMS<Res>(
    `/sites?where[domain][equals]=${encodeURIComponent(SITE_DOMAIN)}&limit=1&depth=1`,
  )
  if (!data.docs?.length) {
    data = await fetchFromCMS<Res>(`/sites?limit=1&depth=1`)
  }
  return data.docs?.length ? mapSite(data.docs[0]) : null
}

export async function getAuthors(limit = 12): Promise<Author[]> {
  type Res = { docs: Record<string, unknown>[] }
  const data = await fetchFromCMS<Res>(`/authors?limit=${limit}&depth=0`)
  return (data.docs || []).map((d) => mapAuthor(d)).filter(Boolean) as Author[]
}

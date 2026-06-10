import Link from 'next/link'
import siteConfig from '@/siteConfig'

export interface Crumb {
  label: string
  href?: string
}

/**
 * Standardized breadcrumbs shown at the top of every page.
 * Renders both the visual trail and BreadcrumbList JSON-LD.
 */
export default function Breadcrumbs({
  items,
  className = '',
}: {
  items: Crumb[]
  className?: string
}) {
  const trail: Crumb[] = [{ label: 'Hem', href: '/' }, ...items]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `https://${siteConfig.domain}${c.href === '/' ? '' : c.href}` } : {}),
    })),
  }

  return (
    <nav aria-label="Brödsmulor" className={`flex flex-wrap items-center gap-1.5 text-sm text-gray-500 ${className}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {trail.map((c, i) => {
        const last = i === trail.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {c.href && !last ? (
              <Link href={c.href} className="uppercase tracking-wide hover:text-gray-800">
                {c.label}
              </Link>
            ) : (
              <span
                className="font-semibold uppercase tracking-wide"
                style={{ color: 'var(--brand-accent, #f59e0b)' }}
              >
                {c.label}
              </span>
            )}
            {!last && <span className="text-gray-300">/</span>}
          </span>
        )
      })}
    </nav>
  )
}

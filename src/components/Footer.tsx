/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import siteConfig from '@/siteConfig'
import type { SiteData } from '@/types'

interface Props {
  siteName?: string
  site?: SiteData | null
}

export default function Footer({ siteName, site }: Props) {
  const year = new Date().getFullYear()
  const name = siteName || siteConfig.siteName
  const domain = site?.domain || siteConfig.domain
  const links = site?.navigation?.length ? site.navigation : siteConfig.navigation
  const company = site?.company
  // Prefer the light (inverted) logo for the dark footer; fall back to the
  // regular logo so the logo always shows if one is uploaded.
  const footerLogo = site?.branding?.logoLightUrl || site?.branding?.logoUrl

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Accent top bar for contrast */}
      <div className="h-1 w-full" style={{ background: 'var(--brand-accent, #f59e0b)' }} />

      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + company */}
          <div className="sm:col-span-2 lg:col-span-1">
            {footerLogo && (
              <img src={footerLogo} alt={name} className="h-9 w-auto" />
            )}
            {/* Always show the site name + URL — under the logo, or alone if none */}
            <p className={`font-bold text-white ${footerLogo ? 'mt-2 text-base' : 'text-xl'}`}>
              {name}
            </p>
            {domain && <p className="text-xs text-gray-500">{domain}</p>}
            {(site?.branding?.tagline || siteConfig.tagline) && (
              <p className="mt-3 text-sm text-gray-400">{site?.branding?.tagline || siteConfig.tagline}</p>
            )}
            {company?.legalName && (
              <p className="mt-4 text-sm font-semibold text-white">{company.legalName}</p>
            )}
            {company?.orgNumber && (
              <p className="text-xs text-gray-500">Org.nr {company.orgNumber}</p>
            )}
            {company?.address && (
              <p className="mt-1 whitespace-pre-line text-xs text-gray-500">{company.address}</p>
            )}
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-accent, #f59e0b)' }}>
              Navigering
            </p>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + opening hours */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-accent, #f59e0b)' }}>
              Kontakt
            </p>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {company?.email && (
                <li>
                  <a href={`mailto:${company.email}`} className="transition hover:text-white">
                    {company.email}
                  </a>
                </li>
              )}
              {company?.phone && (
                <li>
                  <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="transition hover:text-white">
                    {company.phone}
                  </a>
                </li>
              )}
            </ul>
            {company?.openingHours && (
              <>
                <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-accent, #f59e0b)' }}>
                  Öppettider
                </p>
                <p className="whitespace-pre-line text-sm text-gray-400">{company.openingHours}</p>
              </>
            )}
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-accent, #f59e0b)' }}>
              Juridiskt
            </p>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/integritetspolicy" className="transition hover:text-white">Integritetspolicy</Link></li>
              <li><Link href="/anvandarvillkor" className="transition hover:text-white">Användarvillkor</Link></li>
              <li><Link href="/om-oss" className="transition hover:text-white">Om oss</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-12 border-t border-white/10 pt-6 text-xs leading-relaxed text-gray-500">
          {siteConfig.disclaimer}
        </p>
        <p className="mt-4 text-xs text-gray-500">
          © {year} {company?.legalName || name}. Alla rättigheter förbehållna.
        </p>
      </div>
    </footer>
  )
}

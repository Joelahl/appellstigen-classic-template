import Link from 'next/link'
import siteConfig from '@/siteConfig'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-blue-700">{siteConfig.siteName}</p>
            {siteConfig.tagline && (
              <p className="mt-1 text-sm text-gray-500">{siteConfig.tagline}</p>
            )}
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Navigation
            </p>
            <ul className="space-y-2">
              {siteConfig.navigation.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-blue-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Juridiskt
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/integritetspolicy" className="hover:text-blue-700">Integritetspolicy</Link></li>
              <li><Link href="/cookies" className="hover:text-blue-700">Cookiepolicy</Link></li>
              <li><Link href="/om-oss" className="hover:text-blue-700">Om oss</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Information
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">{siteConfig.disclaimer}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          © {year} {siteConfig.siteName}. Alla rättigheter förbehållna.
        </div>
      </div>
    </footer>
  )
}

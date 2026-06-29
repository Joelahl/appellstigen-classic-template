import Image from 'next/image'
import Link from 'next/link'
import siteConfig from '@/siteConfig'
import MobileMenu from './MobileMenu'

interface Props {
  siteName?: string
  logoUrl?: string
  nav?: Array<{ label: string; href: string }>
}

export default function Header({ siteName, logoUrl, nav }: Props) {
  const links = nav?.length ? nav : siteConfig.navigation
  const name = siteName || siteConfig.siteName

  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // Optimized + high-priority: the logo is above the fold, so it
            // should load eagerly (never lazy). `fill` + object-contain keeps
            // the real aspect ratio for any logo without knowing its dimensions.
            <span className="relative block h-9 w-44">
              <Image
                src={logoUrl}
                alt={name}
                fill
                priority
                sizes="176px"
                className="object-contain object-left"
              />
            </span>
          ) : (
            <span className="text-xl font-bold" style={{ color: 'var(--brand, #1d4ed8)' }}>
              {name}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-600 transition hover:text-blue-700">
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileMenu links={links} />
      </div>
    </header>
  )
}

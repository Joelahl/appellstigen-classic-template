import Link from 'next/link'
import siteConfig from '@/siteConfig'

interface Props {
  siteName?: string
  nav?: Array<{ label: string; href: string }>
}

export default function Header({ siteName, nav }: Props) {
  const links = nav?.length ? nav : siteConfig.navigation
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: 'var(--brand, #1d4ed8)' }}>
            {siteName || siteConfig.siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 transition hover:text-blue-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav toggle placeholder — extend as needed */}
        <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden" aria-label="Öppna meny">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </header>
  )
}

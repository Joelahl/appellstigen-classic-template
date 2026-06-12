import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import siteConfig from '@/siteConfig'
import { getSite } from '@/lib/payload'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.defaultDescription,
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    siteName: siteConfig.siteName,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(siteConfig.googleVerification && {
    verification: { google: siteConfig.googleVerification },
  }),
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite()
  const primary = site?.branding?.primaryColor || siteConfig.primaryColor
  const accent = site?.branding?.accentColor || siteConfig.accentColor
  const favicon = site?.branding?.faviconUrl
  const nav = site?.navigation?.length ? site.navigation : siteConfig.navigation
  const siteName = site?.branding?.siteName || siteConfig.siteName
  const origin = `https://${siteConfig.domain}`

  // Site-wide brand structured data (Organization + WebSite).
  const brandSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: siteName,
        url: origin,
        ...(site?.branding?.logoUrl && { logo: site.branding.logoUrl }),
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: siteName,
        inLanguage: siteConfig.locale,
        publisher: { '@id': `${origin}/#organization` },
      },
    ],
  }

  return (
    <html lang={siteConfig.locale} className="scroll-smooth">
      <head>
        {favicon && <link rel="icon" href={favicon} />}
        {/* Per-site theme tokens. --hero-bg is a light tint of the accent color
            (e.g. accent #5D9B01 -> ~#EAEEE5), scalable to any accent. */}
        <style>{`:root{--brand:${primary};--brand-accent:${accent};--hero-bg:color-mix(in srgb, ${accent} 13%, white);}`}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Header siteName={siteName} logoUrl={site?.branding?.logoUrl} nav={nav} />
        <main>{children}</main>
        <Footer siteName={siteName} site={site} />

        {siteConfig.gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${siteConfig.gaId}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}

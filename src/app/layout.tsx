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

  return (
    <html lang={siteConfig.locale}>
      <head>
        {favicon && <link rel="icon" href={favicon} />}
        {/* Per-site theme color, consumable via CSS var --brand */}
        <style>{`:root{--brand:${primary};--brand-accent:${accent};}`}</style>
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Header siteName={siteName} logoUrl={site?.branding?.logoUrl} nav={nav} />
        <main>{children}</main>
        <Footer siteName={siteName} site={site} />

        {/* Affiliate disclosure banner */}
        <div className="bg-amber-50 border-t border-amber-200 py-3 px-4 text-center text-xs text-amber-800">
          {siteConfig.affiliateDisclosure}
        </div>

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

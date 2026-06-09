import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import siteConfig from '@/siteConfig'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.locale}>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />

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

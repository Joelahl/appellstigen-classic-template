import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Pin the standalone tracing root to this project so the build doesn't get
  // confused by parent lockfiles (otherwise server.js lands in the wrong path).
  outputFileTracingRoot: dirname,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.CMS_HOSTNAME || 'cms.tacotech.se',
      },
      // Migrated card/page images still hosted on the legacy WordPress site
      {
        protocol: 'https',
        hostname: 'xn--bstkreditkort-bfb.nu',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async redirects() {
    return [
      // www → apex (308 permanent), host-agnostic so it works for any site.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www\\.(?<rest>.*)' }],
        destination: 'https://:rest/:path*',
        permanent: true,
      },
      // Add 301 redirects here when migrating from WordPress
      // { source: '/old-path', destination: '/new-path', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
}

export default nextConfig

/* eslint-disable @next/next/no-img-element */
import type { AffiliateLink } from '@/lib/payload'
import RedirectCountdown from '@/components/RedirectCountdown'
import siteConfig from '@/siteConfig'

/** Branded "you're being redirected" interstitial with a countdown. */
export default function AffiliateInterstitial({
  link,
  seconds = 2,
}: {
  link: AffiliateLink
  seconds?: number
}) {
  const name = link.card?.cardName || link.label
  return (
    <>
      {/* No-JS fallback: redirect via meta refresh after the same delay. */}
      <meta httpEquiv="refresh" content={`${seconds};url=${link.targetUrl}`} />

      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        {link.card?.cardImageUrl && (
          <img
            src={link.card.cardImageUrl}
            alt={name}
            width={140}
            height={88}
            className="mb-6 object-contain"
          />
        )}
        <h1 className="text-2xl font-bold text-gray-900">Du skickas vidare…</h1>
        <p className="mt-2 text-gray-600">Vi skickar dig nu vidare till {name}.</p>

        <RedirectCountdown targetUrl={link.targetUrl} seconds={seconds} />

        <a
          href={link.targetUrl}
          rel="nofollow sponsored noopener noreferrer"
          className="btn-primary mt-6 block w-full text-center"
        >
          Fortsätt direkt
        </a>

        {siteConfig.affiliateDisclosure && (
          <p className="mt-4 text-xs text-gray-400">{siteConfig.affiliateDisclosure}</p>
        )}
      </div>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'

interface Props {
  targetUrl: string
  seconds?: number
}

/**
 * Counts down then redirects to the affiliate target. Uses location.replace so
 * the interstitial doesn't end up in the browser back-history.
 */
export default function RedirectCountdown({ targetUrl, seconds = 2 }: Props) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      window.location.replace(targetUrl)
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, targetUrl])

  return (
    <p className="mt-6 text-sm text-gray-500" aria-live="polite">
      Omdirigerar om {remaining} sekund{remaining === 1 ? '' : 'er'}…
    </p>
  )
}

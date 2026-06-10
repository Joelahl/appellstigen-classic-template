import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

/**
 * Preview entry point. Called by the CMS live-preview iframe / preview button:
 *   /api/preview?secret=<PREVIEW_SECRET>&path=/kreditkort/<slug>
 * Validates the secret, enables Next draft mode, and redirects to the path so
 * the page renders unpublished (draft) content.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const path = searchParams.get('path') || '/'

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid preview token', { status: 401 })
  }
  // Only allow internal relative paths.
  if (!path.startsWith('/')) {
    return new Response('Invalid path', { status: 400 })
  }

  ;(await draftMode()).enable()
  redirect(path)
}

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

/** Disable draft mode and return to the given path (or home). */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') || '/'
  ;(await draftMode()).disable()
  redirect(path.startsWith('/') ? path : '/')
}

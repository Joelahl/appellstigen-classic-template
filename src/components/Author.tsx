import Image from 'next/image'
import type { Author } from '@/types'

function Avatar({ author, size = 40 }: { author: Author; size?: number }) {
  if (author.avatarUrl) {
    return (
      <Image
        src={author.avatarUrl}
        alt={author.name}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    )
  }
  const initials = author.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  )
}

function fmtDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Rich byline: avatar · name + role badge · "Uppdaterad" date (only shown once
 *  the page has actually been edited after publishing). Publish/update dates are
 *  always emitted as WebPage schema for SEO, regardless of what's shown. */
export function AuthorByline({
  author,
  updatedAt,
  createdAt,
}: {
  author?: Author
  updatedAt?: string
  createdAt?: string
}) {
  // Treat as "updated" only when the modification is meaningfully after publish
  // (Payload sets updatedAt == createdAt on first publish).
  const wasUpdated =
    !!updatedAt &&
    (!createdAt ||
      new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000)

  // SEO: WebPage datePublished / dateModified — emitted even if not shown.
  const dateSchema =
    createdAt || updatedAt
      ? {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          ...(createdAt && { datePublished: createdAt }),
          ...(updatedAt && { dateModified: updatedAt }),
        }
      : null

  if (!author && !wasUpdated) {
    // Nothing visible, but still emit the date schema if we have dates.
    return dateSchema ? (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dateSchema) }}
      />
    ) : null
  }

  return (
    <div className="flex items-center gap-3">
      {dateSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dateSchema) }}
        />
      )}
      {author && <Avatar author={author} size={40} />}
      <div className="text-sm">
        {author && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900">{author.name}</span>
            {author.title && (
              <span
                className="rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--brand-accent,#f59e0b)', background: 'color-mix(in srgb, var(--brand-accent,#f59e0b) 16%, white)' }}
              >
                {author.title}
              </span>
            )}
          </div>
        )}
        {wasUpdated && (
          <div className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">
            Uppdaterad{' '}
            <time dateTime={updatedAt}>{fmtDate(updatedAt)}</time>
          </div>
        )}
      </div>
    </div>
  )
}

/** Full author bio box, shown at the bottom of pages. */
export function AuthorBio({ author }: { author?: Author }) {
  if (!author) return null
  return (
    <section className="mt-12 flex gap-4 rounded-xl bg-gray-50 p-5">
      <Avatar author={author} size={64} />
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-400">Skribent</p>
        <p className="font-bold text-gray-900">{author.name}</p>
        {author.title && <p className="text-sm text-gray-500">{author.title}</p>}
        {author.bio && (
          <div
            className="prose prose-sm mt-2 max-w-none text-gray-600 prose-a:text-blue-700"
            dangerouslySetInnerHTML={{ __html: author.bio }}
          />
        )}
        {author.linkedin && (
          <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            LinkedIn →
          </a>
        )}
      </div>
    </section>
  )
}

/** Editorial team grid for the homepage. */
export function AuthorsSection({ authors }: { authors: Author[] }) {
  if (!authors?.length) return null
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Vår redaktion</h2>
      <p className="mb-6 text-gray-500">Experterna bakom våra recensioner och jämförelser.</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((a) => (
          <div key={a.id} className="flex gap-4 rounded-xl bg-white p-5 shadow-sm">
            <Avatar author={a} size={56} />
            <div>
              <p className="font-semibold text-gray-900">{a.name}</p>
              {a.title && <p className="text-sm text-blue-700">{a.title}</p>}
              {a.bio && (
                <div
                  className="prose prose-sm mt-1 line-clamp-3 max-w-none text-gray-500"
                  dangerouslySetInnerHTML={{ __html: a.bio }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

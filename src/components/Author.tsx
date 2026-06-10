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

/** Compact byline: avatar · name · title · last updated. */
export function AuthorByline({ author, updatedAt }: { author?: Author; updatedAt?: string }) {
  if (!author && !updatedAt) return null
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
      {author && (
        <span className="flex items-center gap-2">
          <Avatar author={author} size={32} />
          <span>
            Av <span className="font-medium text-gray-800">{author.name}</span>
            {author.title ? <span className="text-gray-400"> · {author.title}</span> : null}
          </span>
        </span>
      )}
      {updatedAt && (
        <span className="text-gray-400">
          Uppdaterad{' '}
          {new Date(updatedAt).toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      )}
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
        {author.bio && <p className="mt-2 text-sm text-gray-600">{author.bio}</p>}
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
              {a.bio && <p className="mt-1 text-sm text-gray-500 line-clamp-3">{a.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

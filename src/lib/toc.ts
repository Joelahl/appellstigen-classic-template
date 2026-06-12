/**
 * Extract H2 headings from content HTML for a hero quick-nav, injecting a stable
 * `id` on each <h2> so anchor links can scroll to them.
 */
export interface TocItem {
  id: string
  text: string
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&nbsp;': ' ', '&#187;': '»', '&#171;': '«', '&#8211;': '–', '&#8217;': '’',
}

function decode(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&[a-zA-Z]+;/g, (m) => ENTITIES[m] ?? m)
}

export function extractToc(html: string): { html: string; items: TocItem[] } {
  if (!html) return { html, items: [] }
  const items: TocItem[] = []
  const used = new Set<string>()

  const slugify = (raw: string): string => {
    const base =
      raw
        .toLowerCase()
        .replace(/å|ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/é/g, 'e')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'avsnitt'
    let id = base
    let i = 2
    while (used.has(id)) id = `${base}-${i++}`
    used.add(id)
    return id
  }

  const out = html.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (m, attrs: string, inner: string) => {
    const text = decode(inner.replace(/<[^>]+>/g, '')).trim()
    if (!text) return m
    const existing = /id="([^"]*)"/.exec(attrs)
    const id = existing ? existing[1] : slugify(text)
    items.push({ id, text })
    return existing ? m : `<h2${attrs} id="${id}">${inner}</h2>`
  })

  return { html: out, items }
}

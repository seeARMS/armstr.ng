import { projects } from '@/data/profile'
import { PARAGRAPH_ID } from './schema'

const hrefs = (html: string) => [...html.matchAll(/<a\s[^>]*?href="([^"]*)"/gi)].map((m) => m[1])

/**
 * Paragraph marks every link in a post `nofollow ugc`, as if a stranger had
 * written it. Colin wrote these, and many point at his own sites, so drop both
 * and keep the rest (noopener, noreferrer).
 */
export function followLinks(html: string): string {
  return html.replace(/(<a\s[^>]*?\srel=")([^"]*)(")/gi, (_, open: string, rel: string, close: string) => {
    const kept = rel.split(/\s+/).filter((r) => r && r !== 'nofollow' && r !== 'ugc')
    return `${open}${kept.join(' ')}${close}`
  })
}

/**
 * Colin's projects and Paragraph, by the @ids their own sites use, when a post
 * links to them: the BlogPosting's `mentions`.
 */
export function mentions(html: string): { '@id': string }[] | undefined {
  const ids = new Set<string>()
  for (const href of hrefs(html)) {
    let link: URL
    try {
      link = new URL(href)
    } catch {
      continue
    }
    if (projects.some((p) => new URL(p.href).hostname === link.hostname))
      ids.add(`${link.origin.replace(/^http:/, 'https:')}/#app`)
    else if (link.hostname === 'paragraph.com' && link.pathname === '/') ids.add(PARAGRAPH_ID)
  }
  return ids.size ? [...ids].map((id) => ({ '@id': id })) : undefined
}

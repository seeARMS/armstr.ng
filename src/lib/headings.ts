import { decode } from './format'

// Ids the post page already uses around the post, and "top", which the table
// of contents links to (a browser scrolls to the top for #top when nothing
// else has that id).
const TAKEN = ['top', 'content', 'subscribe', 'subscribe-title', 'keep-reading', 'site-footer']

/** "Unused Imports & Variables" → "unused-imports-variables" */
export const headingSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Gives each heading in a post's HTML an id made from its text, so a link to
 * a section works before any script runs, and search engines see the same
 * anchors every time. They're the ids the table of contents used to give the
 * headings in the browser (src/components/PageToc.astro), so links people
 * already shared still land in the right place.
 */
export function headingIds(html: string): string {
  const used = new Set([...TAKEN, ...[...html.matchAll(/\sid="([^"]*)"/g)].map((m) => m[1])])
  return html.replace(/<(h[1-6])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (match, tag: string, attrs = '', inner: string) => {
    if (/\sid=/i.test(attrs)) return match
    const text = decode(inner.replace(/<[^>]+>/g, '')).trim()
    if (!text) return match
    let id = headingSlug(text) || 'section'
    while (used.has(id)) id += '-'
    used.add(id)
    return `<${tag} id="${id}"${attrs}>${inner}</${tag}>`
  })
}

// A link icon (two chain links), drawn at 16px like the site's other icons.
const LINK_ICON =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.75 9.25a2.6 2.6 0 0 0 3.7 0l2.1-2.1a2.6 2.6 0 0 0-3.7-3.7l-.85.85M9.25 6.75a2.6 2.6 0 0 0-3.7 0l-2.1 2.1a2.6 2.6 0 0 0 3.7 3.7l.85-.85" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'

/**
 * Adds a link to each heading that has an id (run after headingIds), for
 * copying a link to that section. It sits in the margin and shows on hover
 * (global.css); the post page copies the address when it's clicked. It has no
 * text, so the heading's text, which the table of contents reads, is unchanged.
 */
export function headingLinks(html: string): string {
  return html.replace(/<(h[1-4])(\s[^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag: string, attrs: string, inner: string) => {
    const id = attrs.match(/\sid="([^"]+)"/i)?.[1]
    if (!id) return match
    return `<${tag}${attrs}>${inner}<a class="anchor" href="#${id}" aria-label="Link to this section">${LINK_ICON}</a></${tag}>`
  })
}

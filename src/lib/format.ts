import type { Appearance, Role } from '@/data/profile'

// Dates are written the same way everywhere, in the site's own time zone, so
// a post published late in the evening doesn't slip to the next day.
const TZ = 'America/Los_Angeles'

const long = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: TZ })
const medium = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: TZ })
const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: TZ })
const yearOnly = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: TZ })

// A bare day ('2026-10-02', as in src/data/posts.ts) reads as midnight UTC,
// which is still the day before in California, so it's written as is.
const longDay = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const DAY = /^\d{4}-\d{2}-\d{2}$/

/** October 15, 2024 */
export const longDate = (iso: string) => (DAY.test(iso) ? longDay : long).format(new Date(iso))
/** Oct 15, 2024 */
export const mediumDate = (iso: string) => medium.format(new Date(iso))
/** Oct 15 */
export const shortDate = (iso: string) => short.format(new Date(iso))
/** 2024 */
export const year = (iso: string) => yearOnly.format(new Date(iso))

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** 2024-05 → May 2024 (a podcast or article's month, with no time zone to mind) */
export function monthYear(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

/** "Since 2022" for the job that's still going, else "2017–2022". */
export const tenure = (role: Role) => (role.to ? `${role.from}–${role.to}` : `Since ${role.from}`)

/** Where a role sits on Projects & Work: Paragraph → /projects#paragraph. */
export const anchor = (company: string) => company.toLowerCase().replace(/[^a-z0-9]+/g, '-')

/** Where an appearance ran, said the way you'd say it: "On Into the Bytecode". */
export const venue = (a: Appearance) =>
  a.kind === 'Podcast' ? `On ${a.outlet}` : a.kind === 'Interview' ? `Interviewed by ${a.outlet}` : `In ${a.outlet}`

/** Minutes to read, at an unhurried 230 words a minute. */
export function readingTime(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 230))
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
/** Decodes the HTML entities in a piece of text: &amp; → &. */
export const decode = (text: string) =>
  text.replace(/&(#x?[0-9a-f]+|\w+);/gi, (match, entity: string) => {
    if (!entity.startsWith('#')) return ENTITIES[entity] ?? match
    const code = entity[1] === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10)
    return Number.isNaN(code) ? match : String.fromCodePoint(code)
  })

/**
 * A search-result description for a post: its subtitle, then its opening
 * sentences, up to about 155 characters, ending on a sentence where it can.
 */
export function postDescription(title: string, subtitle: string | undefined, html: string): string {
  const LIMIT = 158
  const inner = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1])
  // Skip opening asides set in italics (like an old "written with Paragraph"
  // plug); the description should start with the post itself.
  const text = (p: string) =>
    p
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  const italics = (p: string) => [...p.matchAll(/<em>([\s\S]*?)<\/em>/g)].map((m) => text(m[1])).join(' ')
  const aside = (p: string) => text(p).length > 0 && italics(p).length >= text(p).length * 0.85
  while (inner.length && aside(inner[0])) inner.shift()
  const paragraphs = inner
    .map((p) =>
      decode(p.replace(/<[^>]+>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
  const sentences = paragraphs.join(' ').split(/(?<=[.!?])\s+/)

  let out = subtitle?.trim() ?? ''
  if (out && !/[.!?]$/.test(out)) out += '.'
  let i = 0
  for (; i < sentences.length; i++) {
    const next = out ? `${out} ${sentences[i]}` : sentences[i]
    if (next.length > LIMIT) break
    out = next
  }
  // Still short (one long opening sentence): cut the rest at a word.
  if (out.length < 90 && i < sentences.length) {
    const room = LIMIT - (out ? out.length + 1 : 0) - 1
    const cut = sentences
      .slice(i)
      .join(' ')
      .slice(0, room)
      .replace(/\s+\S*$/, '')
      .replace(/[,;:]$/, '')
    if (cut) out = `${out ? `${out} ` : ''}${cut}…`
  }
  return out || `${title}, by Colin Armstrong.`
}

/**
 * The line over a subscribe field. It counts the readers, rounded down to the
 * hundred so it never claims more than there are (921 → "900+"), and leaves
 * the number out below a hundred or when Paragraph couldn't say.
 */
export function subscribeNote(subscribers: number | undefined) {
  if (!subscribers || subscribers < 100) return 'Get new posts delivered to your inbox.'
  const floor = Math.floor(subscribers / 100) * 100
  return `Join ${floor.toLocaleString('en-US')}+ readers and get new posts delivered to your inbox.`
}

// Social preview images (1200×630) for the home page, the writing index and
// every post. Each is deep navy, set in Geist (the way heade.rs sets its share
// cards): the domain at the top, and the illustrated portrait in a navy ring
// beside a big cream title with a line of misty blue under it. The share
// video (generate-og-video.mjs) uses the same card. Colours come from the
// portrait. Runs before each build (`npm run build`).
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { siteSlug } from '../src/lib/slug.js'

const API_BASE = 'https://public.api.paragraph.com/api/v1'
const PUB_ID = '3eJHzLXKQHclhCdsO4Yr'
const ROOT = join(import.meta.dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'og')

export const W = 1200
export const H = 630
export const PAD = 76
// The portrait, its ring, and the gap between them and the type.
const AVATAR = 196
const RING = 8
const GAP = 40
const TEXT_WIDTH = W - PAD * 2 - AVATAR - RING * 2 - GAP

// The portrait's own colours.
export const DEEP = '#0c1729'
export const NAVY = '#12213c'
export const SLATE_MIST = '#c9d3df'
export const CREAM = '#f3ebdd'

// Geist Regular and SemiBold, the same files heade.rs uses (OFL, see scripts/fonts/OFL.txt).
const font = (name) => readFileSync(join(import.meta.dirname, 'fonts', `${name}.ttf`))
export const FONTS = [
  { name: 'Geist', data: font('Geist-Regular'), weight: 400, style: 'normal' },
  { name: 'Geist', data: font('Geist-SemiBold'), weight: 600, style: 'normal' },
]

async function fetchPosts() {
  const res = await fetch(`${API_BASE}/publications/${PUB_ID}/posts?limit=50`)
  const { items } = await res.json()
  return items.map((post) => ({
    title: post.title,
    slug: siteSlug(post.slug),
    date: new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/Los_Angeles',
    }).format(new Date(Number(post.publishedAt))),
  }))
}

// --- Pictures ------------------------------------------------------------

/** Part of an image (in its own pixels), resized to width × height, as a data URI. */
export async function picture(file, region, width, height) {
  const jpeg = await sharp(join(ROOT, 'src', 'assets', file))
    .extract(region)
    .resize(width, height, { fit: 'fill' })
    .jpeg({ quality: 90 })
    .toBuffer()
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`
}

// --- Markup --------------------------------------------------------------

// A tiny JSX stand-in: one child is passed as itself, several as an array.
export const h = (type, style, ...children) => {
  const kids = children.flat().filter((c) => c !== null)
  return { type, props: { style, children: kids.length === 1 ? kids[0] : kids } }
}
export const img = (src, width, height, style = {}) => ({ type: 'img', props: { src, width, height, style } })

// Like heade.rs's name: SemiBold, tracked in a little. The suffix keeps the site's quieter tone.
export const wordmark = (size) =>
  h(
    'div',
    { display: 'flex', fontSize: size, fontWeight: 600, letterSpacing: -size * 0.02, color: CREAM },
    'armstr',
    h('span', { color: SLATE_MIST }, '.ng'),
  )

// Satori can't measure text for us, so lines are counted by word-wrapping at an
// average Geist character width of half the font size (a little generous).
function lineCount(text, size) {
  const perLine = Math.floor(TEXT_WIDTH / (size * 0.5))
  let lines = 1
  let used = 0
  for (const word of text.split(/\s+/)) {
    if (used && used + 1 + word.length > perLine) {
      lines++
      used = word.length
    } else used += (used ? 1 : 0) + word.length
  }
  return lines
}

// The room for the title, below the wordmark and above the line under it.
const TITLE_ROOM = 340

/** The biggest size, up to the name's, at which a title fits in three lines. */
function titleSize(title) {
  const sizes = [104, 88, 76, 64, 56, 48]
  return (
    sizes.find((size) => {
      const lines = lineCount(title, size)
      return lines <= 3 && lines * size * 1.05 <= TITLE_ROOM
    }) ?? sizes.at(-1)
  )
}

/** A title in cream, tracked in as the name is. */
export const title = (text, size = titleSize(text)) =>
  h(
    'div',
    { display: 'flex', fontSize: size, fontWeight: 600, letterSpacing: -size * 0.035, lineHeight: 1.05, color: CREAM },
    text,
  )

/** The misty blue line under a title. */
const below = (text, size) =>
  h(
    'div',
    {
      display: 'flex',
      // Narrower than the title, so a sentence breaks into even lines.
      maxWidth: TEXT_WIDTH * 0.8,
      marginTop: size * 0.3,
      fontSize: size,
      fontWeight: 600,
      letterSpacing: -size * 0.02,
      lineHeight: 1.25,
      color: SLATE_MIST,
      opacity: 0.72,
    },
    text,
  )

/**
 * The card: the domain at the top, and the portrait in its ring beside
 * `lines`, the two centred on each other in the space below.
 */
export const card = (portrait, ...lines) =>
  h(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      padding: `24px ${PAD}px 0`,
      backgroundColor: DEEP,
      fontFamily: 'Geist',
    },
    h('div', { display: 'flex', position: 'absolute', left: PAD, top: 64 }, wordmark(30)),
    h(
      'div',
      { display: 'flex', alignItems: 'center', gap: GAP },
      h(
        'div',
        {
          display: 'flex',
          flexShrink: 0,
          width: AVATAR + RING * 2,
          height: AVATAR + RING * 2,
          padding: RING,
          borderRadius: AVATAR,
          backgroundColor: NAVY,
        },
        img(portrait, AVATAR, AVATAR, { borderRadius: AVATAR }),
      ),
      h('div', { display: 'flex', flexDirection: 'column', width: TEXT_WIDTH }, ...lines),
    ),
  )

/** The portrait, at twice the size it shows. */
export const portrait = () =>
  picture('colin.jpg', { left: 0, top: 0, width: 1254, height: 1254 }, AVATAR * 2, AVATAR * 2)

const homeMarkup = (face) => card(face, title('Colin Armstrong', 104), below('Founder & CEO of Paragraph', 46))

// Posts give their date under the title; the writing index says what's in it.
const pageMarkup = (face, { title: text, date, about }) => card(face, title(text), below(date || about, 36))

async function render(markup) {
  const svg = await satori(markup, { width: W, height: H, fonts: FONTS })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng()
  return sharp(png).jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer()
}

async function main() {
  console.log('Generating OG images...')

  const [face, posts] = await Promise.all([portrait(), fetchPosts()])

  // Start clean, so a renamed post doesn't leave its old card behind.
  rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })

  const pages = [
    { slug: 'home', markup: homeMarkup(face) },
    {
      slug: 'writing',
      markup: pageMarkup(face, { title: 'Writing', about: 'Thoughts on startups, product, engineering, and more.' }),
    },
    ...posts.map((post) => ({ slug: post.slug, markup: pageMarkup(face, post) })),
  ]

  for (const { slug, markup } of pages) {
    writeFileSync(join(OUT_DIR, `${slug}.jpg`), await render(markup))
    console.log(`  ${slug}.jpg`)
  }

  console.log(`Generated ${pages.length} OG images`)
}

// The share video (scripts/generate-og-video.mjs) borrows the pieces above.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

// Social preview images (1200×630) for the home page, the writing index and
// every post. Each is deep navy, set in Geist (the way heade.rs sets its share
// cards), with the illustrated portrait as a large circle on the right, inside
// a navy ring. Colours come from the portrait. Runs before each build
// (`npm run build`).
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { siteSlug } from '../src/lib/slug.js'

const API_BASE = 'https://public.api.paragraph.com/api/v1'
const PUB_ID = '3eJHzLXKQHclhCdsO4Yr'
const ROOT = join(import.meta.dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'og')

const W = 1200
const H = 630
// The portrait sits in a ring centred on the right edge of the card's middle;
// the type takes the left.
const RING = { x: 1040, y: 330, r: 330 }
const PORTRAIT = 560
const PAD = 76
const TEXT_WIDTH = 700 - PAD

// The portrait's own colours.
const DEEP = '#0c1729'
const NAVY = '#12213c'
const SLATE_MIST = '#c9d3df'
const CREAM = '#f3ebdd'

// Geist Regular and SemiBold, the same files heade.rs uses (OFL, see scripts/fonts/OFL.txt).
const font = (name) => readFileSync(join(import.meta.dirname, 'fonts', `${name}.ttf`))
const FONTS = [
  { name: 'Geist', data: font('Geist-Regular'), weight: 400, style: 'normal' },
  { name: 'Geist', data: font('Geist-SemiBold'), weight: 600, style: 'normal' },
]

async function fetchPosts() {
  const res = await fetch(`${API_BASE}/publications/${PUB_ID}/posts?limit=50`)
  const { items } = await res.json()
  return items.map((post) => ({
    title: post.title,
    subtitle: post.subtitle || '',
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
async function picture(file, region, width, height) {
  const jpeg = await sharp(join(ROOT, 'src', 'assets', file))
    .extract(region)
    .resize(width, height, { fit: 'fill' })
    .jpeg({ quality: 90 })
    .toBuffer()
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`
}

/** Everything under the type: the deep navy card and the ring around the portrait. */
function background() {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="${DEEP}"/>` +
    `<circle cx="${RING.x}" cy="${RING.y}" r="${RING.r}" fill="${NAVY}"/>` +
    `</svg>`
  return `data:image/png;base64,${new Resvg(svg).render().asPng().toString('base64')}`
}

// --- Markup --------------------------------------------------------------

// A tiny JSX stand-in: one child is passed as itself, several as an array.
const h = (type, style, ...children) => {
  const kids = children.flat().filter((c) => c !== null)
  return { type, props: { style, children: kids.length === 1 ? kids[0] : kids } }
}
const img = (src, width, height, style = {}) => ({ type: 'img', props: { src, width, height, style } })

// Like heade.rs's name: SemiBold, tracked in a little. The suffix keeps the site's quieter tone.
const wordmark = (size) =>
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

// The room left for the title and subtitle once the wordmark, the Read button
// and a gap above the button are placed.
const TEXT_ROOM = H - 64 - 36 - 56 - 68 - 64 - 32

/**
 * Titles get smaller as they get longer, and smaller again if the subtitle
 * would push them into the Read button.
 */
function titleStyle(title, subtitle) {
  const n = title.length
  const sizes = [72, 62, 54, 48, 42]
  let i = n <= 28 ? 0 : n <= 44 ? 1 : n <= 60 ? 2 : n <= 84 ? 3 : 4
  const sub = subtitle ? 22 + lineCount(subtitle, 28) * 28 * 1.4 : 0
  while (i < sizes.length - 1 && lineCount(title, sizes[i]) * sizes[i] * 1.05 + sub > TEXT_ROOM) i++
  const size = sizes[i]
  return { fontSize: size, fontWeight: 600, letterSpacing: -size * 0.04, lineHeight: 1.05, color: CREAM }
}

// A cream "Read" pill with a drawn arrow, so the arrow sits centred beside the
// word whatever the font does.
const ARROW =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="${NAVY}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10h13M11 4.5l5.5 5.5-5.5 5.5"/></svg>`,
  ).toString('base64')
const readButton = () =>
  h(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      height: 68,
      padding: '0 36px',
      borderRadius: 68,
      backgroundColor: CREAM,
      color: NAVY,
      fontSize: 29,
      fontWeight: 600,
      letterSpacing: -0.3,
    },
    'Read',
    img(ARROW, 24, 24),
  )

/** The card: its background and portrait, with the type down the left. */
const card = (bg, portrait, top, bottom) =>
  h(
    'div',
    { display: 'flex', width: '100%', height: '100%', fontFamily: 'Geist' },
    img(bg, W, H, { position: 'absolute', left: 0, top: 0 }),
    img(portrait, PORTRAIT, PORTRAIT, {
      position: 'absolute',
      left: RING.x - PORTRAIT / 2,
      top: RING.y - PORTRAIT / 2,
      borderRadius: PORTRAIT,
    }),
    h(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: 700,
        height: '100%',
        padding: `64px 0 64px ${PAD}px`,
      },
      h('div', { display: 'flex', flexDirection: 'column' }, wordmark(30), ...top),
      h('div', { display: 'flex', alignItems: 'center', gap: 28, minHeight: 68 }, ...bottom),
    ),
  )

const note = (text) => h('div', { display: 'flex', fontSize: 23, color: SLATE_MIST, opacity: 0.8 }, text)

function homeMarkup(bg, portrait) {
  return card(
    bg,
    portrait,
    [
      h(
        'div',
        { marginTop: 56, fontSize: 84, fontWeight: 600, letterSpacing: -3.4, lineHeight: 1, color: CREAM },
        'Colin Armstrong',
      ),
      h(
        'div',
        { marginTop: 26, width: 520, fontSize: 30, lineHeight: 1.4, color: SLATE_MIST },
        'Founder & CEO of Paragraph. Previously Google and Coinbase.',
      ),
    ],
    [note('Writing, projects and photography')],
  )
}

function pageMarkup(bg, portrait, { title, subtitle, date }) {
  return card(
    bg,
    portrait,
    [
      h('div', { marginTop: 56, ...titleStyle(title, subtitle) }, title),
      subtitle ? h('div', { marginTop: 22, fontSize: 28, lineHeight: 1.4, color: SLATE_MIST }, subtitle) : null,
    ],
    // Posts give their date; the writing index, which has none, gives its address.
    [readButton(), note(date || 'armstr.ng/writing')],
  )
}

async function render(markup) {
  const svg = await satori(markup, { width: W, height: H, fonts: FONTS })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng()
  return sharp(png).jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer()
}

async function main() {
  console.log('Generating OG images...')

  const [portrait, posts] = await Promise.all([
    picture('colin.jpg', { left: 0, top: 0, width: 1254, height: 1254 }, PORTRAIT, PORTRAIT),
    fetchPosts(),
  ])
  const bg = background()

  // Start clean, so a renamed post doesn't leave its old card behind.
  rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })

  const pages = [
    { slug: 'home', markup: homeMarkup(bg, portrait) },
    {
      slug: 'writing',
      markup: pageMarkup(bg, portrait, {
        title: 'Writing',
        subtitle: 'Thoughts on startups, product, engineering, and more.',
      }),
    },
    ...posts.map((post) => ({ slug: post.slug, markup: pageMarkup(bg, portrait, post) })),
  ]

  for (const { slug, markup } of pages) {
    writeFileSync(join(OUT_DIR, `${slug}.jpg`), await render(markup))
    console.log(`  ${slug}.jpg`)
  }

  console.log(`Generated ${pages.length} OG images`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

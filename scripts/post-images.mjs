// The real size of every image in the posts, plus a tiny blurred preview of
// it, read when the site builds. Pages are prerendered inside workerd, which
// can't run sharp, so this Vite plugin does the work in Node and hands the
// result to the page as `virtual:post-images`: a map from image URL (as it
// appears in the post's HTML) to its size and preview.
import sharp from 'sharp'
import { getColinArticlesWithContent } from '../src/lib/getAllArticles.js'

const ID = 'virtual:post-images'
const RESOLVED = `\0${ID}`

// A preview this small is a few hundred bytes; the page blurs it back up.
const PREVIEW = 16

// A PNG that's at most this many times bigger kept lossless than as WebP is
// flat graphics (a screenshot, a diagram), where lossy WebP smudges small text
// and flat colour. Screenshots in the posts come out 4–10×; a PNG that's really
// a picture (an AI illustration) came out 17×, and stays WebP.
const LOSSLESS_LIMIT = 12

// Whether the image should be served lossless, judged on a copy the width of
// the post column.
async function isFlat(data) {
  const column = sharp(data).rotate().resize(680, null, { withoutEnlargement: true })
  const [png, webp] = await Promise.all([column.clone().png().toBuffer(), column.clone().webp({ quality: 80 }).toBuffer()])
  return png.length <= webp.length * LOSSLESS_LIMIT
}

const sources = (html) => [...html.matchAll(/<img\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1])

async function describe(src) {
  const res = await fetch(src.replaceAll('&amp;', '&'))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = Buffer.from(await res.arrayBuffer())
  const meta = await sharp(data).metadata()
  // Orientations 5–8 are rotated a quarter turn, so width and height swap.
  const turned = (meta.orientation ?? 1) >= 5
  const width = turned ? (meta.pageHeight ?? meta.height) : meta.width
  const height = turned ? meta.width : (meta.pageHeight ?? meta.height)
  const { data: tiny, info } = await sharp(data)
    .rotate()
    .resize(PREVIEW, PREVIEW, { fit: 'inside' })
    .webp({ quality: 60 })
    .toBuffer({ resolveWithObject: true })
  return {
    width,
    height,
    lossless: meta.format === 'png' && (await isFlat(data)),
    preview: { src: `data:image/webp;base64,${tiny.toString('base64')}`, width: info.width, height: info.height },
  }
}

async function read() {
  const posts = await getColinArticlesWithContent()
  const urls = [...new Set(posts.flatMap((post) => sources(post.html ?? '')))]
  const entries = await Promise.all(
    urls.map(async (src) => {
      try {
        return [src, await describe(src)]
      } catch (e) {
        // The page still shows the image, just without a size or preview.
        console.warn(`post-images: couldn't read ${src} (${e.message})`)
        return [src, null]
      }
    }),
  )
  return Object.fromEntries(entries.filter(([, info]) => info))
}

export default function postImages() {
  let cache
  return {
    name: 'post-images',
    resolveId(id) {
      if (id === ID) return RESOLVED
    },
    async load(id) {
      if (id !== RESOLVED) return
      cache ??= read()
      return `export default ${JSON.stringify(await cache)}`
    },
  }
}

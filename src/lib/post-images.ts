// Images in posts, served the way the rest of the site's images are: Paragraph's
// originals resized for the post column at a few widths, with their
// real dimensions so the text doesn't jump as they load, loaded only as they
// near the screen, and a blurred preview holding their place until they
// arrive. Sizes and previews are read in Node at build time
// (scripts/post-images.mjs); the resized copies are made by Astro's image
// pipeline.
import { getImage } from 'astro:assets'
import images from 'virtual:post-images'

// The column is 680px wide; 2040px covers it on a 3x screen, and leaves detail
// for zooming in on a 2x one.
const WIDTHS = [480, 680, 1024, 1360, 2040]
const SIZES = '(max-width: 727px) calc(100vw - 32px), 680px'

const ATTRIBUTE = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g

function attributes(tag: string) {
  const inside = tag.replace(/^<img\b/i, '').replace(/\/?>$/, '')
  const found: Record<string, string> = {}
  for (const m of inside.matchAll(ATTRIBUTE)) found[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? ''
  return found
}

const escape = (value: string | number) =>
  String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

const tag = (attrs: Record<string, string | number | undefined>) =>
  `<img ${Object.entries(attrs)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => (value === '' ? name : `${name}="${escape(value!)}"`))
    .join(' ')}>`

// The tiny preview, blurred inside an SVG so it scales up smooth rather than
// blocky (the same recipe Next.js uses). The alpha step keeps the blur from
// fading out at the edges.
function blurred(preview: { src: string; width: number; height: number }) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${preview.width * 40} ${preview.height * 40}'>` +
    `<filter id='b' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='20'/>` +
    `<feComponentTransfer><feFuncA type='discrete' tableValues='1 1'/></feComponentTransfer></filter>` +
    `<image width='100%' height='100%' preserveAspectRatio='none' filter='url(#b)' href='${preview.src}'/></svg>`
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`
}

export async function optimizeImages(html: string): Promise<string> {
  let out = html
  for (const original of new Set(html.match(/<img\b[^>]*>/gi) ?? [])) {
    const attrs = attributes(original)
    const info = attrs.src ? images[attrs.src] : undefined
    const kept = { alt: attrs.alt ?? '', class: attrs.class || undefined }

    // Nothing known about it (it failed to download at build time): still lazy.
    if (!info) {
      out = out.replaceAll(original, tag({ src: attrs.src, ...kept, loading: 'lazy', decoding: 'async' }))
      continue
    }

    // Never larger than the original: a small screenshot stays its own size.
    const width = Math.min(info.width, WIDTHS.at(-1)!)
    const height = Math.round((info.height * width) / info.width)
    const image = await getImage({
      src: attrs.src.replaceAll('&amp;', '&'),
      width,
      height,
      widths: [...WIDTHS.filter((w) => w < width), width],
      // Screenshots stay lossless (see scripts/post-images.mjs). Lossless WebP
      // would be smaller than PNG, but Astro can only turn that on for every
      // image on the site, photos included.
      ...(info.lossless ? { format: 'png' } : { format: 'webp', quality: 80 }),
    })

    out = out.replaceAll(
      original,
      tag({
        src: image.src,
        srcset: image.srcSet.attribute,
        sizes: SIZES,
        width,
        height,
        ...kept,
        loading: 'lazy',
        decoding: 'async',
        style: `background-image:${blurred(info.preview)}`,
        'data-blur': '',
      }),
    )
  }
  return out
}

// Camera settings for every photo, read from its EXIF when the site builds.
// Pages are prerendered inside workerd, which can't read the project's files,
// so this Vite plugin reads them in Node and hands the result to the page as
// `virtual:photo-meta`: a map from file name (no extension) to its settings.
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import exifr from 'exifr'
import sharp from 'sharp'

const ID = 'virtual:photo-meta'
const RESOLVED = `\0${ID}`
const DIR = fileURLToPath(new URL('../src/assets/photos/', import.meta.url))
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const TAGS = ['Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO', 'DateTimeOriginal']

// "RF100-500mm F4.5-7.1 L IS USM" reads as "RF100-500mm".
const shortLens = (lens) => lens?.match(/^\S*\d+(?:-\d+)?mm/)?.[0] ?? lens

function shutter(seconds) {
  if (!seconds) return undefined
  if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`
  return `1/${Math.round(1 / seconds)}s`
}

// EXIF dates carry no time zone; keep the calendar date the camera wrote.
function day(raw) {
  const m = typeof raw === 'string' && raw.match(/^(\d{4}):(\d{2}):(\d{2})/)
  return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : undefined
}

// A photo's overall hue and how colorful it is, in OKLCH, from its average
// color. The lightbox tints its backdrop with these, at a lightness of its
// own for each theme, so a jungle shot glows faintly green and the Milky Way
// faintly violet.
async function tint(buffer) {
  const [r, g, b] = await sharp(buffer).resize(1, 1).removeAlpha().raw().toBuffer()
  const lin = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const [R, G, B] = [lin(r), lin(g), lin(b)]
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const hue = ((Math.atan2(Bb, A) * 180) / Math.PI + 360) % 360
  return { hue: Math.round(hue), chroma: Number(Math.hypot(A, Bb).toFixed(3)) }
}

async function read() {
  const files = (await readdir(DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  const entries = await Promise.all(
    files.map(async (file) => {
      const name = file.replace(/\.[^.]+$/, '')
      try {
        const buffer = await readFile(DIR + file)
        const x = (await exifr.parse(buffer, { pick: TAGS, reviveValues: false })) ?? {}
        return [
          name,
          {
            camera: x.Model?.trim(),
            lens: shortLens(x.LensModel?.trim()),
            lensFull: x.LensModel?.trim(),
            focal: x.FocalLength ? `${Math.round(x.FocalLength)}mm` : undefined,
            aperture: x.FNumber ? `f/${Number(x.FNumber.toFixed(1))}` : undefined,
            shutter: shutter(x.ExposureTime),
            iso: x.ISO ? `ISO ${x.ISO}` : undefined,
            date: day(x.DateTimeOriginal),
            // An exposure of a second or more: the night sky.
            night: x.ExposureTime >= 1 || undefined,
            tint: await tint(buffer),
          },
        ]
      } catch {
        return [name, {}]
      }
    }),
  )
  return Object.fromEntries(entries)
}

export default function photoMeta() {
  return {
    name: 'photo-meta',
    resolveId(id) {
      if (id === ID) return RESOLVED
    },
    async load(id) {
      if (id !== RESOLVED) return
      return `export default ${JSON.stringify(await read())}`
    },
  }
}

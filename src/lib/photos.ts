// Every photo on the Photography pages, in file-name order, with its caption,
// collection and place (src/data/photos.ts), its camera settings (from EXIF,
// see scripts/photo-meta.mjs), its overall color, and a large copy for the
// lightbox. The pages and their Markdown versions all read this.
import { getImage } from 'astro:assets'
import meta from 'virtual:photo-meta'
import { collections, nightSky, photos as info, places, type Collection, type PlaceSlug } from '@/data/photos'

const modules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/*.{jpg,jpeg,png,webp}', {
  eager: true,
})

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export type Place = { slug: PlaceSlug; name: string; region: string; label: string; lat: number; lon: number }

function place(slug: PlaceSlug): Place {
  const { name, region, lat, lon } = places[slug]
  return { slug, name, region, label: `${name}, ${region}`, lat, lon }
}

export async function getPhotos() {
  return Promise.all(
    Object.entries(modules)
      .map(([path, mod]) => ({
        name: path.replace(/.*\//, '').replace(/\.[^.]+$/, ''),
        image: mod.default,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async ({ name, image }) => {
        // The lightbox gets its own large copy, so photos stay sharp on big screens.
        const full = await getImage({ src: image, width: Math.min(2400, image.width), format: 'webp', quality: 82 })
        const m = meta[name] ?? {}
        const about = info[name]
        return {
          name,
          image,
          full: full.src,
          caption: about?.caption,
          collection: about?.collection,
          place: about ? place(about.place) : undefined,
          date: m.date,
          taken: m.taken,
          tint: m.tint,
          night: Boolean(m.night) || nightSky.has(name),
          chips: [m.camera, m.lens, m.focal, m.aperture, m.shutter, m.iso].filter(Boolean) as string[],
        }
      }),
  )
}

export type Photo = Awaited<ReturnType<typeof getPhotos>>[number]

/** The collections, in tab order. */
export const collectionKeys = Object.keys(collections) as Collection[]

/** How many photos each Photography tab shows. */
export function tabCounts(photos: Photo[]) {
  const counts: Record<string, number> = { all: photos.length }
  for (const p of photos) if (p.collection) counts[p.collection] = (counts[p.collection] ?? 0) + 1
  return counts
}

/** "Feb 2023", "2023" or "2021–2025": when a set of photos was taken. */
function span(dates: string[]) {
  if (!dates.length) return undefined
  const first = dates[0]
  const last = dates[dates.length - 1]
  if (first.slice(0, 7) === last.slice(0, 7)) return `${MONTHS[Number(first.slice(5, 7)) - 1]} ${first.slice(0, 4)}`
  return first.slice(0, 4) === last.slice(0, 4) ? first.slice(0, 4) : `${first.slice(0, 4)}–${last.slice(0, 4)}`
}

/** Each place with its photos (its cover first), the most recently visited first. */
export function byPlace(photos: Photo[]) {
  const groups = new Map<PlaceSlug, Photo[]>()
  for (const p of photos) if (p.place) groups.set(p.place.slug, [...(groups.get(p.place.slug) ?? []), p])
  return [...groups]
    .map(([slug, list]) => {
      const sorted = [...list].sort((a, b) => (b.taken ?? '').localeCompare(a.taken ?? ''))
      const cover = sorted.find((p) => p.name === (places[slug] as { cover?: string }).cover) ?? sorted[0]
      const dates = sorted.map((p) => p.taken).filter((d): d is string => Boolean(d))
      // The cover leads the place's photos, then the rest, newest first.
      const ordered = [cover, ...sorted.filter((p) => p !== cover)]
      return { ...place(slug), photos: ordered, cover, latest: dates[0] ?? '', when: span([...dates].reverse()) }
    })
    .sort((a, b) => b.latest.localeCompare(a.latest))
}

/** The camera most of the photos were taken with: "mostly on a Canon EOS R5". */
export function mainCamera(photos: { chips: string[] }[]): string | undefined {
  const counts = new Map<string, number>()
  for (const p of photos) if (p.chips[0]) counts.set(p.chips[0], (counts.get(p.chips[0]) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0]
}

/** One photo as a Markdown list item: the image, then what, when, where and how. */
export function photoMarkdown(photo: Photo, abs: (path: string) => string) {
  const about = [photo.caption, photo.date, photo.place?.label, photo.chips.join(', ')].filter(Boolean).join(' · ')
  return `- ![${photo.caption ?? ''}](${abs(photo.full)})${about ? `\n  ${about}` : ''}`
}

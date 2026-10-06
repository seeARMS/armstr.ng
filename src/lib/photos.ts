// Every photo on the Photography page, in file-name order, with its caption,
// its camera settings (from EXIF, see scripts/photo-meta.mjs), its overall
// color, and a large copy for the lightbox. The page and its Markdown version both read this.
import { getImage } from 'astro:assets'
import meta from 'virtual:photo-meta'
import { captions, nightSky } from '@/data/photos'

const modules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/*.{jpg,jpeg,png,webp}', {
  eager: true,
})

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
        return {
          name,
          image,
          full: full.src,
          caption: captions[name],
          date: m.date,
          tint: m.tint,
          night: Boolean(m.night) || nightSky.has(name),
          chips: [m.camera, m.lens, m.focal, m.aperture, m.shutter, m.iso].filter(Boolean) as string[],
        }
      }),
  )
}

/** The camera most of the photos were taken with: "mostly on a Canon EOS R5". */
export function mainCamera(photos: { chips: string[] }[]): string | undefined {
  const counts = new Map<string, number>()
  for (const p of photos) if (p.chips[0]) counts.set(p.chips[0], (counts.get(p.chips[0]) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0]
}

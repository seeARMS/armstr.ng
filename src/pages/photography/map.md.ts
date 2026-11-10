// The photography map as Markdown, for agents (see src/worker.ts): every
// place, where it is, and the photos taken there. Its copy repeats
// map.astro's; change both.
import type { APIRoute } from 'astro'
import { person } from '@/data/profile'
import { abs, frontMatter, link, markdown } from '@/lib/markdown'
import { byPlace, getPhotos, photoMarkdown } from '@/lib/photos'

export const prerender = true

export const GET: APIRoute = async () => {
  const places = byPlace(await getPhotos())

  return markdown(
    frontMatter({
      title: `Photography map – ${person.name}`,
      description:
        "Where Colin Armstrong's photographs were taken, on a 3D globe: Panama's rainforest, Patagonia, Meteora and Santorini, Yosemite, Big Sur and the Bay Area, Ontario, Maui and more.",
      url: abs('/photography/map'),
    }),
    '# Where the photos were taken',
    `Where each of ${link(`${person.name}'s photos`, abs('/photography.md'))} was taken. His camera doesn't record location, so most of these come from the photos his phone took around the same time. Coordinates are rounded to the town, park or valley. The places are listed with the most recently visited first.`,
    ...places.map((place) =>
      [
        `## ${place.label}`,
        `${place.when} · ${place.photos.length} ${place.photos.length === 1 ? 'photo' : 'photos'} · ${place.lat.toFixed(2)}, ${place.lon.toFixed(2)}`,
        place.photos.map((photo) => photoMarkdown(photo, abs)).join('\n'),
      ].join('\n\n'),
    ),
    `All photos © ${person.name}, all rights reserved. To use one, email ${link(person.email, `mailto:${person.email}`)}.`,
  )
}

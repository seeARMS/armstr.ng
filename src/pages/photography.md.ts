// Photography as Markdown, for agents (see src/worker.ts): every photo with
// its caption, where and how it was taken. Its copy repeats
// photography.astro's; change both.
import type { APIRoute } from 'astro'
import { collections } from '@/data/photos'
import { person } from '@/data/profile'
import { abs, frontMatter, link, markdown } from '@/lib/markdown'
import { collectionKeys, getPhotos, mainCamera, photoMarkdown, tabCounts } from '@/lib/photos'

export const prerender = true

export const GET: APIRoute = async () => {
  const photos = await getPhotos()
  const camera = mainCamera(photos)
  const counts = tabCounts(photos)

  return markdown(
    frontMatter({
      title: 'Wildlife, landscape & astrophotography – Colin Armstrong',
      description:
        'Photographs by Colin Armstrong: moose, birds, bobcats and howler monkeys, the Milky Way, Patagonia, Yosemite, Santorini and Big Sur, mostly shot on a Canon EOS R5.',
      url: abs('/photography'),
    }),
    '# Photography',
    `Wildlife, landscape, and astrophotography${camera ? `, mostly on a ${camera}` : ''}. Each photo below is followed by what it shows, and when, where and how it was taken.`,
    `By collection: ${collectionKeys.map((key) => `${link(collections[key].name, abs(`/photography/${key}.md`))} (${counts[key] ?? 0})`).join(', ')}. The ${link('map', abs('/photography/map.md'))} lists every place.`,
    photos.map((photo) => photoMarkdown(photo, abs)).join('\n'),
    `All photos © ${person.name}, all rights reserved. To use one, email ${link(person.email, `mailto:${person.email}`)}.`,
  )
}

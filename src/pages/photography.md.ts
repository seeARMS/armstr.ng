// Photography as Markdown, for agents (see src/worker.ts): every photo with
// its caption and how it was taken. Its copy repeats photography.astro's;
// change both.
import type { APIRoute } from 'astro'
import { person } from '@/data/profile'
import { abs, frontMatter, link, markdown } from '@/lib/markdown'
import { getPhotos, mainCamera } from '@/lib/photos'

export const prerender = true

export const GET: APIRoute = async () => {
  const photos = await getPhotos()
  const camera = mainCamera(photos)

  return markdown(
    frontMatter({
      title: 'Wildlife, landscape & astrophotography – Colin Armstrong',
      description:
        'Photographs by Colin Armstrong: birds, bobcats and howler monkeys, the Milky Way, Patagonia, Yosemite, Santorini and Big Sur, mostly shot on a Canon EOS R5.',
      url: abs('/photography'),
    }),
    '# Photography',
    `Wildlife, landscape, and astrophotography${camera ? `, mostly on a ${camera}` : ''}. Each photo below is followed by what it shows and how it was taken.`,
    photos
      .map((photo) => {
        const about = [photo.caption, photo.date, photo.chips.join(', ')].filter(Boolean).join(' · ')
        return `- ![${photo.caption ?? ''}](${abs(photo.full)})${about ? `\n  ${about}` : ''}`
      })
      .join('\n'),
    `All photos © ${person.name}, all rights reserved. To use one, email ${link(person.email, `mailto:${person.email}`)}.`,
  )
}

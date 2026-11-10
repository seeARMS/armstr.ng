// One photography collection as Markdown, for agents (see src/worker.ts).
// Its copy comes from src/data/photos.ts, as [collection].astro's does.
import type { APIRoute, GetStaticPaths } from 'astro'
import { collections, type Collection } from '@/data/photos'
import { person } from '@/data/profile'
import { abs, frontMatter, link, markdown } from '@/lib/markdown'
import { collectionKeys, getPhotos, photoMarkdown } from '@/lib/photos'

export const prerender = true

export const getStaticPaths = (() =>
  collectionKeys.map((collection) => ({ params: { collection } }))) satisfies GetStaticPaths

export const GET: APIRoute = async ({ params }) => {
  const key = params.collection as Collection
  const collection = collections[key]
  const photos = (await getPhotos()).filter((p) => p.collection === key)

  return markdown(
    frontMatter({
      title: `${collection.title} – ${person.name}`,
      description: collection.description,
      url: abs(`/photography/${key}`),
    }),
    `# ${collection.title}`,
    `${collection.summary} Part of ${link(`${person.name}'s photography`, abs('/photography.md'))}; each photo below is followed by what it shows, and when, where and how it was taken.`,
    photos.map((photo) => photoMarkdown(photo, abs)).join('\n'),
    `All photos © ${person.name}, all rights reserved. To use one, email ${link(person.email, `mailto:${person.email}`)}.`,
  )
}

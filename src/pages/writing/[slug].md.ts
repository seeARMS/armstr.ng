// Each post as Markdown, for agents (see src/worker.ts): Paragraph's own
// Markdown of the post, under the same heading and byline as the page.
import type { APIRoute, GetStaticPaths } from 'astro'
import { person } from '@/data/profile'
import { longDate, postDescription, readingTime } from '@/lib/format'
import { getColinArticlesWithContent } from '@/lib/getAllArticles'
import { abs, frontMatter, markdown } from '@/lib/markdown'

export const prerender = true

export const getStaticPaths = (async () => {
  const posts = await getColinArticlesWithContent()
  return posts.map((post) => ({ params: { slug: post.slug }, props: post }))
}) satisfies GetStaticPaths

export const GET: APIRoute = ({ params, props }) => {
  const { title, subtitle, html, markdown: body, isoDate, updatedIso, discussion } = props
  const minutes = html ? readingTime(html) : 0
  // As on the page: only for a post edited on a later day.
  const updated = longDate(updatedIso) === longDate(isoDate) ? undefined : longDate(updatedIso)

  return markdown(
    frontMatter({
      title,
      description: postDescription(title, subtitle, html ?? ''),
      url: abs(`/writing/${params.slug}`),
      author: person.name,
      published: isoDate,
      modified: updatedIso === isoDate ? undefined : updatedIso,
    }),
    `# ${title}`,
    subtitle,
    [
      person.name,
      longDate(isoDate),
      updated && `Updated ${updated}`,
      minutes > 0 && `${minutes} minute read`,
      discussion && `[Discussed on ${discussion.site}](${discussion.url})`,
    ]
      .filter(Boolean)
      .join(' · '),
    body?.trim() || "This post's text couldn't be loaded when the site was built.",
  )
}

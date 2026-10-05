import { siteSlug } from './slug.js'
import { edited, unlisted } from '../data/posts.ts'

const API_BASE = 'https://public.api.paragraph.com/api/v1'
const PUB_ID = '3eJHzLXKQHclhCdsO4Yr'

/**
 * Posts for the site's lists. Unlisted posts (src/data/posts.ts) are left out
 * unless `includeUnlisted` is set.
 */
export async function getColinArticles({ includeUnlisted = false } = {}) {
  const { items } = await fetchPosts()

  const listed = includeUnlisted ? items : items.filter((post) => !unlisted.has(siteSlug(post.slug)))
  return listed.map((post) => {
    const slug = siteSlug(post.slug)
    const isoDate = new Date(Number(post.publishedAt)).toISOString()
    return {
      title: post.title,
      subtitle: post.subtitle,
      link: `/writing/${slug}`,
      isoDate,
      /** When its text last changed (src/data/posts.ts), else when it was published. */
      updatedIso: edited[slug] ?? isoDate,
    }
  })
}

export async function getColinArticlesWithContent() {
  const { items } = await fetchPosts()

  return items.map((post) => {
    const slug = siteSlug(post.slug)
    const isoDate = new Date(Number(post.publishedAt)).toISOString()
    return {
      title: post.title,
      subtitle: post.subtitle,
      slug,
      unlisted: unlisted.has(slug),
      html: post.staticHtml,
      /** Paragraph's own Markdown of the post, for its Markdown version. */
      markdown: post.markdown,
      /** When its text last changed (src/data/posts.ts), else when it was published. */
      updatedIso: edited[slug] ?? isoDate,
      isoDate,
    }
  })
}

/**
 * Each post's ID and when Paragraph last updated it, one per line, so it
 * changes when a post is published, edited, unpublished or deleted. The build
 * serves the version it was made from at /content-version.txt, and the
 * Worker's cron rebuilds the site when Paragraph's differs (src/worker.ts).
 */
function contentVersion(items) {
  return items.map((post) => `${post.id} ${post.updatedAt}`).join('\n')
}

/** The version this build is made from. */
export async function getContentVersion() {
  const { items } = await fetchPosts()
  return contentVersion(items)
}

/**
 * The version Paragraph has now. It throws when the API fails, rather than
 * reading an outage as "no posts" and rebuilding the site without them.
 */
export async function getLiveContentVersion() {
  const res = await fetch(postsUrl())
  if (!res.ok) throw new Error(`Paragraph's API answered ${res.status}`)
  const { items } = await res.json()
  return contentVersion(items)
}

function postsUrl({ includeContent } = {}) {
  const params = new URLSearchParams({ limit: '50' })
  if (includeContent) params.set('includeContent', 'true')
  return `${API_BASE}/publications/${PUB_ID}/posts?${params}`
}

/**
 * Paragraph's posts, fetched once per build and shared by every page and
 * /content-version.txt. Paragraph caches each API address separately, so
 * separate fetches could disagree: pages built without a new post while
 * content-version.txt lists it, and the cron would never rebuild. (So
 * `npm run dev` shows a new post only after a restart.)
 */
let posts
function fetchPosts() {
  posts ??= fetch(postsUrl({ includeContent: true }))
    .then((res) => res.json())
    .catch((e) => {
      console.error('Failed to fetch posts:', e)
      return { items: [] }
    })
  return posts
}

// When a post's text last changed, by its slug on this site (an ISO date like
// '2026-10-02'), for posts edited after they went out. It's the post's
// modified date for search engines, in its structured data and the sitemap;
// a post that isn't here was last changed when it was published.
//
// Paragraph's own `updatedAt` can't stand in for this: it also moves when a
// post's settings change. Every post's moved on September 27, 2026, when their
// canonical URLs were set, which would have called a 2021 post fresh.
export const edited: Record<string, string> = {}

// Where a post was discussed elsewhere, by its slug on this site. The post
// links to the thread beside its date, and names it in its structured data
// (discussionUrl) and its Markdown version.
export const discussions: Record<string, { site: string; url: string }> = {
  'worth-building': { site: 'Hacker News', url: 'https://news.ycombinator.com/item?id=49971952' },
}

// Posts left off every list on the site: the writing archive, the home page,
// "Keep reading", the RSS feed, llms.txt and the Markdown versions. Each post's
// page still builds and stays in the sitemap, so links from elsewhere keep
// working and search engines keep indexing it. By slug on this site.
export const unlisted = new Set([
  'nextjs-server-side-and-client-side-mismatch',
  'automatically-remove-unused-imports-and-variables-in-vim-using-ale-and-eslint',
])

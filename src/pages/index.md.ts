// The home page as Markdown, for agents (see src/worker.ts).
import type { APIRoute } from 'astro'
import { person, projects, work } from '@/data/profile'
import { anchor, tenure, year } from '@/lib/format'
import { getColinArticles } from '@/lib/getAllArticles'
import { abs, frontMatter, link, markdown } from '@/lib/markdown'

export const prerender = true

export const GET: APIRoute = async () => {
  const articles = await getColinArticles()
  const projectLinks = projects
    .map(
      (project, index) =>
        `${index > 0 ? (index === projects.length - 1 ? ', and ' : ', ') : ''}${link(project.name, project.href)}`,
    )
    .join('')

  return markdown(
    frontMatter({ title: `${person.name} – ${person.title}`, description: person.description, url: abs('/') }),
    `# ${person.name}`,
    // The bio, as on the home page (index.astro); change both.
    `I'm building ${link('Paragraph', 'https://paragraph.com')}, the media engine for early-stage startups. We help founders turn launches, product updates, and what they're learning into media they own. We've raised $7 million from investors including USV and Coinbase Ventures, and in 2024 we acquired Mirror.`,
    `Before that, I led anti-abuse and privacy engineering teams at Google and helped build Coinbase's payments infrastructure. I also angel invest in early-stage startups like ${link('Farcaster', 'https://farcaster.xyz')}, ${link('Daimo', 'https://daimo.com')}, and ${link('Layer3', 'https://layer3.xyz')}, and in a few venture funds that do the same.`,
    `On the side I build small tools like ${projectLinks}. In my free time I enjoy ${link('photography', abs('/photography'))}, wine, cooking & cycling.`,
    articles.length > 0 &&
      [
        '## Writing',
        articles
          .slice(0, 5)
          .map((post) => `- ${link(post.title, abs(post.link))}, ${year(post.isoDate)}`)
          .join('\n'),
        link('All posts', abs('/writing')),
      ].join('\n\n'),
    [
      '## Work',
      work
        .map(
          (role) =>
            `- ${link(role.company, abs(`/projects#${anchor(role.company)}`))}: ${role.summary} · ${tenure(role)}`,
        )
        .join('\n'),
      link('Projects & work', abs('/projects')),
    ].join('\n\n'),
  )
}

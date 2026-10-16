// Projects & Work as Markdown, for agents (see src/worker.ts). Its copy
// repeats projects.astro's; change both.
import type { APIRoute } from 'astro'
import { appearances, projects, work } from '@/data/profile'
import { monthYear, tenure, venue } from '@/lib/format'
import { abs, frontMatter, link, markdown } from '@/lib/markdown'

export const prerender = true

export const GET: APIRoute = () => {
  const since = Math.min(...work.map((role) => role.from))

  return markdown(
    frontMatter({
      title: 'Projects, work and press – Colin Armstrong',
      description:
        "Colin Armstrong's side projects (Appears, heade.rs, Draftside, Council), his work at Paragraph, Mirror, Google and Coinbase, and his podcast and press appearances.",
      url: abs('/projects'),
    }),
    '# Projects & Work',
    "What I'm building on the side, where I've worked, and where I've talked about it.",
    [
      '## Projects',
      "Small products & experiments I've built.",
      projects
        .map((project) => `- ${link(project.name, project.href)} · ${monthYear(project.started)}: ${project.summary}`)
        .join('\n'),
    ].join('\n\n'),
    [
      '## Work',
      `Since ${since}. Selected roles where I worked on payments, anti-abuse, privacy, and systems that reached large numbers of people.`,
      ...work.map((role) =>
        [
          `### ${role.company}`,
          `${role.summary} · ${tenure(role)} · ${link(role.href.replace(/^https?:\/\//, ''), role.href)}`,
          ...role.details,
        ].join('\n\n'),
      ),
    ].join('\n\n'),
    [
      '## Podcasts & press',
      appearances.map((a) => `- ${link(a.title, a.href)} · ${venue(a)} · ${monthYear(a.date)}`).join('\n'),
    ].join('\n\n'),
  )
}

// /llms.txt (https://llmstxt.org): who Colin is, in plain facts, and where the
// Markdown version of each page is, for agents. Keep the facts in step with
// src/data/profile.ts.
import type { APIRoute } from 'astro'
import { paragraph, person, projects, socials, work } from '@/data/profile'
import { mediumDate, monthYear, tenure } from '@/lib/format'
import { getColinArticles } from '@/lib/getAllArticles'
import { abs, link } from '@/lib/markdown'

export const prerender = true

// A calendar date, not a moment: formatted in UTC so it can't slip a day.
const day = (date: string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date))
const years = (company: string) => {
  const role = work.find((r) => r.company === company)
  return role ? tenure(role) : ''
}
const md = (path: string) => abs(path === '/' ? '/index.md' : `${path}.md`)

export const GET: APIRoute = async () => {
  const articles = await getColinArticles()

  const text = [
    `# ${person.name}`,
    `> ${person.name} is the founder and CEO of Paragraph (paragraph.com), the media engine for early-stage startups. Before Paragraph he led anti-abuse and privacy engineering teams at Google and worked on payments at Coinbase. This is his personal site, armstr.ng: his writing, work history, side projects, press and photography.`,
    [
      `- Founder and CEO of ${link('Paragraph', 'https://paragraph.com')}, which was incorporated on ${day(paragraph.founded)}.`,
      `- In May 2024 Paragraph acquired ${link('Mirror', 'https://mirror.xyz')}, the onchain publishing platform founded by Denis Nazarov, and raised $5 million from USV and Coinbase Ventures alongside the deal; Paragraph has raised $7 million in total. Colin ran Mirror as its CEO until Paragraph retired it in September 2025 and moved its writers and posts to Paragraph.`,
      `- Google, ${years('Google')}: senior software engineer and manager on communications anti-abuse. He built Google's first on-device anti-abuse SDK and led work in its privacy working group.`,
      `- Coinbase, ${years('Coinbase')}: payments engineer. He helped launch Coinbase in Canada and improved its Bitcoin private-key signing.`,
      '- Angel investor in early-stage startups such as Farcaster, Daimo and Layer3, and in a few venture funds.',
      '- Side projects:',
      ...projects.map(
        (project) => `  - ${link(project.name, project.href)} · ${monthYear(project.started)}: ${project.summary}`,
      ),
      '- Lives in the San Francisco Bay Area. Photographs wildlife, landscapes and the night sky.',
      `- Email: ${person.email}. Profiles: ${socials.map((s) => `${s.name} ${link(s.handle, s.href)}`).join(', ')}.`,
    ].join('\n'),
    'Every page on this site has a Markdown version: add `.md` to its address (`/index.md` for the home page), or ask for the page itself with an `Accept: text/markdown` header.',
    [
      '## Pages',
      [
        `- ${link('Home', md('/'))}: who Colin is, recent writing and work`,
        `- ${link('Projects & work', md('/projects'))}: side projects, full work history, podcasts and press`,
        `- ${link('Writing', md('/writing'))}: every post, by year`,
        `- ${link('Contact', md('/contact'))}: email and profiles`,
      ].join('\n'),
    ].join('\n\n'),
    articles.length > 0 &&
      [
        '## Writing',
        articles
          .map(
            (post) =>
              `- ${link(post.title, md(post.link))}: ${mediumDate(post.isoDate)}.${post.subtitle ? ` ${post.subtitle}` : ''}`,
          )
          .join('\n'),
      ].join('\n\n'),
    [
      '## Optional',
      [
        `- ${link('Photography', md('/photography'))}: wildlife, landscape and astrophotography, with camera settings`,
        `- ${link('RSS feed', abs('/feed.xml'))}: new posts`,
      ].join('\n'),
    ].join('\n\n'),
  ]

  return new Response(`${text.filter(Boolean).join('\n\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

// The facts the site is built from, in one place: the home page, Projects &
// Work, Contact and the footer all read from here.

export const person = {
  name: 'Colin Armstrong',
  title: 'Founder & CEO of Paragraph',
  previously: 'Previously Google and Coinbase',
  email: 'colin@armstr.ng',
  /** The site's description in search results, unless a page has its own. */
  description:
    'Colin Armstrong is the founder and CEO of Paragraph, the media engine for early-stage startups. Previously anti-abuse at Google and payments at Coinbase.',
  /**
   * What tells him apart from everyone else named Colin Armstrong, for search
   * engines. heade.rs, Draftside and Council use the same words.
   */
  disambiguation:
    'Founder and CEO of Paragraph (paragraph.com), a software engineer and entrepreneur in the San Francisco Bay Area who previously worked at Google and Coinbase.',
}

/** Paragraph, the company, as search engines and agents should know it. */
export const paragraph = {
  /** The day it was incorporated. */
  founded: '2022-04-07',
  disambiguation:
    'The company behind paragraph.com, a publishing platform for startups and writers, founded by Colin Armstrong in April 2022; it acquired the onchain publishing platform Mirror (mirror.xyz) in 2024.',
}

export type Social = {
  name: string
  handle: string
  href: string
  /** A filled path, drawn in `viewBox` (24×24 unless given). */
  icon: string
  viewBox?: string
  /** False keeps it off the site's pages; search engines still see it (sameAs). */
  listed?: boolean
}

export const socials: Social[] = [
  {
    name: 'X',
    handle: '@colinarms',
    href: 'https://x.com/colinarms',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    name: 'Farcaster',
    handle: '@colin',
    href: 'https://farcaster.xyz/colin',
    listed: false,
    // The arch from Farcaster's own wordmark, centered in a square.
    icon: 'M25.6958 3.08141H22.6493V6.15997H23.5826V6.16087H25.6958V22.8188H20.5927L20.5896 22.8035L17.9857 10.3421C17.7374 9.15422 17.0877 8.07935 16.1564 7.31498C15.2251 6.55065 14.0519 6.12979 12.8532 6.12978H12.8429C11.6442 6.12979 10.471 6.55061 9.53964 7.31498C8.60831 8.07935 7.95874 9.1546 7.71048 10.3421L5.10348 22.8188H0V6.16048H2.11314V6.15997H3.0465V3.08141H0V0H25.6958V3.08141Z',
    viewBox: '0 -1.44 25.7 25.7',
  },
  {
    name: 'GitHub',
    handle: 'seeARMS',
    href: 'https://github.com/seeARMS',
    icon: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z',
  },
  {
    name: 'LinkedIn',
    handle: 'colinarms',
    href: 'https://linkedin.com/in/colinarms',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z',
  },
]

export type Project = {
  name: string
  summary: string
  href: string
  /** YYYY-MM the project began, from its initial development history. */
  started: string
  /** A file in /public, or 'headers' for the inline, theme-aware mark. */
  logo: string
  /** The schema.org type the project's own site describes itself as. */
  type: 'WebApplication' | 'SoftwareApplication'
}

export const projects: Project[] = [
  {
    name: 'Appears',
    summary: 'Shows related files while you work, powered by local embeddings',
    href: 'https://appea.rs',
    started: '2026-10',
    logo: '/appears.svg',
    type: 'SoftwareApplication',
  },
  {
    name: 'heade.rs',
    summary: 'Domain and IP lookup with live routes and latency',
    href: 'https://heade.rs',
    started: '2026-09',
    logo: 'headers',
    type: 'WebApplication',
  },
  {
    name: 'Draftside',
    summary: 'Private writing editor with on-device AI',
    href: 'https://draftside.ai',
    started: '2026-05',
    logo: '/draftside.svg',
    type: 'WebApplication',
  },
  {
    name: 'Council',
    summary: 'CLI that runs three AI models and synthesizes one answer',
    href: 'https://council.armstr.ng',
    started: '2026-04',
    logo: '/council.svg',
    type: 'SoftwareApplication',
  },
]

export type Role = {
  company: string
  href: string
  /** Calendar years; an open end means it's where I am now. */
  from: number
  to?: number
  summary: string
  /** A file in /public, or 'paragraph' for the inline mark. */
  logo: string
  details: string[]
}

export const work: Role[] = [
  {
    company: 'Paragraph',
    href: 'https://paragraph.com',
    from: 2022,
    summary: 'Founder & CEO',
    logo: 'paragraph',
    details: [
      "Paragraph is the media engine for early-stage startups. We help founders turn launches, product updates, and what they're learning into media they own.",
      'In 2024 we acquired Mirror and raised $5 million from USV and Coinbase Ventures. I lead product, engineering, and company-building.',
    ],
  },
  {
    company: 'Mirror',
    href: 'https://mirror.xyz',
    from: 2024,
    to: 2025,
    summary: 'CEO, via acquisition',
    logo: '/mirror.webp',
    details: [
      'In May 2024, Paragraph acquired Mirror, the onchain publishing platform founded by Denis Nazarov, which had raised more than $10 million from a16z and USV. We raised $5 million from USV and Coinbase Ventures alongside the deal.',
      'We ran Mirror next to Paragraph, with nothing changing for its writers. In September 2025 we retired it and moved every Mirror writer and post to Paragraph.',
    ],
  },
  {
    company: 'Google',
    href: 'https://google.com',
    from: 2017,
    to: 2022,
    summary: 'Senior Software Engineer & Manager',
    logo: '/google.svg',
    details: [
      'I led engineering work on communications anti-abuse, building systems to protect people from spam, scams, and fraud across messaging surfaces.',
      'I built our first on-device anti-abuse SDK, and deployed ML models and heuristic rules to millions of devices.',
      'I also led initiatives in the privacy working group, ensuring abuse protections could work with minimal data collection and proper guardrails.',
    ],
  },
  {
    company: 'Coinbase',
    href: 'https://coinbase.com',
    from: 2015,
    to: 2016,
    summary: 'Engineer, Payments',
    logo: '/coinbase.svg',
    details: [
      'I worked on payments infrastructure and helped launch Coinbase in Canada.',
      'I also improved Bitcoin private-key signing infrastructure and anti-abuse systems around payments flows.',
    ],
  },
]

type AppearanceBase = {
  outlet: string
  title: string
  href: string
  /** YYYY-MM, for the Projects page */
  date: string
}

// Articles also carry what the publisher's own page says (its publish time,
// byline and lead image), for their NewsArticle/Article structured data.
// Leave the image out when it's the outlet's stock art rather than something
// about Paragraph or Colin.
export type Appearance =
  | (AppearanceBase & { kind: 'Podcast' })
  | (AppearanceBase & {
      kind: 'Press' | 'Interview'
      /** ISO 8601 with a time zone, as the article gives it */
      published: string
      author: string
      image?: string
    })

export const appearances: Appearance[] = [
  {
    outlet: 'Yahoo Finance',
    title: 'Paragraph absorbs Mirror in web3 publishing consolidation',
    href: 'https://finance.yahoo.com/news/paragraph-absorbs-mirror-web3-publishing-200308303.html',
    date: '2025-09',
    kind: 'Press',
    published: '2025-09-16T20:03:08Z',
    author: 'Hongji Feng',
  },
  {
    outlet: "Kaloh's Podcast",
    title: 'Onchain Media Empires with Paragraph and Mirror',
    href: 'https://paragraph.com/@kaloh/paragraph-mirror-colin-armstrong',
    date: '2024-09',
    kind: 'Podcast',
  },
  {
    outlet: 'Into the Bytecode',
    title: 'Paragraph, writing onchain',
    href: 'https://open.spotify.com/episode/28lwX3Ug0TByIYTQbljKLy',
    date: '2024-08',
    kind: 'Podcast',
  },
  {
    outlet: 'The Block',
    title: 'Paragraph raises $5 million from USV and Coinbase Ventures, takes over Mirror',
    href: 'https://www.theblock.co/news/deals/2024-05-02-paragraph-raises-5-million-from-usv-and-coinbase-ventures-takes-over-web3-blogging-platform-mirror-292221',
    date: '2024-05',
    kind: 'Press',
    published: '2024-05-02T14:38:13-04:00',
    author: 'MK Manoylov',
  },
  {
    outlet: 'SiliconANGLE',
    title: 'Web3 newsletter Paragraph raises $5M and takes over blogging platform Mirror',
    href: 'https://siliconangle.com/2024/05/03/web3-newsletter-paragraph-raises-5m-takes-blogging-platform-mirror/',
    date: '2024-05',
    kind: 'Press',
    published: '2024-05-03T17:10:07+00:00',
    author: 'Kyt Dotson',
  },
  {
    outlet: 'Danica Swanson',
    title: 'Introducing Referral Rewards: an interview with Colin Armstrong',
    href: 'https://paragraph.com/@danicaswanson/referral-rewards-interview-with-colin-armstrong',
    date: '2023-10',
    kind: 'Interview',
    published: '2023-10-23T15:58:29.616Z',
    author: 'Danica Swanson',
    image: 'https://storage.googleapis.com/papyrus_images/5349644c5ca3bdc4b2e7c5c175d0842c.jpg',
  },
  {
    outlet: 'Milk Road',
    title: 'How blockchain can transform the newsletter industry',
    href: 'https://www.youtube.com/watch?v=jJ_BwfLCzKs',
    date: '2023-05',
    kind: 'Podcast',
  },
  {
    outlet: 'Humans of Farcaster',
    title: 'Colin Armstrong, founder of Paragraph',
    href: 'https://open.spotify.com/episode/7DNIPl4AgIZ7mFHTl6rb84',
    date: '2023-05',
    kind: 'Podcast',
  },
  {
    outlet: 'Inside the Den',
    title: 'The 3 pillars of building Paragraph',
    href: 'https://insidetheden.captivate.fm/episode/paragraph-and-its-three-pillars-with-colin-arnstrong',
    date: '2023-04',
    kind: 'Podcast',
  },
  {
    outlet: 'Web3 Talks',
    title: '#38: How Paragraph combined web2 and web3 to build a Substack alternative',
    href: 'https://listen.style/p/01grfnkjj5ypb47k8wxkdy1j09/01grfnkjkp8fpdj5p1czsbgz1b',
    date: '2023-01',
    kind: 'Podcast',
  },
  {
    outlet: 'SiliconANGLE',
    title: 'Web3 newsletter platform Paragraph raises $1.7M in pre-seed funding',
    href: 'https://siliconangle.com/2022/10/24/web3-newsletter-platform-paragraph-raises-1-7m-pre-seed-funding/',
    date: '2022-10',
    kind: 'Press',
    published: '2022-10-24T18:25:06+00:00',
    author: 'Kyt Dotson',
  },
  {
    outlet: 'The Block',
    title: 'Web3 publishing platform Paragraph raises $1.7 million',
    href: 'https://www.theblock.co/news/deals/2022-10-24-web3-publishing-platform-paragraph-raises-179174',
    date: '2022-10',
    kind: 'Press',
    published: '2022-10-24T09:00:35-04:00',
    author: 'Kari McMahon',
  },
]

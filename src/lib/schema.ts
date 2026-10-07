// Structured data (schema.org JSON-LD) for every page, as one connected graph:
// Colin, this site and Paragraph are defined once and referred to by @id, so
// search engines can tie the site, the posts, the press and Paragraph to the
// same person. Layout.astro renders whatever a page passes as `schema`.
import { appearances, paragraph, person, projects, socials } from '@/data/profile'

export const SITE = 'https://armstr.ng'
export const PERSON_ID = `${SITE}/#person`
export const WEBSITE_ID = `${SITE}/#website`
// The @id paragraph.com uses for itself, so both sites describe one company.
export const PARAGRAPH_ID = 'https://paragraph.com/#organization'

const url = (path: string) => new URL(path, SITE).href

/** Colin, in full (the home page's main entity). */
export function personNode(image?: string) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: person.name,
    alternateName: ['colinarms', 'seeARMS'],
    url: url('/'),
    image,
    email: `mailto:${person.email}`,
    jobTitle: 'Founder & CEO',
    description: `${person.name} is the founder and CEO of Paragraph, the media engine for early-stage startups. He previously led anti-abuse and privacy engineering teams at Google and helped build Coinbase's payments infrastructure.`,
    disambiguatingDescription: person.disambiguation,
    worksFor: { '@id': PARAGRAPH_ID },
    homeLocation: { '@type': 'Place', name: 'San Francisco Bay Area' },
    knowsAbout: [
      'Startups',
      'Publishing',
      'Newsletters',
      'Anti-abuse',
      'Privacy engineering',
      'Payments',
      'Photography',
    ],
    sameAs: socials.map((s) => s.href),
    subjectOf: appearances.map((a) =>
      a.kind === 'Podcast'
        ? {
            '@type': 'PodcastEpisode',
            name: a.title,
            url: a.href,
            datePublished: a.date,
            partOfSeries: { '@type': 'PodcastSeries', name: a.outlet },
          }
        : {
            '@type': a.kind === 'Press' ? 'NewsArticle' : 'Article',
            headline: a.title,
            url: a.href,
            image: a.image,
            datePublished: a.published,
            author: { '@type': 'Person', name: a.author },
            publisher: { '@type': 'Organization', name: a.outlet },
          },
    ),
  }
}

/** Enough of Colin to stand on its own on any page. */
export function personRef() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: person.name,
    url: url('/'),
    disambiguatingDescription: person.disambiguation,
  }
}

export function paragraphNode() {
  return {
    '@type': 'Organization',
    '@id': PARAGRAPH_ID,
    name: 'Paragraph',
    url: 'https://paragraph.com/',
    description: 'The media engine for early-stage startups.',
    disambiguatingDescription: paragraph.disambiguation,
    foundingDate: paragraph.founded,
    founder: { '@id': PERSON_ID },
    sameAs: ['https://x.com/paragraph_xyz', 'https://www.linkedin.com/company/paragraph-xyz'],
  }
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: url('/'),
    name: person.name,
    alternateName: 'armstr.ng',
    inLanguage: 'en',
    publisher: { '@id': PERSON_ID },
  }
}

/** The home page: a profile page about Colin. */
export function profilePage(name: string, image?: string) {
  return [
    websiteNode(),
    {
      '@type': 'ProfilePage',
      '@id': `${SITE}/#profile`,
      url: url('/'),
      name,
      isPartOf: { '@id': WEBSITE_ID },
      mainEntity: { '@id': PERSON_ID },
    },
    personNode(image),
    paragraphNode(),
  ]
}

/**
 * Colin's side projects, with the same @ids their own sites use
 * (https://heade.rs/#app and so on), so both ends name the same app and creator.
 */
export function projectList() {
  return {
    '@type': 'ItemList',
    '@id': `${SITE}/projects#projects`,
    name: `Projects by ${person.name}`,
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': p.type,
        '@id': `${new URL(p.href).origin}/#app`,
        name: p.name,
        url: new URL('/', p.href).href,
        description: p.summary,
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
        creator: personRef(),
      },
    })),
  }
}

/** Home › … › this page. */
export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: url(crumb.path),
    })),
  }
}

export function blog(posts: { title: string; link: string; isoDate: string }[]) {
  return {
    '@type': 'Blog',
    '@id': `${SITE}/writing#blog`,
    url: url('/writing'),
    name: `Writing by ${person.name}`,
    inLanguage: 'en',
    author: personRef(),
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: url(p.link),
      datePublished: p.isoDate,
    })),
  }
}

export function blogPosting(post: {
  path: string
  title: string
  description: string
  image: string
  published: string
  modified?: string
  words?: number
  /** Things the post links to, by @id (src/lib/links.ts). */
  mentions?: { '@id': string }[]
  /** A thread about the post elsewhere, like Hacker News (src/data/posts.ts). */
  discussion?: string
}) {
  const page = url(post.path)
  return {
    '@type': 'BlogPosting',
    '@id': `${page}#post`,
    url: page,
    mainEntityOfPage: page,
    headline: post.title,
    description: post.description,
    image: [url(post.image)],
    datePublished: post.published,
    dateModified: post.modified ?? post.published,
    wordCount: post.words,
    inLanguage: 'en',
    author: personRef(),
    publisher: personRef(),
    isPartOf: { '@id': `${SITE}/writing#blog` },
    mentions: post.mentions,
    discussionUrl: post.discussion,
  }
}

/** Photos credited to Colin, for Google Images' creator and credit details. */
export function imageGallery(photos: { src: string; caption?: string }[]) {
  return {
    '@type': 'ImageGallery',
    url: url('/photography'),
    name: `Photography by ${person.name}`,
    author: personRef(),
    image: photos.map((p) => ({
      '@type': 'ImageObject',
      contentUrl: url(p.src),
      caption: p.caption,
      // Just the name: the gallery's author above says the rest, once.
      creator: { '@type': 'Person', '@id': PERSON_ID, name: person.name },
      creditText: person.name,
      copyrightNotice: `© ${person.name}`,
    })),
  }
}

export function contactPage() {
  return {
    '@type': 'ContactPage',
    url: url('/contact'),
    name: `Contact ${person.name}`,
    mainEntity: {
      ...personRef(),
      email: `mailto:${person.email}`,
      sameAs: socials.map((s) => s.href),
    },
  }
}

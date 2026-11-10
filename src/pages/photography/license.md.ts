// Photo licensing as Markdown, for agents (see src/worker.ts). Its copy
// repeats license.astro's; change both.
import type { APIRoute } from 'astro'
import { license } from '@/data/photos'
import { person, socials } from '@/data/profile'
import { abs, frontMatter, link, markdown } from '@/lib/markdown'

export const prerender = true

export const GET: APIRoute = () => {
  const x = socials.find((s) => s.name === 'X')!

  return markdown(
    frontMatter({
      title: `Photo licensing – ${person.name}`,
      description:
        "How to use Colin Armstrong's photographs: free to share and adapt for non-commercial use with credit, under CC BY-NC 4.0. Commercial use needs a license.",
      url: abs(license.page),
    }),
    '# Using my photos',
    "Every photo on this site is mine. You're welcome to share and adapt them for anything non-commercial, as long as you credit me. Commercial use needs a license from me.",
    '## License',
    `All photos on armstr.ng are licensed under ${link(license.title, license.url)} (${license.name}). You can copy, share and adapt them for any non-commercial purpose, as long as you credit me, link to the license, and say if you changed the photo.`,
    '## Sharing',
    "Posting a photo on social media, setting one as your wallpaper, or putting one in a personal blog or a school project is fine without asking. Just credit me, and don't present it as your own work.",
    `Credit: “${license.credit}”`,
    `Where you can, link my name to armstr.ng and “${license.name}” to the license. On social media, tagging me (${link(x.handle, x.href)} on X) works too.`,
    '## Commercial use',
    "The license doesn't cover commercial use, which needs a separate license from me. That includes advertising and marketing, books and magazines, products and packaging, merchandise, prints for sale, and stock photo sites. If you're not sure whether your use counts, ask.",
    `To license a photo, email me at ${link(person.email, `mailto:${person.email}`)} with the photo (its caption is enough), where it will appear, and for how long. I'm flexible on price for editorial work, non-profits and small projects.`,
  )
}

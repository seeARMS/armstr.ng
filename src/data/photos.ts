// What's in each photo, which collection it's in, and where it was taken, by
// file name (no extension). A new photo needs an entry here to appear in a
// collection or on the map; without one it shows only in the full grid, with
// just its camera settings.

export type Collection = 'wildlife' | 'landscape' | 'astro' | 'abstract'

/**
 * The Photography page's collections, in the order its opening sentence names
 * them. `phrase` is the collection's words in that sentence ("Wildlife,
 * landscapes, the night sky and the odd abstract"), which pick it.
 */
export const collections: Record<
  Collection,
  { name: string; phrase: string; title: string; summary: string; description: string }
> = {
  wildlife: {
    name: 'Wildlife',
    phrase: 'Wildlife',
    title: 'Wildlife photography',
    summary:
      'Moose, loons, birds of prey, monkeys and a sloth, from the marshes of Algonquin Park to the rainforest along the Panama Canal.',
    description:
      'Wildlife photographs by Colin Armstrong: moose, loons and a young bald eagle in Algonquin Park, hawks, motmots and trogons, howler monkeys, a sloth, a bobcat and a gray fox, from Ontario and California to Panama.',
  },
  landscape: {
    name: 'Landscape',
    phrase: 'landscapes',
    title: 'Landscape photography',
    summary: 'Mountains, coastlines and sunsets: Patagonia, Yosemite, Big Sur, Napa Valley, Meteora and Santorini.',
    description:
      "Landscape photographs by Colin Armstrong: Patagonia's Mount Fitz Roy, Yosemite, Bixby Bridge in Big Sur, Meteora and Santorini.",
  },
  astro: {
    name: 'Astro',
    phrase: 'the night sky',
    title: 'Astrophotography',
    summary:
      'The Milky Way from dark skies in Ontario and Mendocino County, and the Moon over the South Bay and Algonquin Park.',
    description:
      'Astrophotography by Colin Armstrong: the Milky Way from Ontario and Mendocino County, and the Moon, with how each was shot.',
  },
  abstract: {
    name: 'Abstract',
    phrase: 'abstract',
    title: 'Abstract photography',
    summary: 'Patterns in water, up close: swirls of foam below a spillway, and algae on the surface.',
    description: 'Abstract photographs by Colin Armstrong: foam and algae patterns on moving water.',
  },
}

/**
 * Where photos were taken. The Canon R5 records no location, so each Canon
 * photo's place comes from the phone photos taken nearest to it in time
 * (matched in UTC; the camera's clock stays on Pacific time when traveling).
 * The two iPhone photos carry their own. Coordinates are rounded to the town,
 * park or valley, never a house.
 */
export const places = {
  'panama-city': { name: 'Panama City', region: 'Panama', lat: 8.99, lon: -79.54 },
  gamboa: { name: 'Gamboa', region: 'Panama', lat: 9.12, lon: -79.7, cover: 'colored_bird' },
  'el-chalten': { name: 'El Chaltén', region: 'Patagonia, Argentina', lat: -49.33, lon: -72.89 },
  meteora: { name: 'Meteora', region: 'Greece', lat: 39.71, lon: 21.63 },
  oia: { name: 'Oia, Santorini', region: 'Greece', lat: 36.46, lon: 25.38 },
  'kawartha-lakes': { name: 'Kawartha Lakes', region: 'Ontario', lat: 44.55, lon: -78.55, cover: '4V3A4661' },
  algonquin: { name: 'Algonquin Park', region: 'Ontario', lat: 45.71, lon: -78.47, cover: '4V3A8874' },
  'north-bend': { name: 'North Bend', region: 'Washington', lat: 47.43, lon: -121.77 },
  kula: { name: 'Kula, Maui', region: 'Hawaii', lat: 20.7, lon: -156.35 },
  naples: { name: 'Naples', region: 'Florida', lat: 26.14, lon: -81.79 },
  yosemite: { name: 'Yosemite Valley', region: 'California', lat: 37.74, lon: -119.59, cover: '4V3A2971' },
  'big-sur': { name: 'Big Sur', region: 'California', lat: 36.37, lon: -121.9 },
  'napa-valley': { name: 'Napa Valley', region: 'California', lat: 38.4, lon: -122.36 },
  boonville: { name: 'Boonville', region: 'California', lat: 39.01, lon: -123.37 },
  'point-reyes': { name: 'Point Reyes', region: 'California', lat: 38.04, lon: -122.8 },
  'south-bay': { name: 'South Bay', region: 'California', lat: 37.37, lon: -122.0, cover: '4V3A5811' },
  'san-jose-foothills': {
    name: 'San Jose foothills',
    region: 'California',
    lat: 37.4,
    lon: -121.8,
    cover: '4V3A0934-Enhanced-NR',
  },
  'uvas-canyon': { name: 'Uvas Canyon', region: 'California', lat: 37.08, lon: -121.79 },
} satisfies Record<string, { name: string; region: string; lat: number; lon: number; cover?: string }>

export type PlaceSlug = keyof typeof places

/**
 * What each photo shows. `note`, when there is one, is a line or two about it
 * that the Photography page's one-per-row view prints under the photo.
 */
export const photos: Record<string, { caption: string; collection: Collection; place: PlaceSlug; note?: string }> = {
  '4V3A0065-HDR': { caption: 'Moon in the clouds', collection: 'astro', place: 'algonquin' },
  '4V3A0104-HDR': { caption: 'Moon above a cloud', collection: 'astro', place: 'algonquin' },
  '4V3A0934-Enhanced-NR': { caption: 'Bobcat', collection: 'wildlife', place: 'san-jose-foothills' },
  '4V3A1060': { caption: 'Katydid', collection: 'wildlife', place: 'yosemite' },
  '4V3A1468-HDR': { caption: 'Mount Fitz Roy', collection: 'landscape', place: 'el-chalten' },
  '4V3A2017': { caption: 'Foam swirls', collection: 'abstract', place: 'south-bay' },
  '4V3A2043': { caption: 'Foam below a spillway', collection: 'abstract', place: 'south-bay' },
  '4V3A2971': { caption: 'Smoky sunset', collection: 'landscape', place: 'yosemite' },
  '4V3A3620-Enhanced-NR': { caption: "Steller's jay", collection: 'wildlife', place: 'uvas-canyon' },
  '4V3A3692': { caption: 'Algae patterns on water', collection: 'abstract', place: 'south-bay' },
  '4V3A3900-Enhanced-NR': { caption: "Cooper's hawk", collection: 'wildlife', place: 'san-jose-foothills' },
  '4V3A3923-Enhanced-NR': { caption: "Cooper's hawk", collection: 'wildlife', place: 'san-jose-foothills' },
  '4V3A4661': { caption: 'Milky Way', collection: 'astro', place: 'kawartha-lakes' },
  '4V3A4681-Enhanced-NR': { caption: 'Milky Way', collection: 'astro', place: 'kawartha-lakes' },
  '4V3A5811': { caption: 'Red-tailed hawk', collection: 'wildlife', place: 'south-bay' },
  '4V3A5980': { caption: 'Gray fox', collection: 'wildlife', place: 'point-reyes' },
  '4V3A6027': { caption: 'Howler monkey', collection: 'wildlife', place: 'panama-city' },
  '4V3A6596': { caption: 'Howler monkey', collection: 'wildlife', place: 'panama-city' },
  '4V3A6915': { caption: 'Coati', collection: 'wildlife', place: 'panama-city' },
  '4V3A7317-Enhanced-NR': { caption: 'Moon', collection: 'astro', place: 'south-bay' },
  '4V3A7378': { caption: 'California quail', collection: 'wildlife', place: 'point-reyes' },
  '4V3A8129': { caption: 'Howler monkey', collection: 'wildlife', place: 'gamboa' },
  '4V3A8251': { caption: 'Canada geese and goslings', collection: 'wildlife', place: 'algonquin' },
  '4V3A8344': { caption: 'Black-throated trogon', collection: 'wildlife', place: 'gamboa' },
  '4V3A8402': { caption: 'Fasciated antshrike', collection: 'wildlife', place: 'gamboa' },
  '4V3A8589': { caption: 'Motmot', collection: 'wildlife', place: 'gamboa' },
  '4V3A8679': { caption: 'Moose', collection: 'wildlife', place: 'algonquin' },
  '4V3A8706': { caption: 'Moose', collection: 'wildlife', place: 'algonquin' },
  '4V3A8769': { caption: 'Rufescent tiger-heron', collection: 'wildlife', place: 'gamboa' },
  '4V3A8816': { caption: 'Moose', collection: 'wildlife', place: 'algonquin' },
  '4V3A8874': { caption: 'Moose', collection: 'wildlife', place: 'algonquin' },
  '4V3A9271': { caption: 'Moose', collection: 'wildlife', place: 'algonquin' },
  '4V3A9298': { caption: 'Sloth', collection: 'wildlife', place: 'gamboa' },
  '4V3A9461': { caption: 'Moose', collection: 'wildlife', place: 'algonquin' },
  '4V3A9545': { caption: 'Mockingbird', collection: 'wildlife', place: 'naples' },
  '4V3A9617': { caption: 'Moose', collection: 'wildlife', place: 'algonquin' },
  '4V3A9651_1': { caption: 'Tamandua', collection: 'wildlife', place: 'gamboa' },
  '4V3A9819': { caption: 'Young bald eagle', collection: 'wildlife', place: 'algonquin' },
  '4V3A9848': { caption: 'Young bald eagle', collection: 'wildlife', place: 'algonquin' },
  '4V3A9868': { caption: 'Common loon', collection: 'wildlife', place: 'algonquin' },
  '4V3A9886': { caption: 'Common loon', collection: 'wildlife', place: 'algonquin' },
  '4V3A9995': { caption: 'Yellow-headed caracara', collection: 'wildlife', place: 'gamboa' },
  astro_3: { caption: 'Milky Way', collection: 'astro', place: 'kawartha-lakes' },
  astro_4: { caption: 'Milky Way', collection: 'astro', place: 'boonville' },
  balloon: { caption: 'Hot air balloon', collection: 'landscape', place: 'napa-valley' },
  bird: { caption: 'American robin', collection: 'wildlife', place: 'kawartha-lakes' },
  colored_bird: { caption: 'Motmot', collection: 'wildlife', place: 'gamboa' },
  ducks: { caption: 'Canada geese and goslings', collection: 'wildlife', place: 'north-bend' },
  green_bird: { caption: 'Warbling white-eye', collection: 'wildlife', place: 'kula' },
  heron: { caption: 'Great blue heron in flight', collection: 'wildlife', place: 'kawartha-lakes' },
  meteora: { caption: 'Sunset over the rocks', collection: 'landscape', place: 'meteora' },
  monkey_family: { caption: 'Howler monkey and baby', collection: 'wildlife', place: 'panama-city' },
  santorini: { caption: 'Sunset over the caldera', collection: 'landscape', place: 'oia' },
  santorini_pano: { caption: 'The caldera at dusk', collection: 'landscape', place: 'oia' },
  water: { caption: 'Bixby Bridge', collection: 'landscape', place: 'big-sur' },
  'yellow_bird-2': { caption: 'Yellow-backed oriole', collection: 'wildlife', place: 'panama-city' },
}

// Night-sky photos the camera settings don't give away: the Moon, which is
// bright enough for a fast shutter. Exposures of a second or more count
// already (scripts/photo-meta.mjs). The Photography page opens on one of
// these after dark.
export const nightSky = new Set(['4V3A7317-Enhanced-NR', '4V3A0065-HDR', '4V3A0104-HDR'])

/**
 * The photos' license, explained on /photography/license. The note under
 * every photo page (PhotoLicense.astro), their Markdown versions and their
 * structured data (imageGallery in src/lib/schema.ts) all name it.
 */
export const license = {
  name: 'CC BY-NC 4.0',
  title: 'Creative Commons Attribution-NonCommercial 4.0 International',
  url: 'https://creativecommons.org/licenses/by-nc/4.0/',
  page: '/photography/license',
  credit: 'Photo by Colin Armstrong (armstr.ng), CC BY-NC 4.0',
}

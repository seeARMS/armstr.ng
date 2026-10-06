// What's in each photo, by file name (no extension). A photo without a
// caption shows only its camera settings. Add to this as you like.
export const captions: Record<string, string> = {
  '4V3A0934-Enhanced-NR': 'Bobcat',
  '4V3A1060': 'Katydid',
  '4V3A1468-HDR': 'Mount Fitz Roy, Patagonia',
  '4V3A2017': 'Foam swirls',
  '4V3A2043': 'Foam below a spillway',
  '4V3A2971': 'Smoky sunset, Yosemite',
  '4V3A3620-Enhanced-NR': "Steller's jay",
  '4V3A3692': 'Algae patterns on water',
  '4V3A3900-Enhanced-NR': "Cooper's hawk",
  '4V3A3923-Enhanced-NR': "Cooper's hawk",
  '4V3A4661': 'Milky Way',
  '4V3A4681-Enhanced-NR': 'Milky Way',
  '4V3A5811': 'Red-tailed hawk',
  '4V3A5980': 'Gray fox',
  '4V3A6027': 'Howler monkey',
  '4V3A6596': 'Howler monkey',
  '4V3A6915': 'Coati',
  '4V3A7317-Enhanced-NR': 'Moon',
  '4V3A7378': 'California quail',
  '4V3A8129': 'Howler monkey',
  '4V3A8344': 'Black-throated trogon',
  '4V3A8402': 'Fasciated antshrike',
  '4V3A8589': 'Motmot',
  '4V3A8769': 'Rufescent tiger-heron',
  '4V3A9298': 'Sloth',
  '4V3A9545': 'Mockingbird',
  '4V3A9651_1': 'Tamandua',
  '4V3A9995': 'Yellow-headed caracara',
  astro_3: 'Milky Way',
  astro_4: 'Milky Way',
  balloon: 'Hot air balloon',
  bird: 'American robin',
  colored_bird: 'Motmot',
  ducks: 'Canada geese and goslings',
  green_bird: 'Warbling white-eye',
  heron: 'Great blue heron in flight',
  meteora: 'Meteora, Greece',
  monkey_family: 'Howler monkey and baby',
  santorini: 'Santorini, Greece',
  santorini_pano: 'Santorini, Greece',
  water: 'Bixby Bridge, Big Sur',
  'yellow_bird-2': 'Yellow-backed oriole',
}

// Night-sky photos the camera settings don't give away: one without EXIF, and
// the Moon, which is bright enough for a fast shutter. Exposures of a second
// or more count already (scripts/photo-meta.mjs). The Photography page opens
// on one of these after dark.
export const nightSky = new Set(['astro_3', '4V3A7317-Enhanced-NR'])

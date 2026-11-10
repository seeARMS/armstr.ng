// The photography map, drawn once at build time: the world's coastlines as
// hairlines (Natural Earth, through world-atlas), with California, where most
// of the places are, enlarged in an inset over the empty South Pacific. Places
// come back as percentages of the drawing, so the page can pin them over it at
// any size.
import { geoEqualEarth, geoMercator, geoPath, type GeoPermissibleObjects } from 'd3-geo'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import land110 from 'world-atlas/land-110m.json'
import land10 from 'world-atlas/land-10m.json'

/** The drawing's width, in its own units. The height follows from the crop. */
const W = 1000
// Antarctica and the far north are left off: no photos there, and the rest
// of the world gets the room.
const NORTH = 84
const SOUTH = -57
/** The least room between two places' dots, in the drawing's units. */
const SPACE = 15
/** The inset, in the drawing's units, measured from its bottom-left corner. */
const INSET = { left: 16, bottom: 14, width: 210, height: 170 }

type Topo = Topology<{ land: GeometryCollection }>
type Polygon = { type: 'Polygon'; coordinates: number[][][] }

/** Every landmass as its own polygon, so each coastline can draw itself. */
function polygons(topo: Topo): Polygon[] {
  const land = feature(topo, topo.objects.land)
  const out: Polygon[] = []
  for (const f of land.features) {
    const g = f.geometry
    if (g.type === 'Polygon') out.push(g as Polygon)
    else if (g.type === 'MultiPolygon') for (const coordinates of g.coordinates) out.push({ type: 'Polygon', coordinates })
  }
  return out
}

export type AtlasPlace = { slug: string; lat: number; lon: number; inset: boolean }

export function drawAtlas<P extends AtlasPlace>(places: P[]) {
  // Equal Earth, turned a little east so the Pacific edge misses Alaska.
  const world = geoEqualEarth().rotate([-11, 0])
  world.fitWidth(W, { type: 'Sphere' })
  // Parallels are straight lines in Equal Earth, so the crop is two y's.
  const top = world([-11, NORTH])![1]
  const bottom = world([-11, SOUTH])![1]
  const H = Math.round(bottom - top)
  const [tx, ty] = world.translate()
  world.translate([tx, ty - top]).clipExtent([
    [0, 0],
    [W, H],
  ])
  const path = geoPath(world).digits(1)

  const coasts = polygons(land110 as unknown as Topo)
    // Antarctica, and anything else entirely south of the crop.
    .filter((p) => p.coordinates[0].some(([, lat]) => lat > SOUTH))
    .map((p) => path(p as GeoPermissibleObjects))
    .filter((d): d is string => Boolean(d))

  // The inset: California's places, fitted with room to spare, over the
  // finer coastline.
  const box = { x: INSET.left, y: H - INSET.bottom - INSET.height, w: INSET.width, h: INSET.height }
  const near = places.filter((p) => p.inset)
  const zoom = geoMercator()
  const pad = 26
  zoom.fitExtent(
    [
      [box.x + pad, box.y + pad],
      [box.x + box.w - pad, box.y + box.h - pad],
    ],
    { type: 'MultiPoint', coordinates: near.map((p) => [p.lon, p.lat]) },
  )
  zoom.clipExtent([
    [box.x, box.y],
    [box.x + box.w, box.y + box.h],
  ])
  const zoomPath = geoPath(zoom).digits(1)
  // Only the polygons near California, so the fine coastline stays small.
  const [[west, south], [east, north]] = [zoom.invert!([box.x, box.y + box.h])!, zoom.invert!([box.x + box.w, box.y])!]
  const insetCoasts = polygons(land10 as unknown as Topo)
    .filter((p) =>
      p.coordinates[0].some(([lon, lat]) => lon > west - 2 && lon < east + 2 && lat > south - 2 && lat < north + 2),
    )
    .map((p) => zoomPath(p as GeoPermissibleObjects))
    .filter((d): d is string => Boolean(d))

  // Where the inset sits on the world: a small box around the same ground.
  const corners = [
    [west, north],
    [east, north],
    [east, south],
    [west, south],
  ].map((c) => world(c as [number, number])!)
  const xs = corners.map((c) => c[0])
  const ys = corners.map((c) => c[1])
  const locator = {
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  }

  // Places a few miles apart would sit on top of each other (Algonquin and
  // the Kawartha Lakes, Panama City and Gamboa), so ease any that close apart
  // until each can be pointed at on its own.
  const at = places.map((p) => [...(p.inset ? zoom : world)([p.lon, p.lat])!] as [number, number])
  for (let round = 0; round < 60; round++) {
    for (let i = 0; i < at.length; i++) {
      for (let j = i + 1; j < at.length; j++) {
        if (places[i].inset !== places[j].inset) continue
        const dx = at[j][0] - at[i][0]
        const dy = at[j][1] - at[i][1]
        const d = Math.hypot(dx, dy)
        if (d >= SPACE) continue
        const [ux, uy] = d > 0.01 ? [dx / d, dy / d] : [0.6, 0.8]
        const push = (SPACE - d) / 2
        at[i] = [at[i][0] - ux * push, at[i][1] - uy * push]
        at[j] = [at[j][0] + ux * push, at[j][1] + uy * push]
      }
    }
  }
  const pins = places.map((p, i) => ({ ...p, left: (at[i][0] / W) * 100, top: (at[i][1] / H) * 100 }))

  return {
    width: W,
    height: H,
    coasts,
    inset: { ...box, coasts: insetCoasts },
    locator,
    pins,
  }
}

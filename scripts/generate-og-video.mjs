// The home page's share video (og:video), on the share cards' layout: the
// domain at the top, the portrait, and Colin's name, with a line under it
// that cycles through what he's into. Each interest comes in its own way,
// with a small line drawing beside it: startups grow from the baseline by a
// seedling, writing is typed out by a pilcrow, code decodes between braces,
// wildlife hops in and a bird lands on it, and the night sky comes out like
// stars while the card darkens. They all leave the same way, with a short
// fade and drop.
//
// iMessage plays og:video inline (Discord and Telegram do too); everything
// else shows og:image. The video needs ffmpeg, which the build image lacks, so
// it's made by hand and checked in: `npm run og:video` after changing it.
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { CREAM, DEEP, FONTS, H, SLATE_MIST, W, card, h, img, portrait as face } from './generate-og.mjs'

const OUT = join(import.meta.dirname, '..', 'public', 'video', 'home.mp4')
const FPS = 30

const INTERESTS = ['startups', 'writing', 'code', 'wildlife', 'the night sky']
const TURN = 2.4
// The last part of each turn, when the interest fades and drops away.
const EXIT = 0.35
const LENGTH = TURN * INTERESTS.length
const FRAMES = Math.round(FPS * LENGTH)
// The video starts this far in, once "startups" and its seedling are in
// place, so the first frame is a finished card. Its entrance plays at the end,
// right before the video loops.
const START = 1.4

const SIZE = 104
const LINE = Math.round(SIZE * 1.12)
const TRACKING = -SIZE * 0.035
// The drawings beside each interest, and their strokes.
const ART = 104
const STROKE = 5
// The night's darker background.
const NIGHT = '#050b17'

// --- Timing ----------------------------------------------------------------

const clamp = (x) => Math.min(1, Math.max(0, x))
const easeOut = (x) => 1 - (1 - clamp(x)) ** 3
const easeIn = (x) => clamp(x) ** 3
const easeInOut = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2)
// Overshoots a little before settling, for things that spring into place.
const easeOutBack = (x) => {
  const c = 1.7
  const t = clamp(x) - 1
  return 1 + (c + 1) * t ** 3 + c * t ** 2
}
/** 0 → 1 as `t` runs from `from` over `span` seconds. */
const over = (t, from, span) => clamp((t - from) / span)

/** A repeatable pseudo-random number in [0, 1) for a pair of integers. */
function random(a, b = 0) {
  let x = Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35)
  x ^= x >>> 15
  x = Math.imul(x, 0x2c1b3c6d)
  x ^= x >>> 12
  return (x >>> 0) / 2 ** 32
}

const mix = (a, b, p) => {
  const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const [x, y] = [channels(a), channels(b)]
  return `rgb(${x.map((c, i) => Math.round(c + (y[i] - c) * p)).join(',')})`
}

// --- Drawing ---------------------------------------------------------------

/**
 * A path's points, one list per subpath, with its curves cut into short
 * lines. Knows only the absolute commands the drawings below use.
 */
function points(d) {
  const tokens = d.match(/[MLHVCZ]|-?[\d.]+/g)
  const paths = []
  let path
  let x = 0
  let y = 0
  let i = 0
  const num = () => Number(tokens[i++])
  while (i < tokens.length) {
    const command = tokens[i++]
    if (command === 'M') {
      x = num()
      y = num()
      paths.push((path = [[x, y]]))
    } else if (command === 'L') path.push([(x = num()), (y = num())])
    else if (command === 'H') path.push([(x = num()), y])
    else if (command === 'V') path.push([x, (y = num())])
    else if (command === 'Z') path.push([...path[0]])
    else if (command === 'C') {
      const [x1, y1, x2, y2, x3, y3] = [num(), num(), num(), num(), num(), num()]
      for (let s = 1; s <= 24; s++) {
        const t = s / 24
        const u = 1 - t
        path.push([
          u ** 3 * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * x3,
          u ** 3 * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * y3,
        ])
      }
      x = x3
      y = y3
    }
  }
  return paths
}

/**
 * The first `p` of a path, by length, with its subpaths drawn one after
 * another. (resvg ignores pathLength, so a dash can't do this.)
 */
function drawn(d, p) {
  const paths = points(d)
  const length = (path) => path.slice(1).reduce((sum, [x, y], k) => sum + Math.hypot(x - path[k][0], y - path[k][1]), 0)
  let left = clamp(p) * paths.reduce((sum, path) => sum + length(path), 0)
  let out = ''
  for (const path of paths) {
    if (left <= 0) break
    out += `M${path[0][0]} ${path[0][1]}`
    for (let k = 1; k < path.length && left > 0; k++) {
      const [ax, ay] = path[k - 1]
      const [bx, by] = path[k]
      const step = Math.hypot(bx - ax, by - ay)
      const f = Math.min(1, left / step)
      out += `L${ax + (bx - ax) * f} ${ay + (by - ay) * f}`
      left -= step
    }
  }
  return out
}

/** An SVG drawing as an image, in the interests' misty blue. */
const art = (body, { size = ART, view = 100, style = {} } = {}) =>
  img(
    `data:image/svg+xml;base64,${Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${view} ${view}" width="${size * 2}" height="${size * 2}" fill="none" stroke="${SLATE_MIST}" stroke-width="${(STROKE * view) / size}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`,
    ).toString('base64')}`,
    size,
    size,
    style,
  )

/** A path drawn on as `p` goes from 0 to 1. */
const line = (d, p) => (p > 0 ? `<path d="${drawn(d, p)}"/>` : '')

// --- Letters ---------------------------------------------------------------

/**
 * An interest set letter by letter, so each letter can move on its own.
 * `place` gives a letter's style, and anything to draw on it, from its index.
 */
function word(text, place = () => ({})) {
  return [...text].map((ch, k) => {
    const { style = {}, on = [] } = place(k, ch)
    // The tracking goes between letters as a margin, since a letter on its own has nothing to track against.
    return h(
      'div',
      { display: 'flex', position: 'relative', whiteSpace: 'pre', letterSpacing: 0, marginRight: TRACKING, ...style },
      ch,
      ...on,
    )
  })
}

/** Something drawn beside the interest, after a small gap. */
const beside = (drawing) => h('div', { display: 'flex', marginLeft: 26, marginTop: 8 }, drawing)

// --- Interests -------------------------------------------------------------
// Each takes the seconds since its turn began and gives the line's contents.

/** Letters grow up from the baseline, one after another, by a seedling. */
function startups(t) {
  const letters = word('startups', (k) => {
    const p = easeOutBack(over(t, k * 0.07, 0.45))
    return { style: { transformOrigin: '50% 85%', transform: `scale(1, ${Math.max(0.001, p)})`, opacity: clamp(p * 3) } }
  })
  // The ground, then the stem growing up it, then two leaves unfurling.
  const leaf = (d, from) => line(d, easeOut(over(t, from, 0.4)))
  return [
    ...letters,
    beside(
      art(
        line('M28 92 H72', easeOut(over(t, 0.2, 0.3))) +
          line('M50 92 C50 78 49 64 50 48', easeInOut(over(t, 0.4, 0.4))) +
          leaf('M50 62 C40 63 28 56 25 42 C38 41 48 48 50 62', 0.7) +
          leaf('M50 50 C56 42 66 34 78 32 C78 44 66 52 50 50', 0.85),
      ),
    ),
  ]
}

/** Typed out behind a caret, which then blinks; a pilcrow is drawn beside it. */
function writing(t) {
  const text = 'writing'
  const typed = Math.floor(over(t, 0.12, 0.6) * text.length + 0.001)
  const blinking = t > 0.12 + 0.6 + 0.1
  const caretOn = !blinking || Math.floor((t - 0.82) / 0.32) % 2 === 1
  const caret = (edge) =>
    h('div', {
      display: 'flex',
      position: 'absolute',
      [edge]: -6,
      top: SIZE * 0.2,
      width: 5,
      height: SIZE * 0.82,
      borderRadius: 2,
      backgroundColor: SLATE_MIST,
      opacity: caretOn ? 1 : 0,
    })
  const letters = word(text, (k) => ({
    style: { opacity: k < typed ? 1 : 0 },
    // The caret rides on the last letter typed, or waits before the first.
    on: typed === 0 ? (k === 0 ? [caret('left')] : []) : k === typed - 1 ? [caret('right')] : [],
  }))
  // The bowl and the bar over it in one stroke, then the two stems.
  return [
    ...letters,
    beside(
      art(
        line('M48 54 C34 54 24 46 24 33 C24 20 34 12 48 12 H74', easeInOut(over(t, 0.55, 0.5))) +
          line('M50 12 V90', easeOut(over(t, 0.9, 0.3))) +
          line('M68 12 V90', easeOut(over(t, 1.05, 0.3))),
      ),
    ),
  ]
}

/** Each letter cycles through random characters before settling, left to right, between braces. */
function code(t) {
  const SCRAMBLE = 'abcdefghjkmnopqrstuvwxyz0123456789{}<>/=+*_#$'
  const frameNow = Math.floor(t * FPS / 2)
  const letters = word('code', (k, ch) => {
    const settled = t >= 0.35 + k * 0.16
    const shown = over(t, k * 0.05, 0.12)
    if (settled) return {}
    const glyph = SCRAMBLE[Math.floor(random(frameNow, k) * SCRAMBLE.length)]
    // The real letter holds its place unseen, so the word keeps its width while the stand-in changes.
    return {
      style: { color: 'transparent' },
      on: [
        h(
          'div',
          { position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', color: SLATE_MIST, opacity: shown },
          glyph,
        ),
      ],
    }
  })
  // The braces draw on, then a cursor blinks between them.
  const cursor = t > 1.05 && Math.floor((t - 1.05) / 0.32) % 2 === 0
  return [
    ...letters,
    beside(
      art(
        line('M36 12 C26 12 26 18 26 28 V40 C26 46 22 50 14 50 C22 50 26 54 26 60 V72 C26 82 26 88 36 88', easeInOut(over(t, 0.3, 0.5))) +
          line('M64 12 C74 12 74 18 74 28 V40 C74 46 78 50 86 50 C78 50 74 54 74 60 V72 C74 82 74 88 64 88', easeInOut(over(t, 0.45, 0.5))) +
          (cursor ? `<rect x="44" y="40" width="12" height="22" rx="1.5" fill="${SLATE_MIST}" stroke="none"/>` : ''),
      ),
    ),
  ]
}

// A small bird, facing left: perched with its wing folded, or in flight with it up or down.
const BIRD = 68
const birdBody =
  'M18 34 C18 25 25 20 32 21 C38 22 42 28 48 30 L60 27 L52 36 C48 42 40 46 31 46 C23 46 18 41 18 34' +
  'M18 31 L11 33 L18 35'
const bird = (pose) =>
  art(
    `<path d="${birdBody}"/><circle cx="24" cy="29" r="1.6" fill="${SLATE_MIST}" stroke="none"/>` +
      (pose === 'perched'
        ? '<path d="M28 35 C33 39 40 39 46 35"/><path d="M29 46 V53 M35 46 V53"/>'
        : pose === 'up'
          ? '<path d="M30 29 L40 8 L44 30"/>'
          : '<path d="M30 36 L38 54 L44 34"/>'),
    { size: BIRD, view: 64 },
  )

/** Letters hop in on short arcs and squash as they land; then a bird flies in and lands on the last one. */
function wildlife(t) {
  const text = 'wildlife'
  const LAND = 1.3
  return word(text, (k) => {
    const p = over(t, k * 0.06, 0.34)
    const x = -40 * (1 - easeOut(p))
    const y = -46 * Math.sin(Math.PI * p)
    // A squash on landing, wide and low, springing back.
    const q = Math.sin(Math.PI * over(t, k * 0.06 + 0.34, 0.14))
    const style = {
      transformOrigin: '50% 82%',
      transform: `translate(${x}px, ${y}px) scale(${1 + 0.1 * q}, ${1 - 0.14 * q})`,
      opacity: clamp(p * 4),
    }
    if (k !== text.length - 1) return { style }

    // The last letter dips a little under the bird's weight.
    const dip = 7 * Math.sin(Math.PI * over(t, LAND, 0.3)) * (1 - over(t, LAND + 0.15, 0.3) * 0.4)
    style.transform = `translate(${x}px, ${y + dip}px) scale(${1 + 0.1 * q}, ${1 - 0.14 * q})`

    // In from off the right edge, rising to the perch from below so it never crosses the name, flapping, then wings folded.
    const f = easeOut(over(t, 0.55, LAND - 0.55))
    const flying = t < LAND
    const pose = flying ? (Math.floor(t / 0.09) % 2 ? 'up' : 'down') : 'perched'
    const bx = 560 * (1 - f)
    const by = 40 * (1 - f) ** 2
    const perch = h(
      'div',
      {
        position: 'absolute',
        left: '50%',
        top: SIZE * 0.42 - BIRD * 0.68,
        marginLeft: -BIRD * 0.36,
        display: 'flex',
        transform: `translate(${bx}px, ${by}px)`,
        opacity: t > 0.55 ? 1 : 0,
      },
      bird(pose),
    )
    return { style, on: [perch] }
  })
}

/** Stars scattered over the card, each fading in at its own time and twinkling. */
const STARS = Array.from({ length: 34 }, (_, k) => ({
  x: 40 + random(k, 1) * (W - 80),
  y: 30 + random(k, 2) * (H - 60),
  r: 1.2 + random(k, 3) ** 2 * 2.2,
  from: random(k, 4) * 0.9,
  rate: 0.8 + random(k, 5) * 1.6,
  phase: random(k, 6) * Math.PI * 2,
}))

function sky(t, night) {
  const stars = STARS.map(({ x, y, r, from, rate, phase }) => {
    const glow = over(t, from, 0.5) * (0.65 + 0.35 * Math.sin(phase + t * rate * Math.PI * 2)) * night
    return glow > 0.01 ? `<circle cx="${x}" cy="${y}" r="${r}" fill="${CREAM}" opacity="${glow.toFixed(3)}"/>` : ''
  }).join('')
  // One shooting star across the top right, its tail fading behind it.
  const s = over(t, 1.05, 0.45)
  let streak = ''
  if (s > 0 && s < 1) {
    const at = (p) => [1100 - 380 * p, 60 + 150 * p]
    const [hx, hy] = at(easeIn(s * 0.6 + 0.4 * s * s))
    const [tx, ty] = at(Math.max(0, easeIn(s * 0.6 + 0.4 * s * s) - 0.45))
    const fade = Math.sin(Math.PI * s)
    streak =
      `<defs><linearGradient id="tail" gradientUnits="userSpaceOnUse" x1="${tx}" y1="${ty}" x2="${hx}" y2="${hy}">` +
      `<stop offset="0" stop-color="${CREAM}" stop-opacity="0"/><stop offset="1" stop-color="${CREAM}" stop-opacity="${fade}"/></linearGradient></defs>` +
      `<line x1="${tx}" y1="${ty}" x2="${hx}" y2="${hy}" stroke="url(#tail)" stroke-width="3" stroke-linecap="round"/>`
  }
  return img(
    `data:image/svg+xml;base64,${Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${stars}${streak}</svg>`,
    ).toString('base64')}`,
    W,
    H,
    { position: 'absolute', left: 0, top: 0 },
  )
}

/** The letters come out in no order, each at its own pace, like stars. */
function nightSky(t) {
  return word('the night sky', (k) => {
    const from = random(k, 7) * 0.7
    const span = 0.25 + random(k, 8) * 0.45
    return { style: { opacity: easeInOut(over(t, from, span)) } }
  })
}

const LINES = { startups, writing, code, wildlife, 'the night sky': nightSky }

// --- Frame -----------------------------------------------------------------

function frame(i, portrait) {
  const seconds = (i / FPS + START) % LENGTH
  const turn = Math.floor(seconds / TURN)
  const t = seconds - turn * TURN
  const interest = INTERESTS[turn]

  // Every interest leaves the same way: a short fade and a small drop.
  const leaving = easeIn(over(t, TURN - EXIT, EXIT))
  // The card darkens as the night sky comes out, and brightens as it goes.
  const night = interest === 'the night sky' ? easeInOut(over(t, 0, 0.6)) * (1 - easeInOut(over(t, TURN - EXIT - 0.1, EXIT + 0.1))) : 0

  const markup = card(
    portrait,
    h(
      'div',
      { display: 'flex', flexDirection: 'column', fontSize: SIZE, fontWeight: 600, letterSpacing: TRACKING },
      h('div', { display: 'flex', height: LINE, alignItems: 'center', color: CREAM }, 'Colin Armstrong'),
      h(
        'div',
        {
          display: 'flex',
          height: LINE,
          alignItems: 'center',
          color: SLATE_MIST,
          opacity: 0.72 * (1 - leaving),
          transform: `translateY(${14 * leaving}px)`,
        },
        ...LINES[interest](t),
      ),
    ),
  )
  // The night's background and stars go behind everything else on the card.
  if (night > 0) {
    markup.props.style.backgroundColor = mix(DEEP, NIGHT, night)
    markup.props.children = [sky(t, night), ...markup.props.children]
  }
  return markup
}

/** One frame as a PNG, `i` frames into the video. */
export async function still(i, portrait) {
  const svg = await satori(frame(i, portrait), { width: W, height: H, fonts: FONTS })
  return new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng()
}

async function main() {
  const portrait = await face()
  mkdirSync(join(OUT, '..'), { recursive: true })

  // H.264 in an MP4 with no sound and the index up front, which is what
  // iMessage's link previews play.
  const ffmpeg = spawn(
    'ffmpeg',
    [
      ...['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', FPS, '-i', '-'],
      ...['-c:v', 'libx264', '-preset', 'veryslow', '-tune', 'animation', '-crf', '18'],
      ...['-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', OUT],
    ].map(String),
    { stdio: ['pipe', 'inherit', 'inherit'] },
  )
  const done = new Promise((resolve, reject) =>
    ffmpeg.on('close', (code) => (code ? reject(new Error(`ffmpeg exited with ${code}`)) : resolve())),
  )

  for (let i = 0; i < FRAMES; i++) {
    const png = await still(i, portrait)
    if (!ffmpeg.stdin.write(png)) await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve))
    if (i % FPS === 0) process.stdout.write(`\r  frame ${i}/${FRAMES}`)
  }
  ffmpeg.stdin.end()
  await done
  console.log(`\r  wrote ${OUT}`)
}

// Contact sheets import still() to check frames without making the video.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

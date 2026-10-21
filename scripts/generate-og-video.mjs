// The home page's share video (og:video), on the share cards' layout: the
// domain at the top, the portrait, and Colin's name, with a line under it
// that cycles through what he does. Each role's letters lift away in a wave,
// and the next role's rise into place behind them.
//
// iMessage plays og:video inline (Discord and Telegram do too); everything
// else shows og:image. The video needs ffmpeg, which the build image lacks, so
// it's made by hand and checked in: `npm run og:video` after changing it.
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { CREAM, FONTS, H, SLATE_MIST, W, card, h, portrait as face } from './generate-og.mjs'

const OUT = join(import.meta.dirname, '..', 'public', 'video', 'home.mp4')
const FPS = 30

const ROLES = ['Founder', 'CEO', 'Engineer', 'Builder', 'Photographer', 'Writer', 'Angel investor']
// Each role holds, then hands over to the next in the last part of its turn.
const TURN = 1.8
const CHANGE = 0.7
const FRAMES = Math.round(FPS * TURN * ROLES.length)

const SIZE = 104
const LINE = Math.round(SIZE * 1.12)
// How far a role travels as it leaves or arrives.
const LIFT = 22
const TRACKING = -SIZE * 0.035

// --- Timing ----------------------------------------------------------------

const clamp = (x) => Math.min(1, Math.max(0, x))
const easeOut = (x) => 1 - (1 - clamp(x)) ** 3
const easeIn = (x) => clamp(x) ** 3

// --- Frame -----------------------------------------------------------------

/**
 * A role set letter by letter, so each letter can move on its own. `place`
 * gives a letter's offset and opacity from its index and the word's length.
 */
function roleLine(word, place = () => ({ y: 0, opacity: 1 })) {
  const letters = [...word]
  return h(
    'div',
    { display: 'flex', position: 'absolute', left: 0, top: 0, height: LINE, alignItems: 'center' },
    ...letters.map((ch, k) => {
      const { y, opacity } = place(k, letters.length)
      // The tracking goes between letters as a margin, since a letter on its own has nothing to track against.
      return h(
        'div',
        {
          display: 'flex',
          whiteSpace: 'pre',
          letterSpacing: 0,
          marginRight: TRACKING,
          transform: `translateY(${y}px)`,
          opacity,
        },
        ch,
      )
    }),
  )
}

/** How far apart the letters set off, so a long role takes no longer than a short one. */
const stagger = (n, spread, most) => (n > 1 ? Math.min(most, spread / (n - 1)) : 0)

function frame(i, portrait) {
  const seconds = i / FPS
  const turn = Math.floor(seconds / TURN)
  const into = seconds - turn * TURN
  const role = ROLES[turn % ROLES.length]
  const next = ROLES[(turn + 1) % ROLES.length]
  // Where the handover is, 0 → 1 over the last CHANGE seconds of the turn.
  const change = clamp((into - (TURN - CHANGE)) / CHANGE)

  const lines = []
  if (change === 0) lines.push(roleLine(role))
  else {
    // The old role's letters lift away one after another, left to right,
    // and the new role's rise into place behind them in a wave.
    lines.push(
      roleLine(role, (k, n) => {
        const p = easeIn((change - k * stagger(n, 0.12, 0.025)) / 0.18)
        return { y: -LIFT * p, opacity: 1 - p }
      }),
      roleLine(next, (k, n) => {
        const p = easeOut((change - 0.26 - k * stagger(n, 0.26, 0.035)) / 0.4)
        return { y: LIFT * 1.3 * (1 - p), opacity: p }
      }),
    )
  }

  // The share card's layout (generate-og.mjs), with the roles in a line as big as the name.
  return card(
    portrait,
    h(
      'div',
      { display: 'flex', flexDirection: 'column', fontSize: SIZE, fontWeight: 600, letterSpacing: TRACKING },
      h('div', { display: 'flex', height: LINE, alignItems: 'center', color: CREAM }, 'Colin Armstrong'),
      h('div', { display: 'flex', position: 'relative', height: LINE, color: SLATE_MIST, opacity: 0.72 }, ...lines),
    ),
  )
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
    const svg = await satori(frame(i, portrait), { width: W, height: H, fonts: FONTS })
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng()
    if (!ffmpeg.stdin.write(png)) await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve))
    if (i % FPS === 0) process.stdout.write(`\r  frame ${i}/${FRAMES}`)
  }
  ffmpeg.stdin.end()
  await done
  console.log(`\r  wrote ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

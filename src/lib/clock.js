// One animation clock. GSAP's ticker is the only owner of requestAnimationFrame: GSAP and
// ScrollTrigger run on it, Lenis (smooth wheel scrolling) is stepped from it, and so is the
// 3D render (<Canvas frameloop="never"> + advance). Nothing else runs its own loop.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { advance } from '@react-three/fiber'
import { useStore } from '../store'
import { isBusy } from './busy'

gsap.registerPlugin(ScrollTrigger)
gsap.ticker.lagSmoothing(0)

let lenis = null
let started = false

// How often the 3D is drawn. At most 60 times a second: on a 90–144 Hz screen the ticker runs at the
// screen's rate, and drawing every tick cost the GPU up to 2.4 times as much for motion this slow.
// When nobody has touched the page for a while and the camera has nowhere to go ("calm": reading a
// stop card, the explorer left alone), 30 is plenty for the pulsing markers, and 15 with animations
// stopped. Any input brings the full rate straight back. Halving the frames at rest is what keeps a
// laptop cool and a phone's battery going while someone reads.
const FULL_MS = 1000 / 60, CALM_MS = 1000 / 30, STILL_MS = 1000 / 15
const CALM_AFTER_MS = 1500
let lastInput = 0, owed = 0, lastTick = 0, calm = false
const wake = () => { lastInput = performance.now() }
/** True while the 3D is drawn at a reduced rate: at rest, or with the battery saver on
 *  (Resolution.jsx ignores those frames' timing). */
export const isCalm = () => calm || useStore.getState().settings.saver

/** Smooth wheel scrolling only while motion is on (Stop animations and reduced motion get native scroll). */
function syncLenis(motion) {
  if (motion === 'on' && !lenis) {
    lenis = new Lenis({ autoRaf: false, anchors: false })
    lenis.on('scroll', ScrollTrigger.update)
  } else if (motion === 'off' && lenis) {
    lenis.destroy()
    lenis = null
  }
}

export function startClock() {
  if (started) return
  started = true
  syncLenis(useStore.getState().motion)
  useStore.subscribe((s, prev) => {
    if (s.motion !== prev.motion) syncLenis(s.motion)
    wake() // anything the page changes (a layer, a route, a selection) is drawn at once
  })
  for (const type of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart', 'touchmove', 'scroll', 'resize'])
    window.addEventListener(type, wake, { passive: true, capture: true })
  gsap.ticker.add((time) => {
    if (lenis) lenis.raf(time * 1000)
    // the reading sections and the overview cover the stage: don't draw what nobody sees
    // (battery on phones and laptops); the last frame stays up, dimmed. Except while a mountain is
    // still loading: its heightmap and textures go to the GPU a band per frame, and a reload that
    // lands in the reading sections (the browser restores the scroll) left the loader up for good.
    const s = useStore.getState()
    if ((s.mode === 'idle' || s.overviewOpen || s.searchOpen || s.correctionOpen) && s.terrainReady) return
    const now = time * 1000
    const dt = lastTick ? Math.min(now - lastTick, 100) : FULL_MS
    lastTick = now
    // the hero turns by itself: always the full rate there, as while flying or loading
    calm = s.mode !== 'hero' && !s.flying && !s.loupeHold && performance.now() - lastInput > CALM_AFTER_MS && !isBusy()
    // the battery saver (settings) halves both rates
    const saver = s.settings.saver ? 2 : 1
    const every = (calm ? (s.motion === 'off' ? STILL_MS : CALM_MS) : FULL_MS) * saver
    owed += dt
    if (owed < every - 1.5) return // 1.5 ms of slack: a 60 Hz tick that comes a little early still draws
    owed = Math.min(owed - every, every)
    advance(time)
  })
}

let locks = 0
/** A modal dialog is open: the page under it stays put (native scroll and Lenis both). */
export function lockScroll(on) {
  locks = Math.max(0, locks + (on ? 1 : -1))
  const locked = locks > 0
  document.documentElement.classList.toggle('is-locked', locked)
  if (lenis) { if (locked) lenis.stop(); else lenis.start() }
}

/** Jump the page to y without animation, whether or not Lenis is running. */
export function jumpTo(y) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
  else window.scrollTo(0, y) // (Safari before 16 rejects behavior: 'instant')
}

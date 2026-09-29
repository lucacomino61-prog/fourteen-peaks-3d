// One animation clock. GSAP's ticker is the only owner of requestAnimationFrame: GSAP and
// ScrollTrigger run on it, Lenis (smooth wheel scrolling) is stepped from it, and so is the
// 3D render (<Canvas frameloop="never"> + advance). Nothing else runs its own loop.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { advance } from '@react-three/fiber'
import { useStore } from '../store'

gsap.registerPlugin(ScrollTrigger)
gsap.ticker.lagSmoothing(0)

let lenis = null
let started = false

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
  useStore.subscribe((s, prev) => { if (s.motion !== prev.motion) syncLenis(s.motion) })
  gsap.ticker.add((time) => {
    if (lenis) lenis.raf(time * 1000)
    // the reading sections and the overview cover the stage: don't draw what nobody sees
    // (battery on phones and laptops); the last frame stays up, dimmed
    const s = useStore.getState()
    if (s.mode === 'idle' || s.overviewOpen) return
    advance(time)
  })
}

/** Jump the page to y without animation, whether or not Lenis is running. */
export function jumpTo(y) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
  else window.scrollTo(0, y) // (Safari before 16 rejects behavior: 'instant')
}

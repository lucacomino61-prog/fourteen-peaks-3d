import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { isBusy } from '../lib/busy'

// Rendering resolution for every screen: a pixel budget per quality tier keeps a 4K monitor or a
// 3× phone from drawing millions of pixels the GPU can't afford, and the frame time steers it
// from there: below ~45 fps it steps down (to 0.75 at worst), holding 60 fps it tries a step up,
// and if that step costs frames it steps back and stays. Changes are rare (each resizes the
// drawing buffer, one long frame), and frames taken while a mountain loads don't count.
const BUDGET = { high: 8.5e6, medium: 2.4e6, low: 1.6e6 } // drawing-buffer pixels (8.5 MP = a 4K screen)
const CEILING = { high: 2, medium: 1.5, low: 2 }
const START = { high: 1.5, medium: 1, low: 1.25 }
const FLOOR = 0.75
const STEP = 0.25
const WINDOW_S = 2.5

export default function Resolution({ tier }) {
  const setDpr = useThree((s) => s.setDpr)
  const { width, height } = useThree((s) => s.size)
  const st = useRef({ dpr: 0, t: 0, n: 0, cooldown: 0, lockedAt: Infinity, probing: false })

  // the most this screen may get: device pixels, the tier's ceiling, the pixel budget
  const maxDpr = Math.max(FLOOR, Math.min(window.devicePixelRatio || 1, CEILING[tier], Math.sqrt(BUDGET[tier] / Math.max(1, width * height))))

  useEffect(() => {
    const s = st.current
    const next = s.dpr ? Math.min(s.dpr, maxDpr) : Math.min(START[tier], maxDpr)
    if (next !== s.dpr) { s.dpr = next; setDpr(next) }
  }, [maxDpr, tier, setDpr])

  useFrame((_, dt) => {
    const s = st.current
    // loading, a stall or a hidden tab says nothing about the GPU: start the window again
    if (isBusy()) { s.t = 0; s.n = 0; return }
    if (document.hidden || dt > 0.25) return
    s.t += dt; s.n++
    if (s.t < WINDOW_S) return
    const ms = (s.t / s.n) * 1000
    s.t = 0; s.n = 0
    if (s.cooldown > 0) { s.cooldown--; return }
    let next = s.dpr
    if (ms > 22 && s.dpr > FLOOR) {
      next = Math.max(FLOOR, s.dpr - STEP) // struggling: fewer pixels
      if (s.probing) s.lockedAt = next // the step up cost frames: don't try it again
      s.probing = false
    } else if (ms < 17.8 && s.dpr + STEP <= maxDpr && s.dpr + STEP <= s.lockedAt) {
      next = s.dpr + STEP // holding 60 fps: try a little sharper
      s.probing = true
    } else s.probing = false
    if (next !== s.dpr) { s.dpr = next; setDpr(next); s.cooldown = 1 }
  })
  return null
}

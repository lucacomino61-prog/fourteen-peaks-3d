import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { isBusy } from '../lib/busy'
import { isCalm } from '../lib/clock'
import { useStore } from '../store'

// Rendering resolution for every screen: a pixel budget per quality tier keeps a 4K monitor or a
// 3× phone from drawing millions of pixels the GPU can't afford, and the frame time steers it
// from there: below ~45 fps it steps down (to 0.75 at worst), holding 60 fps it tries a step up,
// and if that step costs frames it steps back and stays. Changes are rare (each resizes the
// drawing buffer, one long frame), and frames taken while a mountain loads don't count.
//
// A GPU that can't keep up at all gets a rescue instead, loading or not: when most of the last
// frames took over 120 ms (under ~8 fps), the resolution drops at once, down to half the device
// pixels, and if that is still too slow the scene switches to its lightest tier (onStruggle). The
// normal steps above ignore such frames (a single long one is a stall, not the GPU's speed), so
// without this a slow GPU never got relief and the page seemed frozen (the Safari engine at
// Retina density drew 2-4 frames a second and stayed at full resolution).
const BUDGET = { high: 8.5e6, medium: 2.4e6, low: 1.6e6 } // drawing-buffer pixels (8.5 MP = a 4K screen)
const CEILING = { high: 2, medium: 1.5, low: 2 }
const START = { high: 1.5, medium: 1, low: 1.25 }
const FLOOR = 0.75
const STEP = 0.25
const WINDOW_S = 2.5
const SLOW_MS = 120 // a frame this slow is far below any usable rate
const RESCUE_FLOOR = 0.5

// The chosen ratio goes to the store and from there to <Canvas dpr> (Scene.jsx): R3F re-applies the
// Canvas's dpr prop on every render of the scene, so a ratio set on the side (state.setDpr) was
// undone by the next mode change and the steps down never stuck.
const setDpr = (dpr) => useStore.setState({ dpr })

export default function Resolution({ tier, onStruggle }) {
  const { width, height } = useThree((s) => s.size)
  const st = useRef({ dpr: 0, t: 0, n: 0, cooldown: 0, lockedAt: Infinity, probing: false })
  const recent = useRef([]) // the last frame times, ms

  // the most this screen may get: device pixels, the tier's ceiling, the pixel budget
  const maxDpr = Math.max(FLOOR, Math.min(window.devicePixelRatio || 1, CEILING[tier], Math.sqrt(BUDGET[tier] / Math.max(1, width * height))))

  useEffect(() => {
    const s = st.current
    const next = s.dpr ? Math.min(s.dpr, maxDpr) : Math.min(START[tier], maxDpr)
    if (next !== s.dpr) { s.dpr = next; setDpr(next) }
  }, [maxDpr, tier])

  useFrame((_, dt) => {
    const s = st.current
    // a hidden tab, or frames spaced out on purpose while the page is at rest (lib/clock.js):
    // their timing says nothing about the GPU
    if (document.hidden || isCalm()) { recent.current.length = 0; s.t = 0; s.n = 0; return }

    // the rescue: 6 of the last 8 frames too slow
    const r = recent.current
    r.push(dt * 1000)
    if (r.length > 8) r.shift()
    if (r.length === 8 && r.filter((ms) => ms > SLOW_MS).length >= 6) {
      r.length = 0
      s.t = 0; s.n = 0; s.probing = false; s.cooldown = 1
      if (s.dpr > RESCUE_FLOOR + 0.01) {
        const next = Math.max(RESCUE_FLOOR, Math.min(s.dpr - STEP, s.dpr * 0.6))
        s.dpr = next
        setDpr(next)
      } else onStruggle?.()
      return
    }

    // the normal steps: loading, a stall or a hidden tab says nothing about the GPU
    if (isBusy()) { s.t = 0; s.n = 0; return }
    if (dt > 0.25) return
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

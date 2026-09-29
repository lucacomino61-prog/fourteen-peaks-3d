import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Map-style label placement for the <Html> markers: a label whose text would land on a more
// important one hides its text; its dot or icon stays, and still opens the detail sheet.
// Order: the summit, the active route's camps, hazards, then the dimmed camps of other routes.
const RANK = ['.mk-summit', '.mk:not(.mk-dim)', '.hz', '.mk-dim']
const GAP = 4 // px of clearance a hidden label needs before its text comes back (no flicker)

export default function Declutter() {
  const tick = useRef(0)
  useFrame(({ gl, events }, dt) => {
    tick.current += dt
    if (tick.current < 0.2) return
    tick.current = 0
    // where drei's <Html> puts its elements: the element events are connected to
    const root = events.connected || gl.domElement.parentNode
    if (!root) return
    const seen = new Set()
    const placed = []
    for (const sel of RANK) {
      for (const el of root.querySelectorAll(sel)) {
        if (seen.has(el)) continue
        seen.add(el)
        if (el.dataset.hidden === '1') continue
        const text = el.querySelector('.mk-label, .hz-label')
        if (!text) continue
        const r = text.getBoundingClientRect()
        const pad = el.dataset.crowded === '1' ? GAP : 0
        const hit = placed.some((p) => r.left - pad < p.right && p.left < r.right + pad && r.top - pad < p.bottom && p.top < r.bottom + pad)
        el.dataset.crowded = hit ? '1' : '0'
        if (!hit) placed.push(r)
      }
    }
  })
  return null
}

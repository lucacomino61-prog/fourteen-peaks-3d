import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { loupe } from '../lib/loupe'

// Map-style label placement for the <Html> markers: a label whose text would land on a more
// important one hides its text; its dot or icon stays, and still opens the detail sheet.
// Order: the loupe and its read-out (nothing is written across the map in the lens), the
// interface floating over the 3D (route tabs, the stop card, the altimeter, the explorer's panel
// and sheet, the hero's controls), the summit, the active route's camps, hazards, then the dimmed
// camps of other routes. A marker that would sit under the nav bar hides altogether: the nav's
// pills are see-through, and a name read through them looked broken.
const RANK = ['.mk-summit', '.mk:not(.mk-dim)', '.hz', '.mk-dim']
const UI = ['.ascent-tabs', '.ascent-card.is-active', '.ascent[data-active="1"] .altimeter', '.panel', '.detail.is-open', '.explorer-continue', '.hero-min', '.hero-side', '.hero > .switch', '.routes-menu.is-open', '.consent']
const GAP = 4 // px of clearance a hidden label needs before its text comes back (no flicker)
const LENS_MARGIN = 24 // px around the loupe kept clear of names

export default function Declutter() {
  const tick = useRef(0)
  useFrame(({ gl, events }, dt) => {
    tick.current += dt
    const lens = loupe.ring?.dataset.on === '1'
    if (tick.current < (lens ? 0.08 : 0.2)) return // keep up with a moving loupe
    tick.current = 0
    // where drei's <Html> puts its elements: the element events are connected to
    const root = events.connected || gl.domElement.parentNode
    if (!root) return
    const placed = []
    if (lens) {
      const o = loupe.ring.getBoundingClientRect()
      placed.push({ left: o.left - LENS_MARGIN, right: o.right + LENS_MARGIN, top: o.top - LENS_MARGIN, bottom: o.bottom + LENS_MARGIN })
      if (loupe.read) placed.push(loupe.read.getBoundingClientRect())
    }
    // the interface over the 3D, where it is on screen and showing
    const vh = window.innerHeight
    for (const sel of UI) {
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height || r.bottom <= 0 || r.top >= vh) continue
        if (getComputedStyle(el).opacity === '0') continue
        placed.push(r)
      }
    }
    const navBottom = document.querySelector('.nav')?.getBoundingClientRect().bottom || 0
    for (const el of root.querySelectorAll('.mk, .hz')) {
      const under = el.getBoundingClientRect().top < navBottom ? '1' : '0'
      if (el.dataset.under !== under) el.dataset.under = under
    }
    const seen = new Set()
    for (const sel of RANK) {
      for (const el of root.querySelectorAll(sel)) {
        if (seen.has(el)) continue
        seen.add(el)
        if (el.dataset.hidden === '1' || el.dataset.under === '1') continue
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

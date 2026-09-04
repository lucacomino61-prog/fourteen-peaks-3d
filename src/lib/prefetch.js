// Background warm-up of the other mountains once the current one is ready: the browser cache
// then serves every later switch instantly. One file at a time, low priority, skipped on
// data-saver or slow connections, and restarted from the new position whenever the user switches.
import { mountains } from '../data'

const TIER_FILES = {
  high: ['albedo.webp', 'detail16.webp', 'detail17.webp'],
  medium: ['albedo-2k.webp', 'detail16-2k.webp', 'detail17.webp'],
  low: ['albedo-2k.webp'],
}
const FIRST = ['height-lo.q16', 'light.webp', 'albedo-1k.webp', 'thumb.webp', 'height.q16']

let controller = null
const done = new Set()

export function warmOthers(currentId, quality) {
  if (controller) controller.abort()
  const c = navigator.connection
  if (c && (c.saveData || /^(slow-)?2g$|^3g$/.test(c.effectiveType || ''))) return
  controller = new AbortController()
  const { signal } = controller
  const i = mountains.findIndex((m) => m.id === currentId)
  // next, previous, then the rest in order
  const order = [...mountains.slice(i + 1), ...mountains.slice(0, i)]
  const files = [...FIRST, ...(TIER_FILES[quality] || TIER_FILES.medium)]
  ;(async () => {
    for (const m of order) {
      for (const f of files) {
        const url = `/terrain/${m.id}/${f}`
        if (done.has(url)) continue
        if (signal.aborted) return
        try {
          await fetch(url, { signal, priority: 'low', cache: 'force-cache' })
          done.add(url)
        } catch { if (signal.aborted) return }
        await new Promise((r) => (window.requestIdleCallback || ((fn) => setTimeout(fn, 200)))(r))
      }
    }
  })()
}

export function stopWarming() { if (controller) controller.abort() }

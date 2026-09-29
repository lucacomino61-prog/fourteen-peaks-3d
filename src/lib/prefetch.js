// Once a mountain is up, fetch what the arrows need next: the first-paint files of the next and
// previous mountains (about 0.7 MB each), so a switch paints at once from the browser cache.
// Everything else streams in only when a mountain is actually opened. One file at a time, low
// priority, skipped on data-saver or slow connections, restarted whenever the user switches.
import { mountains } from '../data'

// what loadTerrain and the first frame of the terrain need
const FIRST_PAINT = ['height.json', 'detail16.json', 'detail17.json', 'height-lo.q16', 'albedo-1k.webp']

let controller = null
const done = new Set()

export function warmNeighbours(currentId) {
  if (controller) controller.abort()
  const c = navigator.connection
  if (c && (c.saveData || /^(slow-)?2g$|^3g$/.test(c.effectiveType || ''))) return
  controller = new AbortController()
  const { signal } = controller
  const i = mountains.findIndex((m) => m.id === currentId)
  const n = mountains.length
  const neighbours = new Set([mountains[(i + 1) % n], mountains[(i - 1 + n) % n]])
  const idle = () => new Promise((r) => (window.requestIdleCallback || ((fn) => setTimeout(fn, 200)))(r))
  ;(async () => {
    for (const m of neighbours) {
      for (const f of FIRST_PAINT) {
        const url = `/terrain/${m.id}/${f}`
        if (done.has(url)) continue
        if (signal.aborted) return
        try {
          await fetch(url, { signal, priority: 'low', cache: 'force-cache' })
          done.add(url)
        } catch { if (signal.aborted) return }
        await idle()
      }
    }
  })()
}

// Terrain textures as raw RGBA pixels, decoded in a worker (lib/pixelWorker.js).
//
// Handing the GPU a decoded 2K image in one call (texImage2D with an ImageBitmap) froze the page
// for 50–290 ms per texture on an integrated GPU. Raw rows can go up a band per frame instead
// (scene/Terrain.jsx), and nothing is decoded on the main thread.

let worker = null, seq = 0
const waiting = new Map()

/**
 * Resolves with { w, h, data: Uint8Array } (RGBA, bottom row first), { missing: true } for a file
 * that isn't there, or null where this can't be done (no worker, OffscreenCanvas or
 * createImageBitmap in workers): the caller then falls back to its own loader.
 */
export function loadPixels(url) {
  if (worker === false || typeof Worker === 'undefined') return Promise.resolve(null)
  if (!worker) {
    try {
      worker = new Worker(new URL('./pixelWorker.js', import.meta.url), { type: 'module' })
      worker.onmessage = ({ data }) => {
        const done = waiting.get(data.id)
        waiting.delete(data.id)
        if (data.unsupported) worker = false
        done?.(data.buf ? { w: data.w, h: data.h, data: new Uint8Array(data.buf) } : data.missing ? { missing: true } : null)
      }
      worker.onerror = () => {
        worker = false
        for (const done of waiting.values()) done(null)
        waiting.clear()
      }
    } catch {
      worker = false
      return Promise.resolve(null)
    }
  }
  const id = ++seq
  return new Promise((resolve) => {
    waiting.set(id, resolve)
    worker.postMessage({ id, url: new URL(url, location.href).href })
  })
}

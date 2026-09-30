import * as THREE from 'three'
import { makeGeo, sampleHeight } from './geo'
import { decodeQ16 } from './q16'
import { quality } from './quality'
import { useStore } from '../store'

// ---- decoding in a worker (main-thread fallback where workers are unavailable) ----
let worker = null, seq = 0
const waiting = new Map()
function decode(bytes, W, H, scale) {
  if (worker === false || typeof Worker === 'undefined') return Promise.resolve(decodeQ16(new Uint8Array(bytes), W, H, scale))
  if (!worker) {
    try {
      worker = new Worker(new URL('./heightWorker.js', import.meta.url), { type: 'module' })
      worker.onmessage = ({ data }) => {
        const w = waiting.get(data.id)
        waiting.delete(data.id)
        if (!w) return
        if (data.error) w.reject(new Error(data.error))
        else w.resolve(new Float32Array(data.buf))
      }
      worker.onerror = () => { worker = false; for (const w of waiting.values()) w.retry(); waiting.clear() }
    } catch { worker = false; return decode(bytes, W, H, scale) }
  }
  const id = ++seq
  const copy = bytes.slice(0) // kept for the fallback if the worker dies before answering
  return new Promise((resolve, reject) => {
    waiting.set(id, { resolve, reject, retry: () => resolve(decodeQ16(new Uint8Array(copy), W, H, scale)) })
    worker.postMessage({ id, bytes, W, H, scale }, [bytes])
  })
}

// ---- the loaded terrains: the most recent few stay, older ones free their memory ----
// A full terrain holds a 16 MB Float32 heightmap plus its 16 MB GPU texture (4 + 4 MB on phones):
// all fourteen would crash a phone's tab, so only the current mountain and the last two visited are
// kept (the last one on phones and tablets, where memory is tighter; a revisit decodes from the
// HTTP cache).
const MAX_TERRAINS = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 2 : 3
const cache = new Map()
const evictListeners = new Set()
/** Called with a mountain id when its terrain leaves the cache (the scene frees its textures). */
export function onTerrainEvicted(fn) { evictListeners.add(fn); return () => evictListeners.delete(fn) }
function remember(id, entry) {
  cache.delete(id)
  cache.set(id, entry) // most recent last
  while (cache.size > MAX_TERRAINS) {
    const [oldId, old] = cache.entries().next().value
    cache.delete(oldId)
    old.lo?.heightTexture.dispose()
    old.full?.heightTexture.dispose()
    evictListeners.forEach((fn) => fn(oldId))
  }
}

function buildTerrain(id, base, meta, detail, detail2, height, W, H, lo) {
  // `height` is already Float32 metres with row 0 = south (v = 0), matching texture v
  const heightTexture = new THREE.DataTexture(height, W, H, THREE.RedFormat, THREE.FloatType)
  heightTexture.magFilter = THREE.LinearFilter
  heightTexture.minFilter = THREE.LinearFilter
  heightTexture.wrapS = heightTexture.wrapT = THREE.ClampToEdgeWrapping
  heightTexture.generateMipmaps = false
  heightTexture.needsUpdate = true

  const geo = makeGeo({ ...meta, width: W, height: H, metresPerPx: meta.metresPerPx * (meta.width / W) })
  const elevationAt = (lat, lon) => {
    const { u, v } = geo.toUv(lat, lon)
    return sampleHeight(height, W, H, u, v)
  }
  const surface = (lat, lon, liftM = 0) => {
    const { u, v } = geo.toUv(lat, lon)
    const { x, z } = geo.uvToScene(u, v)
    const h = sampleHeight(height, W, H, u, v)
    return new THREE.Vector3(x, (h + liftM) / 1000, z)
  }
  const heightAtScene = (x, z) => sampleHeight(height, W, H, x / geo.sizeX + 0.5, 0.5 - z / geo.sizeZ)
  const lineOfSight = (from, to, steps = 48, biasKm = 0.015) => {
    for (let i = 1; i < steps; i++) {
      const t = i / steps
      const x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t, z = from.z + (to.z - from.z) * t
      if (heightAtScene(x, z) / 1000 > y + biasKm) return false
    }
    return true
  }
  const snapToPeak = (lat, lon, radiusM = 300) => {
    const { u, v } = geo.toUv(lat, lon)
    const cx = Math.round(u * (W - 1)), cy = Math.round(v * (H - 1))
    const r = Math.ceil(radiusM / (geo.sizeX * 1000 / W))
    let best = -Infinity, bx = cx, by = cy
    for (let y = Math.max(0, cy - r); y <= Math.min(H - 1, cy + r); y++)
      for (let x = Math.max(0, cx - r); x <= Math.min(W - 1, cx + r); x++) {
        const hh = height[y * W + x]
        if (hh > best) { best = hh; bx = x; by = y }
      }
    const p = geo.uvToScene(bx / (W - 1), by / (H - 1))
    return new THREE.Vector3(p.x, best / 1000, p.z)
  }
  /** Where a ray (unit direction, scene units) first meets the ground inside the tile, or null. */
  const hitTest = (origin, dir, maxKm = 40) => {
    const halfX = geo.sizeX / 2, halfZ = geo.sizeZ / 2
    const above = (t) => origin.y + dir.y * t - heightAtScene(origin.x + dir.x * t, origin.z + dir.z * t) / 1000
    let prev = 0.02, t = prev
    if (above(t) < 0) return null
    while (t < maxKm) {
      t += 0.015 + t * 0.012 // finer close to the camera, coarser far away
      const x = origin.x + dir.x * t, z = origin.z + dir.z * t
      if (Math.abs(x) > halfX || Math.abs(z) > halfZ) return null
      if (above(t) < 0) {
        let a = prev, b = t
        for (let i = 0; i < 10; i++) { const m = (a + b) / 2; if (above(m) < 0) b = m; else a = m }
        return new THREE.Vector3(origin.x + dir.x * b, origin.y + dir.y * b, origin.z + dir.z * b)
      }
      prev = t
    }
    return null
  }
  return { id, base, meta, detail, detail2, geo, height, heightTexture, elevationAt, surface, heightAtScene, lineOfSight, snapToPeak, hitTest, lo }
}

/**
 * Loads a mountain in two stages: a 512² heightmap for the first paint (≈350 KB), then the full
 * one (2048², or 1024² on the low tier). Resolves with the first stage; `onUpgrade(fullTerrain)`
 * fires when the full one is ready.
 * Once fully loaded, later calls resolve with the full terrain immediately.
 */
export async function loadTerrain(id = 'k2', onUpgrade) {
  const base = `/terrain/${id}/`
  if (cache.has(id)) {
    const c = cache.get(id)
    remember(id, c)
    if (c.full) return c.full
    if (onUpgrade) c.waiters.push(onUpgrade)
    return c.lo
  }
  const optional = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null)
  const meta = await fetch(`${base}height.json`).then((r) => r.json())
  const [detail, detail2] = await Promise.all([optional(`${base}detail16.json`), optional(`${base}detail17.json`)])
  const scale = meta.q16?.scale || 0.25
  const fetchQ = (file, W, H) => fetch(`${base}${file}`).then((r) => r.arrayBuffer()).then((b) => decode(b, W, H, scale))
  // the old uncompressed format is stored north row first
  const flipRows = (src, W, H) => { const out = new Float32Array(W * H); for (let y = 0; y < H; y++) out.set(src.subarray((H - 1 - y) * W, (H - y) * W), y * W); return out }

  const entry = { lo: null, full: null, waiters: onUpgrade ? [onUpgrade] : [] }
  remember(id, entry)

  // Phones and weak devices (the low tier) take the 1024² heightmap: one value per 31 m, which is
  // what the 30 m DEM holds; the 2048² one interpolates between those values. 1.2 MB instead of
  // 3.7, and a quarter of the memory and of the decoding. (The store says 'low' too once a GPU that
  // could not keep up was moved to the light tier: the next mountains come lighter as well.)
  const low = quality() === 'low' || useStore.getState().quality === 'low'
  const mid = meta.q16 && meta.mid && low ? meta.mid : null
  const [fullW, fullH] = mid ? [mid.width, mid.height] : [meta.width, meta.height]
  const fullPromise = (meta.q16 ? fetchQ(mid ? 'height-mid.q16' : 'height.q16', fullW, fullH) : fetch(`${base}height.bin`).then((r) => r.arrayBuffer()).then((b) => flipRows(new Float32Array(b), meta.width, meta.height)))
    .then((heights) => {
      const full = buildTerrain(id, base, meta, detail, detail2, heights, fullW, fullH, false)
      performance.mark(`terrain:full:${id}`)
      entry.full = full
      entry.waiters.splice(0).forEach((fn) => { try { fn(full) } catch {} })
      return full
    })

  if (meta.lo && meta.q16) {
    const loHeights = await fetchQ('height-lo.q16', meta.lo.width, meta.lo.height)
    entry.lo = buildTerrain(id, base, meta, detail, detail2, loHeights, meta.lo.width, meta.lo.height, true)
    performance.mark(`terrain:lo:${id}`)
    return entry.lo
  }
  return fullPromise
}

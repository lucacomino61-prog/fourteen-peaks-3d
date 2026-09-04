import * as THREE from 'three'
import { inflateSync } from 'fflate'
import { makeGeo, sampleHeight } from './geo'

/** height.q16: deflated, zig-zag row-delta uint16 quarter-metres → Float32 metres */
function decodeQ16(bytes, meta, W = meta.width, H = meta.height) {
  const scale = meta.q16?.scale || 0.25
  const z = inflateSync(bytes)
  const out = new Float32Array(W * H)
  for (let y = 0; y < H; y++) {
    let prev = 0
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const u = z[i * 2] | (z[i * 2 + 1] << 8)
      const d = (u >>> 1) ^ -(u & 1) // un-zig-zag
      prev = (prev + d) & 0xffff
      out[i] = prev * scale
    }
  }
  return out.buffer
}

const cache = new Map()

function buildTerrain(id, base, meta, detail, detail2, buf, W, H, lo) {
  const src = new Float32Array(buf)
  // flip rows so row 0 = south (v=0), matching texture v
  const height = new Float32Array(W * H)
  for (let y = 0; y < H; y++) height.set(src.subarray((H - 1 - y) * W, (H - y) * W), y * W)

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
  return { id, base, meta, detail, detail2, geo, height, heightTexture, elevationAt, surface, heightAtScene, lineOfSight, snapToPeak, lo }
}

/**
 * Loads a mountain in two stages: a 512² heightmap for the first paint (≈350 KB), then the full
 * 2048² one. Resolves with the first stage; `onUpgrade(fullTerrain)` fires when the full one is ready.
 * Once fully loaded, later calls resolve with the full terrain immediately.
 */
export async function loadTerrain(id = 'k2', onUpgrade) {
  const base = `/terrain/${id}/`
  if (cache.has(id)) {
    const c = cache.get(id)
    if (c.full) return c.full
    if (onUpgrade) c.waiters.push(onUpgrade)
    return c.lo
  }
  const optional = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null)
  const meta = await fetch(`${base}height.json`).then((r) => r.json())
  const [detail, detail2] = await Promise.all([optional(`${base}detail16.json`), optional(`${base}detail17.json`)])
  const fetchQ = (file, W, H) => fetch(`${base}${file}`).then((r) => r.arrayBuffer()).then((b) => decodeQ16(new Uint8Array(b), meta, W, H))

  const entry = { lo: null, full: null, waiters: onUpgrade ? [onUpgrade] : [] }
  cache.set(id, entry)

  const fullPromise = (meta.q16 ? fetchQ('height.q16', meta.width, meta.height) : fetch(`${base}height.bin`).then((r) => r.arrayBuffer()))
    .then((buf) => {
      const full = buildTerrain(id, base, meta, detail, detail2, buf, meta.width, meta.height, false)
      performance.mark(`terrain:full:${id}`)
      entry.full = full
      entry.waiters.splice(0).forEach((fn) => { try { fn(full) } catch {} })
      return full
    })

  if (meta.lo && meta.q16) {
    const loBuf = await fetchQ('height-lo.q16', meta.lo.width, meta.lo.height)
    entry.lo = buildTerrain(id, base, meta, detail, detail2, loBuf, meta.lo.width, meta.lo.height, true)
    performance.mark(`terrain:lo:${id}`)
    return entry.lo
  }
  return fullPromise
}

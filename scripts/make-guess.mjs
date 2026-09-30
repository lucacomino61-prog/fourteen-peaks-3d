// "Guess the mountain" (guess/index.html): a small square of each mountain's elevation model around
// its summit, for the game to draw as a contour map. From the published 1024² heightmap (31 m a
// sample) box-filtered to SIZE² samples over KM km, north row first, in the site's q16 encoding
// (quarter-metres, row deltas, deflated), with the summit given back its surveyed height (the
// correction fading out within 600 m, as scripts/make-skylines.mjs). Plus an index of the fourteen.
//
//   node scripts/make-guess.mjs   → public/guess/<id>.q16, public/guess/index.json
import fs from 'node:fs/promises'
import path from 'node:path'
import { deflateSync, inflateSync } from 'fflate'
import { mountains } from '../src/data/index.js'
import { mountains as italian } from '../src/data/it/index.js'

const KM = 10
const SIZE = 160
const FALLOFF_M = 600

const rad = (d) => (d * Math.PI) / 180
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))

/** q16 → Float32 metres, rows as stored (north first) */
function decode(bytes, W, H, scale) {
  const z = inflateSync(bytes)
  const out = new Float32Array(W * H)
  for (let y = 0; y < H; y++) {
    let prev = 0
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const u = z[i * 2] | (z[i * 2 + 1] << 8)
      prev = (prev + ((u >>> 1) ^ -(u & 1))) & 0xffff
      out[i] = prev * scale
    }
  }
  return out
}

/** Float32 metres (north row first) → q16, as scripts/encode-height.mjs */
function encode(f, W, H) {
  const z = new Uint8Array(W * H * 2)
  for (let y = 0; y < H; y++) {
    let prev = 0
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const q = Math.max(0, Math.min(65535, Math.round(f[i] * 4)))
      const d = ((q - prev) << 16) >> 16
      prev = q
      const u = (d << 1) ^ (d >> 15)
      z[i * 2] = u & 255
      z[i * 2 + 1] = (u >> 8) & 255
    }
  }
  return deflateSync(z, { level: 9 })
}

await fs.mkdir('public/guess', { recursive: true })
const index = []
for (const m of mountains) {
  const dir = path.join('public/terrain', m.id)
  const meta = JSON.parse(await fs.readFile(path.join(dir, 'height.json'), 'utf8'))
  const W = meta.mid.width, H = meta.mid.height
  const mpp = meta.metresPerPx * (meta.width / W)
  const h = decode(await fs.readFile(path.join(dir, 'height-mid.q16')), W, H, meta.q16?.scale || 0.25)
  const { bbox } = meta
  const u0 = (m.peak.lon - bbox.west) / (bbox.east - bbox.west)
  const v0 = (mercY(bbox.north) - mercY(m.peak.lat)) / (mercY(bbox.north) - mercY(bbox.south)) // 0 = north row
  let cx = Math.round(u0 * (W - 1)), cy = Math.round(v0 * (H - 1)), top = -Infinity
  const r = Math.ceil(300 / mpp)
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (h[y * W + x] > top) { top = h[y * W + x]; cx = x; cy = y }
  const gap = Math.max(0, m.peak.elevation - top)
  const at = (x, y) => {
    const fx = Math.min(Math.max(x, 0), W - 1), fy = Math.min(Math.max(y, 0), H - 1)
    const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(x0 + 1, W - 1), y1 = Math.min(y0 + 1, H - 1)
    const tx = fx - x0, ty = fy - y0
    const v = (h[y0 * W + x0] * (1 - tx) + h[y0 * W + x1] * tx) * (1 - ty) + (h[y1 * W + x0] * (1 - tx) + h[y1 * W + x1] * tx) * ty
    return v + gap * Math.max(0, 1 - (Math.hypot(fx - cx, fy - cy) * mpp) / FALLOFF_M)
  }
  // SIZE² samples over KM km, centred on the summit (the tile is 32 km: always inside it)
  const span = (KM * 1000) / mpp // heightmap samples across the square
  const out = new Float32Array(SIZE * SIZE)
  let lo = Infinity, hi = -Infinity
  for (let j = 0; j < SIZE; j++) for (let i = 0; i < SIZE; i++) {
    // each sample is the mean of a 3×3 patch under it (a box filter, so no contour aliasing)
    let s = 0
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += at(cx - span / 2 + ((i + 0.5 + dx / 3) / SIZE) * span, cy - span / 2 + ((j + 0.5 + dy / 3) / SIZE) * span)
    const v = s / 9
    out[j * SIZE + i] = v
    lo = Math.min(lo, v); hi = Math.max(hi, v)
  }
  // the box filter blunts the summit again: the highest sample is set to the surveyed height
  let k = 0
  for (let i = 1; i < out.length; i++) if (out[i] > out[k]) k = i
  out[k] = m.peak.elevation
  const bytes = encode(out, SIZE, SIZE)
  await fs.writeFile(`public/guess/${m.id}.q16`, bytes)
  // the Italian page's hints name the range and the countries in Italian (src/data/it/)
  const it = italian[m.id]?.peak || {}
  index.push({ id: m.id, name: m.peak.name, elevation: m.peak.elevation, range: m.peak.range, countries: m.peak.countries, it: { range: it.range || m.peak.range, countries: it.countries || m.peak.countries }, lo: Math.round(lo), hi: Math.round(Math.max(hi, m.peak.elevation)) })
  console.log(`${m.id.padEnd(14)} ${(bytes.length / 1024).toFixed(1)} KB  ${Math.round(lo)}–${m.peak.elevation} m`)
}
await fs.writeFile('public/guess/index.json', JSON.stringify({ km: KM, size: SIZE, mountains: index }))
console.log('public/guess/index.json')

// The fourteen side by side (ui/Overview.jsx, "Side by side"): each mountain's outline, cut from its
// own elevation model. Seen from the south: for every column of the heightmap within ±HALF_KM of
// the summit, west to east, the highest ground within ±BAND_KM north or south of the summit's row,
// so the massif stands on its own and a higher neighbour a few kilometres away (Everest behind
// Lhotse) stays out. The model rounds the summits off (src/lib/calibrate.js): the summit gets its
// surveyed height back, the correction fading out within FALLOFF_M of it. (The page's own ramp,
// which lifts everything in the top kilometre, would lift a subsidiary top next to the summit
// above the summit itself: Annapurna's outline came out at 8,132 m, Broad Peak's at 8,109 m.)
//
//   node scripts/make-skylines.mjs   → src/data/skylines.json
import fs from 'node:fs/promises'
import path from 'node:path'
import { inflateSync } from 'fflate'
import { mountains } from '../src/data/index.js'

const HALF_KM = 4.5
const BAND_KM = 1.2
const POINTS = 96
const FALLOFF_M = 600

const rad = (d) => (d * Math.PI) / 180
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))

/** height.q16 → Float32 metres, rows as stored (north first), as scripts/encode-height.mjs writes them */
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

const out = {}
for (const m of mountains) {
  const dir = path.join('public/terrain', m.id)
  const meta = JSON.parse(await fs.readFile(path.join(dir, 'height.json'), 'utf8'))
  const { width: W, height: H, bbox, metresPerPx } = meta
  const h = decode(await fs.readFile(path.join(dir, 'height.q16')), W, H, meta.q16?.scale || 0.25)
  // the summit's pixel: the highest point within 300 m of the surveyed position
  const u = (m.peak.lon - bbox.west) / (bbox.east - bbox.west)
  const v = (mercY(bbox.north) - mercY(m.peak.lat)) / (mercY(bbox.north) - mercY(bbox.south)) // 0 = north row
  let cx = Math.round(u * (W - 1)), cy = Math.round(v * (H - 1))
  const r = Math.ceil(300 / metresPerPx)
  let top = -Infinity
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    const hh = h[y * W + x]
    if (hh > top) { top = hh; cx = x; cy = y }
  }
  const gap = Math.max(0, m.peak.elevation - top)
  const half = Math.round((HALF_KM * 1000) / metresPerPx), band = Math.round((BAND_KM * 1000) / metresPerPx)
  const cols = []
  for (let x = cx - half; x <= cx + half; x++) {
    let best = 0
    for (let y = cy - band; y <= cy + band; y++) {
      const d = Math.hypot(x - cx, y - cy) * metresPerPx
      best = Math.max(best, h[y * W + x] + gap * Math.max(0, 1 - d / FALLOFF_M))
    }
    cols.push(best)
  }
  // resample to POINTS heights, each the highest of the columns it covers (no peak lost between two)
  const pts = []
  for (let i = 0; i < POINTS; i++) {
    const a = Math.floor((i / POINTS) * cols.length), b = Math.max(a + 1, Math.floor(((i + 1) / POINTS) * cols.length))
    pts.push(Math.min(m.peak.elevation, Math.round(Math.max(...cols.slice(a, b)))))
  }
  out[m.id] = { km: HALF_KM * 2, top: Math.max(...pts), points: pts }
  console.log(`${m.id.padEnd(14)} summit ${m.peak.elevation} m, model ${Math.round(top)} m (+${Math.round(gap)}), outline ${Math.min(...pts)}–${Math.max(...pts)} m`)
}
await fs.writeFile('src/data/skylines.json', JSON.stringify(out))
console.log(`src/data/skylines.json ${(JSON.stringify(out).length / 1024).toFixed(1)} KB`)

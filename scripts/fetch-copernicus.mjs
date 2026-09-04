// Replace the terrarium/SRTM heightmap with Copernicus GLO-30 (TanDEM-X based),
// resampled bilinearly onto the same Web-Mercator grid described by height.json.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fromFile } from 'geotiff'
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets

const meta = JSON.parse(await fs.readFile(`${DIR}/height.json`, 'utf8'))
const { bbox, width: W, height: H } = meta
const CACHE = path.resolve('.tile-cache/copernicus')

const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))
const mN = mercY(bbox.north), mS = mercY(bbox.south)

// tiles needed (1°x1°)
const tiles = new Set()
for (const lat of [bbox.south, bbox.north]) for (const lon of [bbox.west, bbox.east])
  tiles.add(`${Math.floor(lat)},${Math.floor(lon)}`)

const rasters = []
for (const key of tiles) {
  const [lat, lon] = key.split(',').map(Number)
  const ns = lat >= 0 ? 'N' : 'S', ew = lon >= 0 ? 'E' : 'W'
  const name = `Copernicus_DSM_COG_10_${ns}${String(Math.abs(lat)).padStart(2, '0')}_00_${ew}${String(Math.abs(lon)).padStart(3, '0')}_00_DEM`
  const file = path.join(CACHE, `${name}.tif`)
  try { await fs.access(file) } catch {
    const url = `https://copernicus-dem-30m.s3.amazonaws.com/${name}/${name}.tif`
    console.log('downloading', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    await fs.mkdir(CACHE, { recursive: true })
    await fs.writeFile(file, Buffer.from(await res.arrayBuffer()))
  }
  const tiff = await fromFile(file)
  const img = await tiff.getImage()
  const [ox, oy] = img.getOrigin()
  const [rx, ry] = img.getResolution()
  const data = (await img.readRasters({ interleave: true }))
  rasters.push({ data, w: img.getWidth(), h: img.getHeight(), ox, oy, rx, ry })
  console.log(`  ${name}: ${img.getWidth()}x${img.getHeight()} origin ${ox},${oy} res ${rx},${ry}`)
}

function sample(lat, lon) {
  for (const r of rasters) {
    const fx = (lon - r.ox) / r.rx - 0.5, fy = (lat - r.oy) / r.ry - 0.5
    if (fx < 0 || fy < 0 || fx > r.w - 1 || fy > r.h - 1) continue
    const x0 = Math.floor(fx), y0 = Math.floor(fy)
    const x1 = Math.min(x0 + 1, r.w - 1), y1 = Math.min(y0 + 1, r.h - 1)
    const tx = fx - x0, ty = fy - y0
    const d = r.data
    return (d[y0 * r.w + x0] * (1 - tx) + d[y0 * r.w + x1] * tx) * (1 - ty) +
           (d[y1 * r.w + x0] * (1 - tx) + d[y1 * r.w + x1] * tx) * ty
  }
  return NaN
}

const out = new Float32Array(W * H)
const hole = new Uint8Array(W * H)
let minEl = Infinity, maxEl = -Infinity, nan = 0
for (let py = 0; py < H; py++) {
  const m = mN - ((py + 0.5) / H) * (mN - mS)
  const lat = deg(Math.atan(Math.sinh(m)))
  for (let px = 0; px < W; px++) {
    const lon = bbox.west + ((px + 0.5) / W) * (bbox.east - bbox.west)
    let h = sample(lat, lon)
    if (!Number.isFinite(h)) { nan++; hole[py * W + px] = 1; h = 0 }
    out[py * W + px] = h
  }
}
// fill voids from valid neighbours (iterative dilation)
for (let iter = 0; iter < 200 && nan > 0; iter++) {
  const next = new Uint8Array(hole)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x
    if (!hole[i]) continue
    let s = 0, c = 0
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = y + dy, xx = x + dx
      if (yy < 0 || yy >= H || xx < 0 || xx >= W) continue
      const j = yy * W + xx
      if (!hole[j]) { s += out[j]; c++ }
    }
    if (c > 0) { out[i] = s / c; next[i] = 0; nan-- }
  }
  hole.set(next)
}
for (const h of out) { if (h < minEl) minEl = h; if (h > maxEl) maxEl = h }
console.log(`resampled ${W}x${H}: ${minEl.toFixed(0)}–${maxEl.toFixed(0)} m, nodata px: ${nan}`)

// keep the SRTM version for reference
try { await fs.rename(`${DIR}/height.bin`, `${DIR}/height-srtm.bin`) } catch {}
await fs.writeFile(`${DIR}/height.bin`, Buffer.from(out.buffer))
await fs.writeFile(`${DIR}/height.json`, JSON.stringify({ ...meta, minEl, maxEl, source: 'Copernicus GLO-30' }, null, 2))

// hillshade preview
{
  const mpp = meta.metresPerPx
  const img = Buffer.alloc(W * H)
  const az = rad(315), alt = rad(45)
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const dzdx = (out[y * W + x + 1] - out[y * W + x - 1]) / (2 * mpp)
      const dzdy = (out[(y + 1) * W + x] - out[(y - 1) * W + x]) / (2 * mpp)
      const slope = Math.atan(Math.hypot(dzdx, dzdy)), aspect = Math.atan2(-dzdy, dzdx)
      const v = Math.sin(alt) * Math.cos(slope) + Math.cos(alt) * Math.sin(slope) * Math.cos(az - Math.PI / 2 - aspect)
      img[y * W + x] = Math.max(0, Math.min(255, v * 255))
    }
  await sharp(img, { raw: { width: W, height: H, channels: 1 } }).resize(1024).png().toFile(`${DIR}/preview-hillshade.png`)
}
console.log('done')

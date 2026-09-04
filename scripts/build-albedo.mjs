// Hybrid Clarity texture: z14 (sharp, but different capture east of ~74%) blended into
// seamless z13 (upsampled) with a feathered vertical transition. Then a gentle global
// tone pass. Output: public/terrain/albedo.jpg (4096²) + preview.
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets

const meta = JSON.parse(await fs.readFile(`${DIR}/height.json`, 'utf8'))
const { bbox } = meta
const CACHE = path.resolve('.tile-cache')
const rad = (d) => (d * Math.PI) / 180
const lon2x = (lon, z) => ((lon + 180) / 360) * 2 ** z
const lat2y = (lat, z) => ((1 - Math.log(Math.tan(rad(lat)) + 1 / Math.cos(rad(lat))) / Math.PI) / 2) * 2 ** z

async function fetchTile(url, cachePath) {
  try { return await fs.readFile(cachePath) } catch {}
  for (let a = 0; a < 4; a++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'k2-terrain-build/1.0' } })
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      const buf = Buffer.from(await res.arrayBuffer())
      await fs.mkdir(path.dirname(cachePath), { recursive: true })
      await fs.writeFile(cachePath, buf)
      return buf
    } catch (e) {
      if (a === 3) {
        // a tile missing from the Clarity mosaic: fall back to the standard World Imagery tile
        if (url.includes('clarity.maptiles')) {
          const alt = url.replace('https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/', 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/')
          const res = await fetch(alt, { headers: { 'User-Agent': 'k2-terrain-build/1.0' } })
          if (!res.ok) throw e
          const buf = Buffer.from(await res.arrayBuffer())
          await fs.mkdir(path.dirname(cachePath), { recursive: true })
          await fs.writeFile(cachePath, buf)
          console.log('  fallback tile', alt.split('/tile/')[1])
          return buf
        }
        throw e
      }
      await new Promise((r) => setTimeout(r, 600 * (a + 1)))
    }
  }
}

async function stitchRaw(z, outSize) {
  const x0 = Math.round(lon2x(bbox.west, z)), x1 = Math.round(lon2x(bbox.east, z))
  const y0 = Math.round(lat2y(bbox.north, z))
  const n = x1 - x0
  const comps = []
  for (let ty = 0; ty < n; ty++)
    for (let tx = 0; tx < n; tx++) {
      const X = x0 + tx, Y = y0 + ty
      const url = `https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${z}/${Y}/${X}`
      comps.push({ input: await fetchTile(url, path.join(CACHE, 'clarity', `${z}`, `${X}`, `${Y}.jpg`)), left: tx * 256, top: ty * 256 })
    }
  const stitched = await sharp({ create: { width: n * 256, height: n * 256, channels: 3, background: '#000' } })
    .composite(comps).png().toBuffer()
  const { data, info } = await sharp(stitched).resize(outSize, outSize, { kernel: 'lanczos3' })
    .removeAlpha().toColourspace('srgb').raw().toBuffer({ resolveWithObject: true })
  console.log(`  z${z}: ${info.width}x${info.height} ch=${info.channels}`)
  if (info.channels !== 3) throw new Error(`expected 3 channels, got ${info.channels}`)
  return data
}

const SIZE = 4096
console.log('stitching z13…'); const lo = await stitchRaw(13, SIZE)
console.log('stitching z14…'); const hi = await stitchRaw(14, SIZE)

// blend: hi for x < X_EDGE - F, lo for x > X_EDGE, smooth in between
const X_EDGE = Math.round(SIZE * (Number(process.env.EDGE) || 0.745)), F = 220
// optional left edge: use the seamless z13 mosaic for x < EDGEL (fraction) as well
const X_L = process.env.EDGEL ? Math.round(SIZE * Number(process.env.EDGEL)) : -1
const out = Buffer.alloc(lo.length)
for (let y = 0; y < SIZE; y++)
  for (let x = 0; x < SIZE; x++) {
    let t = (x - (X_EDGE - F)) / F
    t = t < 0 ? 0 : t > 1 ? 1 : t
    if (X_L >= 0) { let tl = 1 - (x - X_L) / F; tl = tl < 0 ? 0 : tl > 1 ? 1 : tl; t = Math.max(t, tl) }
    t = t * t * (3 - 2 * t)
    const i = (y * SIZE + x) * 3
    for (let c = 0; c < 3; c++) out[i + c] = hi[i + c] * (1 - t) + lo[i + c] * t
  }

await sharp(out, { raw: { width: SIZE, height: SIZE, channels: 3 } })
  .jpeg({ quality: 90, mozjpeg: true }).toFile(`${DIR}/albedo.jpg`)
await sharp(`${DIR}/albedo.jpg`).resize(1024).jpeg({ quality: 80 }).toFile(`${DIR}/albedo-preview.jpg`)
console.log('albedo.jpg written')

// Fetches real elevation (AWS Terrain Tiles / Mapzen "terrarium", SRTM-derived)
// and satellite imagery (Esri World Imagery) for the K2 area, stitches them,
// and writes:
//   public/terrain/height.bin   Float32 metres, row-major, north→south
//   public/terrain/height.json  { width, height, bbox, minEl, maxEl, metresPerPx }
//   public/terrain/albedo.jpg   satellite texture (same bbox, higher zoom)
//
// Both sources share the Web-Mercator tile grid, so they align pixel-perfectly.

import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets

const PEAKS = { k2: { lat: 35.8825, lon: 76.5133 }, everest: { lat: 27.9881, lon: 86.9250 }, annapurna: { lat: 28.5961, lon: 83.8203 }, kangchenjunga: { lat: 27.7025, lon: 88.1475 }, lhotse: { lat: 27.9617, lon: 86.9333 }, makalu: { lat: 27.8897, lon: 87.0885 }, chooyu: { lat: 28.0942, lon: 86.6608 }, dhaulagiri: { lat: 28.6983, lon: 83.4875 }, manaslu: { lat: 28.5497, lon: 84.5597 }, nangaparbat: { lat: 35.2375, lon: 74.5892 }, gasherbrum1: { lat: 35.7242, lon: 76.6964 }, gasherbrum2: { lat: 35.7583, lon: 76.6533 }, broadpeak: { lat: 35.8114, lon: 76.5650 }, shishapangma: { lat: 28.3525, lon: 85.7792 } }
const K2 = PEAKS[PEAK_ID]
const HEIGHT_ZOOM = 13 // ~15 m/px at this latitude
const IMAGE_ZOOM = 14 // ~7.5 m/px
const TILES_ACROSS = 8 // at HEIGHT_ZOOM → 2048 px ≈ 31 km

const OUT = path.resolve(DIR)
const CACHE = path.resolve('.tile-cache')

const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI
const lon2x = (lon, z) => ((lon + 180) / 360) * 2 ** z
const lat2y = (lat, z) =>
  ((1 - Math.log(Math.tan(rad(lat)) + 1 / Math.cos(rad(lat))) / Math.PI) / 2) * 2 ** z
const x2lon = (x, z) => (x / 2 ** z) * 360 - 180
const y2lat = (y, z) => deg(Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** z))))

// centre tile range at HEIGHT_ZOOM
const cx = Math.floor(lon2x(K2.lon, HEIGHT_ZOOM))
const cy = Math.floor(lat2y(K2.lat, HEIGHT_ZOOM))
const x0 = cx - TILES_ACROSS / 2 + 1
const y0 = cy - TILES_ACROSS / 2 + 1
const x1 = x0 + TILES_ACROSS
const y1 = y0 + TILES_ACROSS

const bbox = {
  west: x2lon(x0, HEIGHT_ZOOM),
  east: x2lon(x1, HEIGHT_ZOOM),
  north: y2lat(y0, HEIGHT_ZOOM),
  south: y2lat(y1, HEIGHT_ZOOM),
}

async function fetchTile(url, cachePath) {
  try {
    return await fs.readFile(cachePath)
  } catch {}
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'k2-terrain-build/1.0' } })
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      const buf = Buffer.from(await res.arrayBuffer())
      await fs.mkdir(path.dirname(cachePath), { recursive: true })
      await fs.writeFile(cachePath, buf)
      return buf
    } catch (e) {
      if (attempt === 3) throw e
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
}

async function pool(items, limit, fn) {
  const out = new Array(items.length)
  let i = 0
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const idx = i++
        out[idx] = await fn(items[idx], idx)
      }
    }),
  )
  return out
}

async function buildHeight() {
  const z = HEIGHT_ZOOM
  const n = TILES_ACROSS
  const W = n * 256
  const height = new Float32Array(W * W)
  const jobs = []
  for (let ty = 0; ty < n; ty++)
    for (let tx = 0; tx < n; tx++) jobs.push({ tx, ty })

  let done = 0
  await pool(jobs, 8, async ({ tx, ty }) => {
    const X = x0 + tx, Y = y0 + ty
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${X}/${Y}.png`
    const buf = await fetchTile(url, path.join(CACHE, 'terrarium', `${z}`, `${X}`, `${Y}.png`))
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })
    const ch = info.channels
    for (let py = 0; py < 256; py++) {
      for (let px = 0; px < 256; px++) {
        const i = (py * 256 + px) * ch
        const h = data[i] * 256 + data[i + 1] + data[i + 2] / 256 - 32768
        height[(ty * 256 + py) * W + tx * 256 + px] = h
      }
    }
    done++
    if (done % 8 === 0) process.stdout.write(`  height tiles ${done}/${jobs.length}\r`)
  })
  console.log(`\n  height ${W}x${W}`)

  let minEl = Infinity, maxEl = -Infinity
  for (const h of height) { if (h < minEl) minEl = h; if (h > maxEl) maxEl = h }

  // metres per pixel at centre latitude (Web Mercator)
  const metresPerPx = (40075016.686 * Math.cos(rad(K2.lat))) / 2 ** (z + 8)

  await fs.mkdir(OUT, { recursive: true })
  await fs.writeFile(path.join(OUT, 'height.bin'), Buffer.from(height.buffer))
  await fs.writeFile(
    path.join(OUT, 'height.json'),
    JSON.stringify({ width: W, height: W, bbox, minEl, maxEl, metresPerPx, k2: K2, zoom: z }, null, 2),
  )
  console.log(`  elevation ${minEl.toFixed(0)}–${maxEl.toFixed(0)} m, ${metresPerPx.toFixed(1)} m/px`)
  return { minEl, maxEl }
}

async function buildImagery() {
  const z = IMAGE_ZOOM
  const scale = 2 ** (z - HEIGHT_ZOOM)
  const n = TILES_ACROSS * scale
  const W = n * 256
  const ix0 = x0 * scale, iy0 = y0 * scale
  const jobs = []
  for (let ty = 0; ty < n; ty++)
    for (let tx = 0; tx < n; tx++) jobs.push({ tx, ty })

  let done = 0
  const composites = await pool(jobs, 8, async ({ tx, ty }) => {
    const X = ix0 + tx, Y = iy0 + ty
    const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${Y}/${X}`
    const buf = await fetchTile(url, path.join(CACHE, 'esri', `${z}`, `${X}`, `${Y}.jpg`))
    done++
    if (done % 16 === 0) process.stdout.write(`  image tiles ${done}/${jobs.length}\r`)
    return { input: buf, left: tx * 256, top: ty * 256 }
  })
  console.log(`\n  imagery ${W}x${W}`)

  await sharp({ create: { width: W, height: W, channels: 3, background: '#000' } })
    .composite(composites)
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT, 'albedo.jpg'))

  // small preview for quick sanity check
  await sharp(path.join(OUT, 'albedo.jpg')).resize(1024).jpeg({ quality: 80 }).toFile(path.join(OUT, 'albedo-preview.jpg'))
}

console.log('K2 terrain build')
console.log(`  bbox N${bbox.north.toFixed(4)} S${bbox.south.toFixed(4)} W${bbox.west.toFixed(4)} E${bbox.east.toFixed(4)}`)
await buildHeight()
await buildImagery()
console.log('done')

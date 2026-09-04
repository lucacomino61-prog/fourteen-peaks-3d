// High-resolution detail texture for the core of the mountain: 16x16 tiles at zoom 16
// (~2.4 m/px, ≈ 9.8 km) centred on K2 → public/terrain/detail.jpg + detail.json (bbox in base-uv space).
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets

const meta = JSON.parse(await fs.readFile(`${DIR}/height.json`, 'utf8'))
const { bbox, k2 } = meta
const Z = Number(process.argv[2] || 16)
const N = Number(process.argv[3] || 16)
const SOURCE = process.argv[4] || 'clarity'
const CACHE = path.resolve('.tile-cache')
const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI
const lon2x = (lon, z) => ((lon + 180) / 360) * 2 ** z
const lat2y = (lat, z) => ((1 - Math.log(Math.tan(rad(lat)) + 1 / Math.cos(rad(lat))) / Math.PI) / 2) * 2 ** z
const x2lon = (x, z) => (x / 2 ** z) * 360 - 180
const y2lat = (y, z) => deg(Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** z))))
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))

const urlFor = (z, X, Y) => SOURCE === 'clarity'
  ? `https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${z}/${Y}/${X}`
  : `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${Y}/${X}`

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

const cx = Math.floor(lon2x(k2.lon, Z)), cy = Math.floor(lat2y(k2.lat, Z))
const x0 = cx - N / 2 + 1, y0 = cy - N / 2 + 1
const jobs = []
for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) jobs.push({ tx, ty })
const comps = new Array(jobs.length)
let i = 0, done = 0
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < jobs.length) {
    const idx = i++, { tx, ty } = jobs[idx]
    const X = x0 + tx, Y = y0 + ty
    comps[idx] = { input: await fetchTile(urlFor(Z, X, Y), path.join(CACHE, SOURCE, `${Z}`, `${X}`, `${Y}.jpg`)), left: tx * 256, top: ty * 256 }
    if (++done % 32 === 0) process.stdout.write(`  ${done}/${jobs.length}\r`)
  }
}))
const W = N * 256
await sharp({ create: { width: W, height: W, channels: 3, background: '#000' } })
  .composite(comps).jpeg({ quality: 90, mozjpeg: true }).toFile(`${DIR}/detail.jpg`)
await sharp(`${DIR}/detail.jpg`).resize(1024).jpeg({ quality: 80 }).toFile(`${DIR}/detail-preview.jpg`)

// detail bbox → base texture uv (u right, v up/north)
const west = x2lon(x0, Z), east = x2lon(x0 + N, Z), north = y2lat(y0, Z), south = y2lat(y0 + N, Z)
const mN = mercY(bbox.north), mS = mercY(bbox.south)
const u0 = (west - bbox.west) / (bbox.east - bbox.west), u1 = (east - bbox.west) / (bbox.east - bbox.west)
const v1 = 1 - (mN - mercY(north)) / (mN - mS), v0 = 1 - (mN - mercY(south)) / (mN - mS)
await fs.writeFile(`${DIR}/detail.json`, JSON.stringify({ zoom: Z, width: W, bbox: { west, east, north, south }, uv: { u0, v0, u1, v1 }, source: SOURCE }, null, 2))
console.log(`\ndetail z${Z}: ${W}px, ${((east - west) * 111.195 * Math.cos(rad(k2.lat))).toFixed(1)} km wide, uv [${u0.toFixed(3)},${v0.toFixed(3)}]–[${u1.toFixed(3)},${v1.toFixed(3)}]`)

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
  const res = await fetch(url, { headers: { 'User-Agent': 'k2-terrain-build/1.0' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.mkdir(path.dirname(cachePath), { recursive: true })
  await fs.writeFile(cachePath, buf)
  return buf
}

const z = Number(process.argv[2] || 12)
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
await sharp({ create: { width: n * 256, height: n * 256, channels: 3, background: '#000' } })
  .composite(comps).resize(1024).jpeg({ quality: 82 }).toFile(`public/terrain/preview-clarity-z${z}.jpg`)
console.log(`clarity z${z}: ${n * 256}px`)

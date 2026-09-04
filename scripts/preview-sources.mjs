// Quick comparison of imagery sources over the same bbox + hillshade of the DEM.
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets

const meta = JSON.parse(await fs.readFile(`${DIR}/height.json`, 'utf8'))
const { width: W, bbox, zoom: Z0 } = meta
const OUT = path.resolve(DIR)
const CACHE = path.resolve('.tile-cache')

const rad = (d) => (d * Math.PI) / 180
const lon2x = (lon, z) => ((lon + 180) / 360) * 2 ** z
const lat2y = (lat, z) =>
  ((1 - Math.log(Math.tan(rad(lat)) + 1 / Math.cos(rad(lat))) / Math.PI) / 2) * 2 ** z

async function fetchTile(url, cachePath) {
  try { return await fs.readFile(cachePath) } catch {}
  const res = await fetch(url, { headers: { 'User-Agent': 'k2-terrain-build/1.0' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.mkdir(path.dirname(cachePath), { recursive: true })
  await fs.writeFile(cachePath, buf)
  return buf
}

async function stitch(name, z, urlFn) {
  const x0 = Math.round(lon2x(bbox.west, z)), x1 = Math.round(lon2x(bbox.east, z))
  const y0 = Math.round(lat2y(bbox.north, z)), y1 = Math.round(lat2y(bbox.south, z))
  const n = x1 - x0
  const comps = []
  for (let ty = 0; ty < n; ty++)
    for (let tx = 0; tx < n; tx++) {
      const X = x0 + tx, Y = y0 + ty
      const buf = await fetchTile(urlFn(z, X, Y), path.join(CACHE, name, `${z}`, `${X}`, `${Y}.jpg`))
      comps.push({ input: buf, left: tx * 256, top: ty * 256 })
    }
  await sharp({ create: { width: n * 256, height: n * 256, channels: 3, background: '#000' } })
    .composite(comps).jpeg({ quality: 82 }).toFile(path.join(OUT, `preview-${name}.jpg`))
  console.log(`${name} z${z}: ${n * 256}px`)
}

// hillshade from DEM
{
  const raw = await fs.readFile(`${DIR}/height.bin`)
  const h = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4)
  const mpp = meta.metresPerPx
  const img = Buffer.alloc(W * W)
  const az = rad(315), alt = rad(45)
  for (let y = 1; y < W - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const dzdx = (h[y * W + x + 1] - h[y * W + x - 1]) / (2 * mpp)
      const dzdy = (h[(y + 1) * W + x] - h[(y - 1) * W + x]) / (2 * mpp)
      const slope = Math.atan(Math.hypot(dzdx, dzdy))
      const aspect = Math.atan2(-dzdy, dzdx)
      let v = Math.sin(alt) * Math.cos(slope) + Math.cos(alt) * Math.sin(slope) * Math.cos(az - Math.PI / 2 - aspect)
      img[y * W + x] = Math.max(0, Math.min(255, v * 255))
    }
  await sharp(img, { raw: { width: W, height: W, channels: 1 } }).resize(1024).png().toFile(path.join(OUT, 'preview-hillshade.png'))
  console.log('hillshade written')
}

await stitch('s2cloudless', 12, (z, X, Y) => `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/${z}/${Y}/${X}.jpg`)
await stitch('esri13', 12, (z, X, Y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${Y}/${X}`)

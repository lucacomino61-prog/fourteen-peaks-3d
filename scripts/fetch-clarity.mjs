// Stitch Esri "Clarity" World Imagery at z14 for the height.json bbox → public/terrain/albedo.jpg
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets

const meta = JSON.parse(await fs.readFile(`${DIR}/height.json`, 'utf8'))
const { bbox } = meta
const Z = Number(process.argv[2] || 14)
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
    } catch (e) { if (a === 3) throw e; await new Promise((r) => setTimeout(r, 600 * (a + 1))) }
  }
}

const x0 = Math.round(lon2x(bbox.west, Z)), x1 = Math.round(lon2x(bbox.east, Z))
const y0 = Math.round(lat2y(bbox.north, Z))
const n = x1 - x0
const jobs = []
for (let ty = 0; ty < n; ty++) for (let tx = 0; tx < n; tx++) jobs.push({ tx, ty })
let done = 0
const comps = new Array(jobs.length)
let i = 0
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < jobs.length) {
    const idx = i++, { tx, ty } = jobs[idx]
    const X = x0 + tx, Y = y0 + ty
    const url = `https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${Z}/${Y}/${X}`
    comps[idx] = { input: await fetchTile(url, path.join(CACHE, 'clarity', `${Z}`, `${X}`, `${Y}.jpg`)), left: tx * 256, top: ty * 256 }
    if (++done % 32 === 0) process.stdout.write(`  ${done}/${jobs.length}\r`)
  }
}))
const W = n * 256
await sharp({ create: { width: W, height: W, channels: 3, background: '#000' } })
  .composite(comps).jpeg({ quality: 90, mozjpeg: true }).toFile(`${DIR}/albedo.jpg`)
await sharp(`${DIR}/albedo.jpg`).resize(1024).jpeg({ quality: 80 }).toFile(`${DIR}/albedo-preview.jpg`)
console.log(`\nclarity z${Z}: ${W}px → albedo.jpg`)

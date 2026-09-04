import fs from 'node:fs/promises'
// usage: node _minsearch_tmp.mjs <peak> <lat> <lon> <halfKmLat> <halfKmLon> [max]  -> min (or max) in the box
const [id, lat0, lon0, hk, hk2, mode='min'] = process.argv.slice(2)
const DIR = `terrain-src/${id}`
const meta = JSON.parse(await fs.readFile(`${DIR}/height.json`, 'utf8'))
const { bbox, width: W, height: H, metresPerPx } = meta
const raw = await fs.readFile(`${DIR}/height.bin`)
const h = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4)
const rad = d => d*Math.PI/180, mercY = lat => Math.log(Math.tan(Math.PI/4+rad(lat)/2))
const mN = mercY(bbox.north), mS = mercY(bbox.south)
const toPx = (lat, lon) => ({ x: ((lon-bbox.west)/(bbox.east-bbox.west))*W, y: ((mN-mercY(lat))/(mN-mS))*H })
const fromPx = (x, y) => ({ lon: bbox.west + x/W*(bbox.east-bbox.west), lat: (2*Math.atan(Math.exp(mN - y/H*(mN-mS))) - Math.PI/2)*180/Math.PI })
const c = toPx(+lat0, +lon0); const ry = +hk*1000/metresPerPx, rx = +hk2*1000/metresPerPx
let best = null
for (let y = Math.max(0, Math.floor(c.y-ry)); y <= Math.min(H-1, Math.ceil(c.y+ry)); y++)
  for (let x = Math.max(0, Math.floor(c.x-rx)); x <= Math.min(W-1, Math.ceil(c.x+rx)); x++) {
    const v = h[y*W+x]; if (!best || (mode==='min' ? v < best.v : v > best.v)) best = { v, x, y }
  }
const p = fromPx(best.x+0.5, best.y+0.5)
console.log(`${id} ${mode} in box: ${best.v.toFixed(0)} m at ${p.lat.toFixed(4)},${p.lon.toFixed(4)}`)

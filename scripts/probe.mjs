// Tools for placing route data against the DEM.
//   node scripts/probe.mjs crop  <lat> <lon> <halfKm> [out.png]  → hillshade crop with 0.01° grid + labels
//   node scripts/probe.mjs el    <lat,lon> [<lat,lon> ...]        → elevations
import fs from 'node:fs/promises'
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets

const meta = JSON.parse(await fs.readFile(`${DIR}/height.json`, 'utf8'))
const { bbox, width: W, height: H, metresPerPx } = meta
const raw = await fs.readFile(`${DIR}/height.bin`)
const h = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4)
const rad = (d) => (d * Math.PI) / 180
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))
const mN = mercY(bbox.north), mS = mercY(bbox.south)
const toPx = (lat, lon) => ({
  x: ((lon - bbox.west) / (bbox.east - bbox.west)) * W,
  y: ((mN - mercY(lat)) / (mN - mS)) * H,
})
function el(lat, lon) {
  const { x, y } = toPx(lat, lon)
  const x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0
  const g = (xx, yy) => h[Math.min(Math.max(yy, 0), H - 1) * W + Math.min(Math.max(xx, 0), W - 1)]
  return (g(x0, y0) * (1 - tx) + g(x0 + 1, y0) * tx) * (1 - ty) + (g(x0, y0 + 1) * (1 - tx) + g(x0 + 1, y0 + 1) * tx) * ty
}

const [cmd, ...args] = process.argv.slice(2)
if (cmd === 'profile') {
  // profile <lat,lon> <lat,lon> [n]  → elevations along the line
  const [a, b, n = 12] = args
  const [la1, lo1] = a.split(',').map(Number), [la2, lo2] = b.split(',').map(Number)
  const out = []
  for (let i = 0; i <= Number(n); i++) {
    const t = i / Number(n)
    const la = la1 + (la2 - la1) * t, lo = lo1 + (lo2 - lo1) * t
    out.push(`${la.toFixed(4)},${lo.toFixed(4)} ${el(la, lo).toFixed(0)}`)
  }
  console.log(out.join('\n'))
} else if (cmd === 'cropimg') {
  // cropimg <lat> <lon> <halfKm> [out] [lat,lon,label ...] → satellite crop with grid + markers
  const [lat, lon, halfKm, out = `${DIR}/cropimg.png`] = args
  const alb = sharp(`${DIR}/albedo.jpg`)
  const { width: AW } = await alb.metadata()
  const s0 = AW / W
  const c = toPx(Number(lat), Number(lon))
  const r = (Number(halfKm) * 1000) / metresPerPx
  const x0 = Math.round((c.x - r) * s0), y0 = Math.round((c.y - r) * s0), size = Math.round(2 * r * s0)
  const OUT = 1200, s = OUT / size
  let svg = `<svg width="${OUT}" height="${OUT}" xmlns="http://www.w3.org/2000/svg">`
  for (let la = Math.ceil((Number(lat) - 0.06) * 100) / 100; la <= Number(lat) + 0.06; la = +(la + 0.01).toFixed(2)) {
    const y = (toPx(la, Number(lon)).y * s0 - y0) * s
    if (y < 0 || y > OUT) continue
    svg += `<line x1="0" y1="${y}" x2="${OUT}" y2="${y}" stroke="#ff3355" stroke-width="1" opacity="0.8"/><text x="4" y="${y - 3}" font-size="14" fill="#ff3355">${la.toFixed(2)}</text>`
  }
  for (let lo = Math.ceil((Number(lon) - 0.07) * 100) / 100; lo <= Number(lon) + 0.07; lo = +(lo + 0.01).toFixed(2)) {
    const x = (toPx(Number(lat), lo).x * s0 - x0) * s
    if (x < 0 || x > OUT) continue
    svg += `<line x1="${x}" y1="0" x2="${x}" y2="${OUT}" stroke="#33aaff" stroke-width="1" opacity="0.8"/><text x="${x + 3}" y="16" font-size="14" fill="#33aaff">${lo.toFixed(2)}</text>`
  }
  for (const m of args.slice(4)) {
    const [la, lo, label] = m.split(',')
    const p = toPx(Number(la), Number(lo)); const x = (p.x * s0 - x0) * s, y = (p.y * s0 - y0) * s
    svg += `<circle cx="${x}" cy="${y}" r="5" fill="#ffee00" stroke="#000"/><text x="${x + 7}" y="${y + 5}" font-size="13" fill="#ffee00" stroke="#000" stroke-width="0.5">${label}</text>`
  }
  svg += '</svg>'
  await alb.extract({ left: x0, top: y0, width: size, height: size }).resize(OUT, OUT).png()
    .composite([{ input: Buffer.from(svg) }]).toFile(out)
  console.log('cropimg written', out)
} else if (cmd === 'el') {
  for (const a of args) {
    const [lat, lon] = a.split(',').map(Number)
    console.log(`${lat},${lon} → ${el(lat, lon).toFixed(0)} m`)
  }
} else if (cmd === 'crop') {
  const [lat, lon, halfKm, out = `${DIR}/crop.png`] = args
  const c = toPx(Number(lat), Number(lon))
  const r = (Number(halfKm) * 1000) / metresPerPx
  const x0 = Math.round(c.x - r), y0 = Math.round(c.y - r), size = Math.round(2 * r)
  // hillshade
  const img = Buffer.alloc(size * size)
  const az = rad(315), alt = rad(40)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const X = x0 + x, Y = y0 + y
      const dzdx = (h[Y * W + X + 1] - h[Y * W + X - 1]) / (2 * metresPerPx)
      const dzdy = (h[(Y + 1) * W + X] - h[(Y - 1) * W + X]) / (2 * metresPerPx)
      const slope = Math.atan(Math.hypot(dzdx, dzdy)), aspect = Math.atan2(-dzdy, dzdx)
      const v = Math.sin(alt) * Math.cos(slope) + Math.cos(alt) * Math.sin(slope) * Math.cos(az - Math.PI / 2 - aspect)
      img[y * size + x] = Math.max(0, Math.min(255, v * 255))
    }
  const OUT = 1200, s = OUT / size
  // grid every 0.01° + contour-ish labels via SVG
  let svg = `<svg width="${OUT}" height="${OUT}" xmlns="http://www.w3.org/2000/svg">`
  const latA = Number(lat) - 0.05, latB = Number(lat) + 0.05, lonA = Number(lon) - 0.06, lonB = Number(lon) + 0.06
  for (let la = Math.ceil(latA * 100) / 100; la <= latB; la = +(la + 0.01).toFixed(2)) {
    const p = toPx(la, Number(lon)); const y = (p.y - y0) * s
    if (y < 0 || y > OUT) continue
    svg += `<line x1="0" y1="${y}" x2="${OUT}" y2="${y}" stroke="#ff3355" stroke-width="1" opacity="0.7"/><text x="4" y="${y - 3}" font-size="14" fill="#ff3355">${la.toFixed(2)}</text>`
  }
  for (let lo = Math.ceil(lonA * 100) / 100; lo <= lonB; lo = +(lo + 0.01).toFixed(2)) {
    const p = toPx(Number(lat), lo); const x = (p.x - x0) * s
    if (x < 0 || x > OUT) continue
    svg += `<line x1="${x}" y1="0" x2="${x}" y2="${OUT}" stroke="#33aaff" stroke-width="1" opacity="0.7"/><text x="${x + 3}" y="16" font-size="14" fill="#33aaff">${lo.toFixed(2)}</text>`
  }
  // extra markers: lat,lon,label triples after out path
  for (const m of args.slice(4)) {
    const [la, lo, label] = m.split(',')
    const p = toPx(Number(la), Number(lo)); const x = (p.x - x0) * s, y = (p.y - y0) * s
    svg += `<circle cx="${x}" cy="${y}" r="5" fill="#ffee00"/><text x="${x + 7}" y="${y + 5}" font-size="13" fill="#ffee00">${label}</text>`
  }
  svg += '</svg>'
  await sharp(img, { raw: { width: size, height: size, channels: 1 } }).resize(OUT, OUT, { kernel: 'lanczos3' }).png()
    .composite([{ input: Buffer.from(svg) }]).toFile(out)
  console.log('crop written', out, `${size}px ≈ ${(size * metresPerPx / 1000).toFixed(1)} km`)
}

// Overview-grid thumbnails: a 12 km satellite crop around the summit, multiplied by the DEM
// hillshade and graded to the site's night palette. → public/terrain/<id>/thumb.webp (720x450)
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = 'terrain-src'
const outRoot = 'public/terrain'
const ids = process.argv.slice(2).length ? process.argv.slice(2) : (await fs.readdir(root, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)
const rad = (d) => (d * Math.PI) / 180
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))

for (const id of ids) {
  const dir = path.join(root, id)
  let meta
  try { meta = JSON.parse(await fs.readFile(path.join(dir, 'height.json'), 'utf8')) } catch { continue }
  const { bbox, width: W, height: H, metresPerPx, k2: c } = meta
  const raw = await fs.readFile(path.join(dir, 'height.bin'))
  const h = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4)
  const mN = mercY(bbox.north), mS = mercY(bbox.south)
  const cx = ((c.lon - bbox.west) / (bbox.east - bbox.west)) * W
  const cy = ((mN - mercY(c.lat)) / (mN - mS)) * H
  const halfW = (6000 / metresPerPx), halfH = halfW * (450 / 720)
  const x0 = Math.max(1, Math.round(cx - halfW)), y0 = Math.max(1, Math.round(cy - halfH * 1.15))
  const cw = Math.min(W - 2 - x0, Math.round(halfW * 2)), ch = Math.min(H - 2 - y0, Math.round(halfH * 2))

  // hillshade of the crop (low sun from the south-west, like the 3D scene)
  const shade = Buffer.alloc(cw * ch)
  const az = rad(225), alt = rad(28)
  for (let y = 0; y < ch; y++)
    for (let x = 0; x < cw; x++) {
      const X = x0 + x, Y = y0 + y
      const dzdx = (h[Y * W + X + 1] - h[Y * W + X - 1]) / (2 * metresPerPx)
      const dzdy = (h[(Y + 1) * W + X] - h[(Y - 1) * W + X]) / (2 * metresPerPx)
      const slope = Math.atan(Math.hypot(dzdx, dzdy)), aspect = Math.atan2(-dzdy, dzdx)
      let v = Math.sin(alt) * Math.cos(slope) + Math.cos(alt) * Math.sin(slope) * Math.cos(az - Math.PI / 2 - aspect)
      v = Math.max(0.08, v)
      shade[y * cw + x] = Math.min(255, Math.round(Math.pow(v, 0.8) * 255))
    }
  const shadeImg = await sharp(shade, { raw: { width: cw, height: ch, channels: 1 } }).resize(720, 450).png().toBuffer()

  // satellite crop in the same frame (albedo is 2x the DEM grid)
  const alb = sharp(path.join(dir, 'albedo.jpg'))
  const { width: AW } = await alb.metadata()
  const s = AW / W
  const sat = await alb.extract({ left: Math.round(x0 * s), top: Math.round(y0 * s), width: Math.round(cw * s), height: Math.round(ch * s) })
    .resize(720, 450).modulate({ saturation: 0.75, brightness: 0.9 }).png().toBuffer()

  await sharp(sat)
    .composite([{ input: shadeImg, blend: 'multiply' }])
    .tint({ r: 214, g: 222, b: 240 })
    .linear(1.05, -6)
    .webp({ quality: 80 })
    .toFile(path.join(outRoot, id, 'thumb.webp'))
  console.log(`${id.padEnd(14)} thumb ok`)
}

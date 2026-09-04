// Bake the fixed-sun lighting so the shader needs no ray march:
//   R = sun shadow (soft), G = ambient occlusion (horizon-based), B unused.
// Sun direction and step schedule match src/scene/Terrain.jsx. → public/terrain/<id>/light.webp
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = 'terrain-src'
const outRoot = 'public/terrain'
const ids = process.argv.slice(2).length ? process.argv.slice(2) : (await fs.readdir(root, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)

// scene: +x east, -z north, +y up, 1 unit = 1 km. Sun from the south-west, low.
const S = (() => { const v = [-0.62, 0.26, 0.6]; const l = Math.hypot(...v); return v.map((c) => c / l) })()

for (const id of ids) {
  const dir = path.join(root, id)
  let meta
  try { meta = JSON.parse(await fs.readFile(path.join(dir, 'height.json'), 'utf8')) } catch { continue }
  const { width: W, height: H, bbox, metresPerPx } = meta
  const raw = await fs.readFile(path.join(dir, 'height.bin'))
  const h = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4) // row 0 = north, metres
  const sizeX = (W * metresPerPx) / 1000
  const sizeZ = (bbox.north - bbox.south) * 111.195
  const t0 = Date.now()

  // bilinear height in km at (u, v) with v = 1 north (file rows are north→south)
  const Hkm = (u, v) => {
    const fx = Math.min(Math.max(u, 0), 1) * (W - 1)
    const fy = Math.min(Math.max(1 - v, 0), 1) * (H - 1)
    const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(x0 + 1, W - 1), y1 = Math.min(y0 + 1, H - 1)
    const tx = fx - x0, ty = fy - y0
    return ((h[y0 * W + x0] * (1 - tx) + h[y0 * W + x1] * tx) * (1 - ty) + (h[y1 * W + x0] * (1 - tx) + h[y1 * W + x1] * tx) * ty) * 0.001
  }

  // --- sun shadow at full resolution
  const shadow = new Uint8Array(W * H)
  const dux = S[0] / sizeX, duv = -S[2] / sizeZ
  const STEPS = 56, stepLen = 0.07, bias = 0.004
  for (let y = 0; y < H; y++) {
    const v = 1 - (y + 0.5) / H
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W
      const p = h[y * W + x] * 0.001
      let s = 1
      for (let i = 1; i <= STEPS; i++) {
        const t = i * stepLen * (1 + i * 0.09)
        const uu = u + dux * t, vv = v + duv * t
        if (uu < 0 || uu > 1 || vv < 0 || vv > 1) break
        const d = Hkm(uu, vv) - (p + S[1] * t + bias)
        if (d > 0) { s = Math.min(s, Math.max(0, 1 - d * 12)); if (s <= 0.02) break }
      }
      shadow[y * W + x] = Math.round(s * 255)
    }
    if (y % 256 === 0) process.stdout.write(`  ${id} shadow ${Math.round((y / H) * 100)}%\r`)
  }

  // --- ambient occlusion at half resolution (horizon angles in 8 directions, out to 1.5 km)
  const AW = W / 2, AH = H / 2
  const ao = new Uint8Array(AW * AH)
  const dirs = Array.from({ length: 8 }, (_, k) => [Math.cos((k * Math.PI) / 4), Math.sin((k * Math.PI) / 4)])
  const ASTEPS = 18, aStep = 0.08
  for (let y = 0; y < AH; y++) {
    const v = 1 - (y + 0.5) / AH
    for (let x = 0; x < AW; x++) {
      const u = (x + 0.5) / AW
      const p = Hkm(u, v)
      let occ = 0
      for (const [dx, dz] of dirs) {
        let maxTan = 0
        for (let i = 1; i <= ASTEPS; i++) {
          const t = i * aStep
          const uu = u + (dx * t) / sizeX, vv = v - (dz * t) / sizeZ
          if (uu < 0 || uu > 1 || vv < 0 || vv > 1) break
          const tan = (Hkm(uu, vv) - p) / t
          if (tan > maxTan) maxTan = tan
        }
        occ += Math.sin(Math.atan(maxTan))
      }
      occ /= dirs.length
      ao[y * AW + x] = Math.round((1 - occ * 0.85) * 255)
    }
  }
  const aoUp = await sharp(ao, { raw: { width: AW, height: AH, channels: 1 } }).resize(W, H, { kernel: 'lanczos3' }).raw().toBuffer()

  const rgb = Buffer.alloc(W * H * 3)
  for (let i = 0; i < W * H; i++) { rgb[i * 3] = shadow[i]; rgb[i * 3 + 1] = aoUp[i]; rgb[i * 3 + 2] = 0 }
  await fs.mkdir(path.join(outRoot, id), { recursive: true })
  await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 85, effort: 4 }).toFile(path.join(outRoot, id, 'light.webp'))
  const size = (await fs.stat(path.join(outRoot, id, 'light.webp'))).size
  console.log(`\n${id.padEnd(14)} light.webp ${(size / 1024).toFixed(0)} KB in ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}

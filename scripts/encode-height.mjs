// Compact heightmaps: Float32 (16 MB) → uint16 quarter-metres, row-delta coded, deflated.
// Writes public/terrain/<id>/height.q16 (+ keeps height.bin as the build source).
// Usage: node scripts/encode-height.mjs [id ...]   (default: every folder with a height.bin)
import fs from 'node:fs/promises'
import path from 'node:path'
import { deflateSync } from 'fflate'

const root = 'terrain-src'
const outRoot = 'public/terrain'
const ids = process.argv.slice(2).length ? process.argv.slice(2) : (await fs.readdir(root, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)

for (const id of ids) {
  const dir = path.join(root, id)
  let raw
  try { raw = await fs.readFile(path.join(dir, 'height.bin')) } catch { continue }
  const meta = JSON.parse(await fs.readFile(path.join(dir, 'height.json'), 'utf8'))
  const { width: W, height: H } = meta
  const f = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4)
  // quantise to 0.25 m (max 16,383 m), then delta along rows so the stream is mostly small numbers
  const q = new Uint16Array(W * H)
  for (let i = 0; i < q.length; i++) q[i] = Math.max(0, Math.min(65535, Math.round(f[i] * 4)))
  const d = new Int16Array(W * H)
  for (let y = 0; y < H; y++) {
    let prev = 0
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      d[i] = q[i] - prev
      prev = q[i]
    }
  }
  // zig-zag to unsigned so small negatives stay small
  const z = new Uint8Array(W * H * 2)
  for (let i = 0; i < d.length; i++) {
    const v = d[i], u = (v << 1) ^ (v >> 15)
    z[i * 2] = u & 255
    z[i * 2 + 1] = (u >> 8) & 255
  }
  const out = deflateSync(z, { level: 9 })
  const outDir = path.join(outRoot, id)
  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(path.join(outDir, 'height.q16'), out)

  // first-paint heightmap: 512x512 box-filtered, same encoding
  const L = 4, LW = W / L, LH = H / L
  const lo = new Uint8Array(LW * LH * 2)
  for (let y = 0; y < LH; y++) {
    let prev = 0
    for (let x = 0; x < LW; x++) {
      let sum = 0
      for (let yy = 0; yy < L; yy++) for (let xx = 0; xx < L; xx++) sum += f[(y * L + yy) * W + x * L + xx]
      const qv = Math.max(0, Math.min(65535, Math.round((sum / (L * L)) * 4)))
      const dv = qv - prev; prev = qv
      const uu = (dv << 1) ^ (dv >> 15)
      lo[(y * LW + x) * 2] = uu & 255
      lo[(y * LW + x) * 2 + 1] = (uu >> 8) & 255
    }
  }
  const outLo = deflateSync(lo, { level: 9 })
  await fs.writeFile(path.join(outDir, 'height-lo.q16'), outLo)
  meta.lo = { width: LW, height: LH }
  meta.q16 = { scale: 0.25, encoding: 'row-delta-zigzag-le16-deflate' }
  await fs.writeFile(path.join(dir, 'height.json'), JSON.stringify(meta, null, 2))
  await fs.writeFile(path.join(outDir, 'height.json'), JSON.stringify(meta, null, 2))
  for (const j of ['detail16.json', 'detail17.json']) { try { await fs.copyFile(path.join(dir, j), path.join(outDir, j)) } catch {} }
  console.log(`${id.padEnd(14)} ${(raw.length / 1048576).toFixed(1)} MB → ${(out.length / 1048576).toFixed(2)} MB (+ lo ${(outLo.length / 1024).toFixed(0)} KB)`)
}

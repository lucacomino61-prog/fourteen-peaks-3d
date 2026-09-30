// Compact heightmaps: Float32 (16 MB) → uint16 quarter-metres, row-delta coded, deflated.
// Writes public/terrain/<id>/height.q16 (2048²), height-mid.q16 (1024², for phones and weak
// devices: one value per 31 m, the DEM's own 30 m) and height-lo.q16 (512², the first paint),
// and keeps height.bin as the build source.
// Usage: node scripts/encode-height.mjs [id ...]   (default: every folder with a height.bin)
//        node scripts/encode-height.mjs --from-q16 [id ...]   (no sources: derive height-mid.q16
//        from the published height.q16, whose 0.25 m steps are the source's own precision)
import fs from 'node:fs/promises'
import path from 'node:path'
import { deflateSync, inflateSync } from 'fflate'

const root = 'terrain-src'
const outRoot = 'public/terrain'
const args = process.argv.slice(2)
const fromQ16 = args.includes('--from-q16')
const named = args.filter((a) => !a.startsWith('--'))
const ids = named.length ? named : (await fs.readdir(fromQ16 ? outRoot : root, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)

/** Float32 metres (north row first) → deflated zig-zag row deltas of quarter-metres */
function encode(f, W, H) {
  const z = new Uint8Array(W * H * 2)
  for (let y = 0; y < H; y++) {
    let prev = 0
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      // quantise to 0.25 m (max 16,383 m), then delta along rows so the stream is mostly small numbers
      const q = Math.max(0, Math.min(65535, Math.round(f[i] * 4)))
      const d = ((q - prev) << 16) >> 16 // wrapped to 16 bits, as the decoder adds modulo 65536
      prev = q
      const u = (d << 1) ^ (d >> 15) // zig-zag to unsigned so small negatives stay small
      z[i * 2] = u & 255
      z[i * 2 + 1] = (u >> 8) & 255
    }
  }
  return deflateSync(z, { level: 9 })
}

/** height.q16 → Float32 metres, rows as stored (north first) */
function decode(bytes, W, H, scale) {
  const z = inflateSync(bytes)
  const out = new Float32Array(W * H)
  for (let y = 0; y < H; y++) {
    let prev = 0
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const u = z[i * 2] | (z[i * 2 + 1] << 8)
      prev = (prev + ((u >>> 1) ^ -(u & 1))) & 0xffff
      out[i] = prev * scale
    }
  }
  return out
}

/** L×L box filter: each output value is the mean of the L² inputs it covers */
function box(f, W, H, L) {
  const LW = W / L, LH = H / L, out = new Float32Array(LW * LH)
  for (let y = 0; y < LH; y++)
    for (let x = 0; x < LW; x++) {
      let sum = 0
      for (let yy = 0; yy < L; yy++) for (let xx = 0; xx < L; xx++) sum += f[(y * L + yy) * W + x * L + xx]
      out[y * LW + x] = sum / (L * L)
    }
  return out
}

for (const id of ids) {
  const outDir = path.join(outRoot, id)
  if (fromQ16) {
    let bytes
    try { bytes = await fs.readFile(path.join(outDir, 'height.q16')) } catch { continue }
    const meta = JSON.parse(await fs.readFile(path.join(outDir, 'height.json'), 'utf8'))
    const f = decode(bytes, meta.width, meta.height, meta.q16?.scale || 0.25)
    const mid = encode(box(f, meta.width, meta.height, 2), meta.width / 2, meta.height / 2)
    await fs.writeFile(path.join(outDir, 'height-mid.q16'), mid)
    meta.mid = { width: meta.width / 2, height: meta.height / 2 }
    await fs.writeFile(path.join(outDir, 'height.json'), JSON.stringify(meta, null, 2))
    console.log(`${id.padEnd(14)} ${(bytes.length / 1048576).toFixed(2)} MB → mid ${(mid.length / 1048576).toFixed(2)} MB`)
    continue
  }
  const dir = path.join(root, id)
  let raw
  try { raw = await fs.readFile(path.join(dir, 'height.bin')) } catch { continue }
  const meta = JSON.parse(await fs.readFile(path.join(dir, 'height.json'), 'utf8'))
  const { width: W, height: H } = meta
  const f = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4)
  await fs.mkdir(outDir, { recursive: true })
  const out = encode(f, W, H)
  await fs.writeFile(path.join(outDir, 'height.q16'), out)
  const mid = encode(box(f, W, H, 2), W / 2, H / 2)
  await fs.writeFile(path.join(outDir, 'height-mid.q16'), mid)
  // first-paint heightmap: 512x512 box-filtered, same encoding
  const outLo = encode(box(f, W, H, 4), W / 4, H / 4)
  await fs.writeFile(path.join(outDir, 'height-lo.q16'), outLo)
  meta.mid = { width: W / 2, height: H / 2 }
  meta.lo = { width: W / 4, height: H / 4 }
  meta.q16 = { scale: 0.25, encoding: 'row-delta-zigzag-le16-deflate' }
  await fs.writeFile(path.join(dir, 'height.json'), JSON.stringify(meta, null, 2))
  await fs.writeFile(path.join(outDir, 'height.json'), JSON.stringify(meta, null, 2))
  for (const j of ['detail16.json', 'detail17.json']) { try { await fs.copyFile(path.join(dir, j), path.join(outDir, j)) } catch {} }
  console.log(`${id.padEnd(14)} ${(raw.length / 1048576).toFixed(1)} MB → ${(out.length / 1048576).toFixed(2)} MB (+ mid ${(mid.length / 1048576).toFixed(2)} MB, lo ${(outLo.length / 1024).toFixed(0)} KB)`)
}

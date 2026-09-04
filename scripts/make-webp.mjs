// Convert the shipped textures to WebP (smaller at the same visual quality) and make a 1K
// first-paint albedo. Keeps the JPEG sources for the pipeline. Usage: node scripts/make-webp.mjs [id ...]
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = 'terrain-src'
const outRoot = 'public/terrain'
const ids = process.argv.slice(2).length ? process.argv.slice(2) : (await fs.readdir(root, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)
const jobs = [
  ['albedo.jpg', 'albedo.webp', 4096, 82],
  ['albedo.jpg', 'albedo-2k.webp', 2048, 84],
  ['albedo.jpg', 'albedo-1k.webp', 1024, 84],
  ['detail16.jpg', 'detail16.webp', 4096, 82],
  ['detail16.jpg', 'detail16-2k.webp', 2048, 84],
  ['detail17.jpg', 'detail17.webp', 4096, 82],
  ['detail17.jpg', 'detail17-2k.webp', 2048, 84],
]
for (const id of ids) {
  const dir = path.join(root, id)
  let total = 0
  for (const [src, dst, size, quality] of jobs) {
    const s = path.join(dir, src)
    try { await fs.access(s) } catch { continue }
    await fs.mkdir(path.join(outRoot, id), { recursive: true })
    const out = path.join(outRoot, id, dst)
    await sharp(s).resize(size, size, { kernel: 'lanczos3' }).webp({ quality, effort: 4 }).toFile(out)
    total += (await fs.stat(out)).size
  }
  console.log(`${id.padEnd(14)} webp set ${(total / 1048576).toFixed(1)} MB`)
}

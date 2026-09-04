// Corrects hazy / over-exposed tiles in the Esri mosaic with a smooth, low-frequency
// contrast+exposure field (per-tile gains, bilinearly interpolated so no hard seams).
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets

const SRC = `${DIR}/albedo.jpg`
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height, T = 256, N = W / T

// per-tile luminance stats
const mean = new Float32Array(N * N), sd = new Float32Array(N * N)
for (let ty = 0; ty < N; ty++)
  for (let tx = 0; tx < N; tx++) {
    let s = 0, s2 = 0, n = 0
    for (let y = ty * T; y < (ty + 1) * T; y += 2)
      for (let x = tx * T; x < (tx + 1) * T; x += 2) {
        const i = (y * W + x) * 3
        const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        s += l; s2 += l * l; n++
      }
    const m = s / n
    mean[ty * N + tx] = m
    sd[ty * N + tx] = Math.sqrt(Math.max(s2 / n - m * m, 0))
  }

// correction grid: gain k and target mean per tile
const gain = new Float32Array(N * N).fill(1), target = new Float32Array(N * N)
for (let i = 0; i < N * N; i++) {
  target[i] = mean[i]
  const hazy = mean[i] > 222 && sd[i] < 32
  if (hazy) {
    gain[i] = Math.min(2.6, 44 / Math.max(sd[i], 8))
    target[i] = 206
  }
}
const flagged = [...gain].filter((g) => g !== 1).length
console.log(`hazy tiles corrected: ${flagged}/${N * N}`)

// bilinear sample of grid at pixel (tile-centre aligned)
function sampleGrid(arr, x, y) {
  const gx = Math.min(Math.max(x / T - 0.5, 0), N - 1), gy = Math.min(Math.max(y / T - 0.5, 0), N - 1)
  const x0 = Math.floor(gx), y0 = Math.floor(gy)
  const x1 = Math.min(x0 + 1, N - 1), y1 = Math.min(y0 + 1, N - 1)
  const tx = gx - x0, ty = gy - y0
  return (arr[y0 * N + x0] * (1 - tx) + arr[y0 * N + x1] * tx) * (1 - ty) +
         (arr[y1 * N + x0] * (1 - tx) + arr[y1 * N + x1] * tx) * ty
}

const out = Buffer.alloc(data.length)
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const k = sampleGrid(gain, x, y), m = sampleGrid(mean, x, y), t = sampleGrid(target, x, y)
    const i = (y * W + x) * 3
    for (let c = 0; c < 3; c++) {
      const v = (data[i + c] - m) * k + t
      out[i + c] = v < 0 ? 0 : v > 255 ? 255 : v
    }
  }

await sharp(out, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 88, mozjpeg: true }).toFile(`${DIR}/albedo-fixed.jpg`)
await sharp(`${DIR}/albedo-fixed.jpg`).resize(1024).jpeg({ quality: 80 }).toFile(`${DIR}/albedo-fixed-preview.jpg`)
console.log('written albedo-fixed.jpg')

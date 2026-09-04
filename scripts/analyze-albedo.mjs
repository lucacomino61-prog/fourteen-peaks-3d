// Print a 16x16 grid of per-tile mean luminance for albedo.jpg to locate seams.
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets
const { data, info } = await sharp(`${DIR}/albedo.jpg`).raw().toBuffer({ resolveWithObject: true })
const W = info.width, T = 256, N = W / T
const grid = []
for (let ty = 0; ty < N; ty++) {
  const row = []
  for (let tx = 0; tx < N; tx++) {
    let s = 0, s2 = 0, n = 0
    for (let y = ty * T; y < (ty + 1) * T; y += 4)
      for (let x = tx * T; x < (tx + 1) * T; x += 4) {
        const i = (y * W + x) * 3
        const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        s += l; s2 += l * l; n++
      }
    const m = s / n
    row.push({ m, sd: Math.sqrt(s2 / n - m * m) })
  }
  grid.push(row)
}
console.log('mean luminance (rows=N→S, cols=W→E)')
for (const row of grid) console.log(row.map((c) => String(Math.round(c.m)).padStart(4)).join(''))
console.log('std dev')
for (const row of grid) console.log(row.map((c) => String(Math.round(c.sd)).padStart(4)).join(''))

// Overlay DEM hillshade on an imagery preview to check registration.
import fs from 'node:fs/promises'
import sharp from 'sharp'
const PEAK_ID = process.env.PEAK || 'k2'
const DIR = `terrain-src/${PEAK_ID}`   // pipeline sources (not shipped)
const OUT = `public/terrain/${PEAK_ID}` // shipped assets
const img = process.argv[2] || `${DIR}/preview-clarity-z13.jpg`
const out = process.argv[3] || `${DIR}/check-align.jpg`
const base = await sharp(img).resize(1024).toBuffer()
const shade = await sharp(`${DIR}/preview-hillshade.png`).resize(1024).png().toBuffer()
await sharp(base).composite([{ input: shade, blend: 'multiply' }]).jpeg({ quality: 82 }).toFile(out)
console.log('written', out)

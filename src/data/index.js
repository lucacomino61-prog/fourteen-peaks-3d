import k2 from './k2.js'
import everest from './everest.js'
import annapurna from './annapurna.js'
import kangchenjunga from './kangchenjunga.js'
import lhotse from './lhotse.js'
import makalu from './makalu.js'
import chooyu from './chooyu.js'
import dhaulagiri from './dhaulagiri.js'
import manaslu from './manaslu.js'
import nangaparbat from './nangaparbat.js'
import gasherbrum1 from './gasherbrum1.js'
import gasherbrum2 from './gasherbrum2.js'
import broadpeak from './broadpeak.js'
import shishapangma from './shishapangma.js'
import { slugify } from '../lib/meta.js'

// ordered highest to lowest, so the arrows walk down the fourteen
export const mountains = [k2, everest, annapurna, kangchenjunga, lhotse, makalu, chooyu, dhaulagiri, manaslu, nangaparbat, gasherbrum1, gasherbrum2, broadpeak, shishapangma]
  .sort((a, b) => b.peak.elevation - a.peak.elevation)
export const byId = Object.fromEntries(mountains.map((m) => [m.id, m]))

// A camp's address slug comes from its English name (/k2/abruzzi/camp-4/), and a figure's key from
// its English label (lib/compare.js finds them by it), both fixed here before any translation
// renames them, so links and the comparison work in every language.
for (const m of mountains) {
  for (const r of m.routes) for (const c of r.camps) c.slug = slugify(c.name)
  for (const s of m.stats) s.key = s.label
}

// rank among the fourteen by height
;[...mountains].sort((a, b) => b.peak.elevation - a.peak.elevation).forEach((m, i) => { m.rank = i + 1 })
export const byRank = [...mountains].sort((a, b) => a.rank - b.rank)

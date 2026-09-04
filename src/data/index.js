import k2 from './k2'
import everest from './everest'
import annapurna from './annapurna'
import kangchenjunga from './kangchenjunga'
import lhotse from './lhotse'
import makalu from './makalu'
import chooyu from './chooyu'
import dhaulagiri from './dhaulagiri'
import manaslu from './manaslu'
import nangaparbat from './nangaparbat'
import gasherbrum1 from './gasherbrum1'
import gasherbrum2 from './gasherbrum2'
import broadpeak from './broadpeak'
import shishapangma from './shishapangma'

// ordered highest to lowest, so the arrows walk down the fourteen
export const mountains = [k2, everest, annapurna, kangchenjunga, lhotse, makalu, chooyu, dhaulagiri, manaslu, nangaparbat, gasherbrum1, gasherbrum2, broadpeak, shishapangma]
  .sort((a, b) => b.peak.elevation - a.peak.elevation)
export const byId = Object.fromEntries(mountains.map((m) => [m.id, m]))

// rank among the fourteen by height
;[...mountains].sort((a, b) => b.peak.elevation - a.peak.elevation).forEach((m, i) => { m.rank = i + 1 })
export const byRank = [...mountains].sort((a, b) => a.rank - b.rank)

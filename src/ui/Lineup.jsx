import { useState } from 'react'
import skylines from '../data/skylines.json'
import { fmt } from '../lib/format'
import { alt as altitude, useUnits } from '../lib/units'
import { mountainPath } from '../lib/meta'
import { t } from '../i18n'

// The fourteen side by side, highest first: each one's outline from its own elevation model, seen
// from the south within a kilometre of its summit (scripts/make-skylines.mjs), all at one vertical
// scale. Sideways each outline is 9 km of ground squeezed into its slot, so only the heights compare.
// One series, so no legend: the mountain on screen is drawn in the signal, the others in snow; each
// is named under its slot (two staggered rows, so fourteen names never collide).

const FLOOR = 4000, CEIL = 9000 // metres at the bottom and top of the chart
const SLOT = 100 // SVG units per mountain
const Y = (m) => ((CEIL - m) / (CEIL - FLOOR)) * 1000

export default function Lineup({ list, current, onPick }) {
  const units = useUnits()
  const [hover, setHover] = useState(null)
  const W = list.length * SLOT
  const grid = [5000, 6000, 7000, 9000]
  return (
    <figure className="lineup">
      <p className="swipe-hint mono" aria-hidden="true">{t('Swipe sideways to see all fourteen')}</p>
      <div className="lineup-scroll" data-lenis-prevent>
        <div className="lineup-chart" style={{ '--n': list.length }}>
          <svg viewBox={`0 0 ${W} 1000`} preserveAspectRatio="none" aria-hidden="true">
            {grid.map((g) => <line key={g} className="ln-grid" x1="0" x2={W} y1={Y(g)} y2={Y(g)} />)}
            {list.map((m, i) => {
              const sky = skylines[m.id]
              if (!sky) return null
              const n = sky.points.length
              const x = (k) => i * SLOT + 4 + (k / (n - 1)) * (SLOT - 8)
              // the skyline itself is the line; the sides where the 9 km were cut are only the wash's edge
              const top = sky.points.map((p, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${Y(Math.max(FLOOR, p)).toFixed(1)}`).join('')
              return (
                <g key={m.id} className={`ln-peak ${m.id === current ? 'is-current' : ''} ${m.id === hover ? 'is-hover' : ''}`}>
                  <path className="ln-fill" d={`M${x(0)} 1000L${top.slice(1)}L${x(n - 1)} 1000Z`} />
                  <path className="ln-line" d={top} />
                </g>
              )
            })}
            <line className="ln-dz" x1="0" x2={W} y1={Y(8000)} y2={Y(8000)} />
          </svg>
          <div className="ln-y mono" aria-hidden="true">
            {[...grid, 8000].map((g) => <span key={g} style={{ top: `${Y(g) / 10}%` }} className={g === 8000 ? 'is-dz' : ''}>{altitude(g, units)}</span>)}
          </div>
          <ol className="ln-names">
            {list.map((m, i) => (
              <li key={m.id} style={{ '--i': i }} className={i % 2 ? 'is-low' : ''}>
                <a href={mountainPath(m.id)} className={m.id === current ? 'is-current' : ''} aria-current={m.id === current ? 'page' : undefined}
                  onClick={(e) => { e.preventDefault(); onPick(m.id) }} onPointerEnter={() => setHover(m.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(m.id)} onBlur={() => setHover(null)}>
                  <b translate="no">{m.peak.name}</b>
                  <span className="mono">{altitude(m.peak.elevation, units)}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <figcaption>
        {t('Each outline is the mountain seen from the south, cut from its elevation model within a kilometre of its summit and corrected to its surveyed height. Heights are to one scale; sideways, each is {km} km of ground squeezed into its slot.', { km: fmt(skylines[list[0]?.id]?.km || 9) })}
      </figcaption>
    </figure>
  )
}

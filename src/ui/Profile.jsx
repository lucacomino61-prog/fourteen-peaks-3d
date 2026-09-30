import { useEffect, useMemo, useRef, useState } from 'react'
import { ROUTE_LIFT_M } from '../lib/paths'
import { fmt } from '../lib/format'
import { alt as altitude } from '../lib/units'
import { t as tr } from '../i18n'

// The route's side view, in the altimeter (ui/Ascent.jsx): height against distance along the line,
// its camps and hazards, the 8,000 m line, the part climbed so far in the signal and the rest in
// snow. It is also the climb's scrubber: drag along it (or use the arrow keys) and the page moves
// to that point of the climb.
//
// The line and its wash are an SVG stretched to the box (hairlines keep their width); dots, labels
// and the read-out are HTML placed in percent, so they stay round and grow with the text size.
// Heights: the elevation model under the drawn route, pinned to each stop's documented altitude
// exactly as the altimeter is (the gap between the two is spread linearly between stops).

const MI = 1.609344
const FEET = 3.28084

/** Distance for the axis and the read-out: "5.8 km" or "3.6 mi" */
const dist = (km, units) => (units === 'ft' ? `${fmt(Math.round((km / MI) * 10) / 10)} mi` : `${fmt(Math.round(km * 10) / 10)} km`)

/** The profile of a draped route, pinned to its stops' documented altitudes. */
function buildProfile(path, stops) {
  const pts = path.points, cum = path.cumulative, L = path.length || 1
  const hd = new Float64Array(pts.length)
  for (let i = 1; i < pts.length; i++) hd[i] = hd[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z)
  const total = hd[pts.length - 1] || 1
  const gapAt = (t) => {
    let i = 0
    while (i < stops.length - 2 && stops[i + 1].t < t) i++
    const a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)]
    const f = b.t > a.t ? Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))) : 0
    return a.gap + (b.gap - a.gap) * f
  }
  /** horizontal km at arc fraction t */
  const xAt = (t) => {
    const target = Math.min(1, Math.max(0, t)) * L
    let lo = 0, hi = cum.length - 1
    while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= target) lo = mid; else hi = mid }
    const seg = cum[hi] - cum[lo] || 1
    return hd[lo] + (hd[hi] - hd[lo]) * ((target - cum[lo]) / seg)
  }
  /** arc fraction t at horizontal km x (the inverse of xAt) */
  const tAt = (x) => {
    const target = Math.min(total, Math.max(0, x))
    let lo = 0, hi = hd.length - 1
    while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (hd[mid] <= target) lo = mid; else hi = mid }
    const seg = hd[hi] - hd[lo] || 1
    return (cum[lo] + (cum[hi] - cum[lo]) * ((target - hd[lo]) / seg)) / L
  }
  const step = Math.max(1, Math.floor(pts.length / 200))
  const samples = []
  for (let i = 0; i < pts.length; i += step) {
    const t = cum[i] / L
    samples.push({ x: hd[i], t, alt: pts[i].y * 1000 - ROUTE_LIFT_M + gapAt(t) })
  }
  const last = pts.length - 1
  if (samples[samples.length - 1].x < hd[last]) samples.push({ x: hd[last], t: 1, alt: pts[last].y * 1000 - ROUTE_LIFT_M + gapAt(1) })
  const marks = stops.filter((s) => !s.overview).map((s) => ({ key: s.key, x: xAt(s.t), alt: s.alt, title: s.title, camp: !!s.camp, hazard: s.hazard, end: s.t >= 1 }))
  let lowest = Infinity, highest = -Infinity
  for (const p of samples) { lowest = Math.min(lowest, p.alt); highest = Math.max(highest, p.alt) }
  for (const m of marks) { lowest = Math.min(lowest, m.alt); highest = Math.max(highest, m.alt) }
  return { samples, marks, total, xAt, tAt, lowest, highest }
}

/** Nice round ticks in the unit in use, inside [lo, hi] metres: every 1,000 m or 5,000 ft */
function ticks(lo, hi, units) {
  const out = []
  if (units === 'ft') { for (let f = Math.ceil((lo * FEET) / 5000) * 5000; f <= hi * FEET; f += 5000) out.push({ m: f / FEET, label: `${fmt(f)}` }) }
  else for (let m = Math.ceil(lo / 1000) * 1000; m <= hi; m += 1000) out.push({ m, label: fmt(m) })
  return out
}

/**
 * `register` receives the function that moves the position (t along the line, height in metres),
 * called by the ascent's scroll each frame without a React render; `onSeek` asks the page to go to
 * { index } / { key } of a stop, or { t } between stops.
 */
export default function Profile({ path, stops, units, active, register, onSeek, children }) {
  const prof = useMemo(() => buildProfile(path, stops), [path, stops])
  // the chart's height range: a little room under the lowest point and over the highest
  const lo = Math.floor((prof.lowest - 150) / 500) * 500
  const hi = Math.ceil((prof.highest + 100) / 500) * 500
  const X = (km) => (km / prof.total) * 100 // % across
  const Y = (m) => (1 - (m - lo) / (hi - lo)) * 100 // % down
  const line = prof.samples.map((p, i) => `${i ? 'L' : 'M'}${(X(p.x) * 10).toFixed(1)} ${(Y(p.alt) * 10).toFixed(1)}`).join('')
  const area = `${line}L1000 1000L0 1000Z`
  const grid = ticks(lo, hi, units)
  const dz = 8000 > lo && 8000 < hi ? Y(8000) : null

  // the position, moved each frame by the ascent's scroll (no React render)
  const me = useRef()
  const clip = useRef()
  useEffect(() => {
    register((t, altM) => {
      const x = X(prof.xAt(t)), y = Y(altM)
      if (me.current) { me.current.style.left = `${x}%`; me.current.style.top = `${y}%` }
      if (clip.current) clip.current.setAttribute('width', (x * 10).toFixed(1))
    })
    return () => register(null)
  })

  // the read-out under the pointer (or the keyboard's stop)
  const [hover, setHover] = useState(null) // { x%, y%, alt, km, near }
  const box = useRef()
  const at = (clientX) => {
    const r = box.current.getBoundingClientRect()
    const km = Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * prof.total
    // the sample nearest the pointer, and a stop if one is close by
    let best = prof.samples[0]
    for (const p of prof.samples) if (Math.abs(p.x - km) < Math.abs(best.x - km)) best = p
    const near = prof.marks.reduce((n, m) => (Math.abs(m.x - km) < prof.total * 0.035 && (!n || Math.abs(m.x - km) < Math.abs(n.x - km)) ? m : n), null)
    const p = near || best
    return { x: X(p.x), y: Y(p.alt), alt: p.alt, km: p.x, near, t: near ? null : best.t }
  }
  const drag = useRef(false)
  const seekTo = (h) => onSeek(h.near ? { key: h.near.key } : { t: prof.tAt(h.km) })
  const onDown = (e) => {
    drag.current = true
    box.current.setPointerCapture?.(e.pointerId)
    const h = at(e.clientX)
    setHover(h)
    seekTo(h)
  }
  const onMove = (e) => {
    const h = at(e.clientX)
    setHover(h)
    if (drag.current) seekTo(h)
  }
  const onUp = (e) => { drag.current = false; box.current.releasePointerCapture?.(e.pointerId) }
  const onKey = (e) => {
    const n = stops.length
    const go = { ArrowRight: active + 1, ArrowUp: active + 1, ArrowLeft: active - 1, ArrowDown: active - 1, Home: 0, End: n - 1, PageUp: active + 3, PageDown: active - 3 }[e.key]
    if (go === undefined) return
    e.preventDefault()
    onSeek({ index: Math.min(n - 1, Math.max(0, go)) })
  }
  const cur = stops[active]
  const valueText = cur ? `${cur.title}, ${altitude(cur.alt, units)}` : ''

  return (
    <div className="profile" data-lenis-prevent>
      {children}
      <div
        className="profile-plot" ref={box} role="slider" tabIndex={0}
        aria-label={tr('Where you are on the climb: the route in profile')}
        aria-valuemin={1} aria-valuemax={stops.length} aria-valuenow={active + 1} aria-valuetext={valueText}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        onPointerLeave={() => { if (!drag.current) setHover(null) }} onKeyDown={onKey}
      >
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <defs><clipPath id="pf-climbed"><rect ref={clip} x="0" y="0" width="0" height="1000" /></clipPath></defs>
          {grid.map((g) => <line key={g.m} className="pf-grid" x1="0" x2="1000" y1={Y(g.m) * 10} y2={Y(g.m) * 10} />)}
          <path className="pf-area" d={area} />
          <path className="pf-line" d={line} />
          <path className="pf-line pf-climbed" d={line} clipPath="url(#pf-climbed)" />
          {dz !== null && <line className="pf-dz" x1="0" x2="1000" y1={dz * 10} y2={dz * 10} />}
        </svg>
        {prof.marks.map((m) => (
          <i key={m.key} aria-hidden="true" className={`pf-mark ${m.camp ? 'is-camp' : 'is-hazard'} ${m.end ? 'is-end' : ''} ${m.hazard?.severity >= 5 ? 'is-grave' : ''}`} style={{ left: `${X(m.x)}%`, top: `${Y(m.alt)}%` }} />
        ))}
        <i className="pf-me" ref={me} aria-hidden="true" />
        {hover && (
          <>
            <i className="pf-x" aria-hidden="true" style={{ left: `${hover.x}%` }} />
            <span className={`pf-read mono ${hover.x > 60 ? 'is-left' : ''}`} aria-hidden="true" style={{ left: `${hover.x}%` }}>
              <b>{altitude(hover.alt, units)}</b>
              <span>{hover.near ? hover.near.title : dist(hover.km, units)}</span>
            </span>
          </>
        )}
        <div className="pf-y mono" aria-hidden="true">
          {grid.map((g) => <span key={g.m} style={{ top: `${Y(g.m)}%` }}>{g.label}</span>)}
        </div>
      </div>
      {/* the distance along the line, and the key to the one coloured line */}
      <p className="pf-x-axis mono" aria-hidden="true">
        <span>0</span>
        {dz !== null && <span className="pf-key"><i />{altitude(8000, units)}</span>}
        <span>{dist(prof.total, units)}</span>
      </p>
    </div>
  )
}

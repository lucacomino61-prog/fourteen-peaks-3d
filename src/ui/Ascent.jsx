import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ROUTE_LIFT_M, fractionNear, pointAt } from '../lib/paths'
import { useStore, useMountain } from '../store'
import { jumpTo } from '../lib/clock'
import { fmt, pad2 } from '../lib/format'
import { alt as altitude, inUnits, metresText, unitName, useUnits } from '../lib/units'
import { Warning, ArrowRight } from './Icons'

gsap.registerPlugin(ScrollTrigger)

/** Ground altitude of the elevation model (m) at fraction t along a draped route. */
const modelAlt = (path, t) => pointAt(path, t).y * 1000 - ROUTE_LIFT_M

/** Build the scroll stops for one route: overview, then camps and hazards in order along the line, then the finish. */
function buildStops(terrain, route, path, H, peak) {
  const at = (lat, lon) => fractionNear(path, terrain.surface(lat, lon))
  const items = []
  route.camps.forEach((c, i) => items.push({ key: `camp:${i}:${c.name}`, t: at(c.lat, c.lon), title: c.name, alt: c.alt, body: c.blurb, camp: c }))
  for (const id of route.hazards) {
    const h = H[id]
    if (!h || h.band) continue
    items.push({ key: `hz:${id}`, t: at(h.lat, h.lon), title: h.name, alt: h.alt, body: h.blurb, hazard: h })
  }
  items.sort((a, b) => a.t - b.t)

  // a hazard sitting on a camp becomes a line on the camp's card
  const merged = []
  for (const it of items) {
    const prev = merged[merged.length - 1]
    if (prev && Math.abs(prev.t - it.t) < 0.035) {
      if (it.hazard && !prev.hazard) { prev.hazard = it.hazard; continue }
      if (it.camp && !prev.camp) { merged[merged.length - 1] = { ...it, hazard: prev.hazard }; continue }
    }
    merged.push(it)
  }

  const [lastLat, lastLon] = route.waypoints[route.waypoints.length - 1]
  const joinName = route.joins ? (peak.routesById?.[route.joins]?.name || 'normal route') : 'normal route'
  const endsAtSummit = Math.abs(lastLat - peak.lat) < 1e-4 && Math.abs(lastLon - peak.lon) < 1e-4
  const end = endsAtSummit
    ? { key: 'summit', t: 1, title: 'Summit', alt: peak.elevation, body: peak.summitText }
    : route.finish
    ? { key: 'finish', t: 1, ...route.finish }
    : { key: 'join', t: 1, title: `Joins the ${joinName}`, alt: route.camps[route.camps.length - 1]?.alt || 7900, body: `From here the line shares the ${joinName} to the summit.` }

  const first = merged[0]
  const overview = { key: 'overview', t: 0, overview: true, title: route.name, alt: first?.alt || 5000, body: route.summary, route }
  const stops = [overview, ...merged.filter((m) => m.t < 0.975), end]
  // The model rounds off the summits (lib/calibrate.js), so the altimeter follows the ground
  // between stops but is pinned to the documented altitude on each stop's card.
  for (const s of stops) s.gap = s.alt - modelAlt(path, s.t)
  return stops
}

function StopCard({ s, i, n, route, num, active, units }) {
  const hz = s.hazard
  // on a phone the route's facts fold away behind a button, so the card leaves the route in view
  const [facts, setFacts] = useState(false)
  return (
    // the altitude is the altimeter's to show; the card names the stop (and tells screen readers the height)
    <article className={`ascent-card ${active ? 'is-active' : ''} ${s.overview ? 'is-overview' : ''}`} aria-hidden={!active} data-alt={s.alt}>
      <h3>{s.title}<span className="visually-hidden">, {altitude(s.alt, units)}</span>{s.overview && <span>{route.aka}</span>}</h3>
      <p>{s.body}</p>
      {s.overview && (
        <>
          <button type="button" className="facts-toggle mono" aria-expanded={facts} aria-controls={`facts-${route.id}`} onClick={() => setFacts(!facts)} tabIndex={active ? 0 : -1}>
            {facts ? 'Fewer details' : 'Route facts'}
          </button>
          <dl className="facts" id={`facts-${route.id}`} data-open={facts ? '1' : '0'}>
            <div><dt>first ascent</dt><dd>{route.firstAscent}</dd></div>
            <div><dt>traffic</dt><dd>{route.share}</dd></div>
            <div><dt>difficulty</dt><dd>{route.difficulty}</dd></div>
            <div><dt>vertical</dt><dd>{metresText(route.verticalGain, units)}</dd></div>
          </dl>
        </>
      )}
      {hz && (
        <div className={`haz sev-${hz.severity}`}>
          <Warning />
          <div><b>{hz.kind}</b>{hz.incidents[0] ? <><br />{hz.incidents[0]}</> : null}</div>
        </div>
      )}
      <p className="stop-foot mono">{pad2(num)} {route.name} · {i + 1} of {n}</p>
    </article>
  )
}

export default function Ascent({ terrain }) {
  const paths = useStore((s) => s.paths)
  const activeRoute = useStore((s) => s.activeRoute)
  const { routes, hazards, peak: peakData } = useMountain()
  const H = useMemo(() => Object.fromEntries(hazards.map((h) => [h.id, h])), [hazards])
  const peak = useMemo(() => ({ ...peakData, routesById: Object.fromEntries(routes.map((r) => [r.id, r])) }), [peakData, routes])
  const route = useMemo(() => routes.find((r) => r.id === activeRoute) || null, [routes, activeRoute])
  const path = route ? paths?.[route.id] : null
  const stops = useMemo(() => (path && route ? buildStops(terrain, route, path, H, peak) : []), [terrain, route, path, H, peak])
  const choose = useStore((s) => s.chooseRoute)
  const motion = useStore((s) => s.motion)
  const units = useUnits()
  const [active, setActive] = useState(0)
  const root = useRef()
  const altRef = useRef()
  const dotRef = useRef()
  const shownAlt = useRef(0) // the altimeter's height in metres, for a change of unit
  const minAlt = stops[0]?.alt || 5000, maxAlt = peak.elevation

  useEffect(() => {
    if (!stops.length || !root.current || !path) return
    const el = root.current
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: motion === 'on' ? 0.6 : true, // stopped animations: the flight follows the scroll exactly
      onUpdate(self) {
        const n = stops.length
        const seg = self.progress * (n - 1)
        const i = Math.min(Math.floor(seg), n - 2)
        const f = seg - i
        const t = stops[i].t + (stops[i + 1].t - stops[i].t) * f
        useStore.setState({ progress: t })
        setActive(Math.round(seg))
        if (altRef.current) {
          const alt = Math.round(modelAlt(path, t) + stops[i].gap + (stops[i + 1].gap - stops[i].gap) * f)
          shownAlt.current = alt
          altRef.current.textContent = fmt(inUnits(alt))
          if (dotRef.current) dotRef.current.style.bottom = `${Math.min(100, Math.max(0, ((alt - minAlt) / (maxAlt - minAlt)) * 100))}%`
        }
      },
    })
    ScrollTrigger.refresh()
    return () => st.kill()
  }, [stops, path, minAlt, maxAlt, motion])

  // metres ↔ feet in the settings: the altimeter redraws where it is
  useEffect(() => { if (altRef.current && shownAlt.current) altRef.current.textContent = fmt(inUnits(shownAlt.current, units)) }, [units])

  const pick = (id) => {
    if (id === activeRoute) return
    choose(id)
    setActive(0)
    jumpTo(root.current.getBoundingClientRect().top + window.scrollY)
  }
  const num = routes.findIndex((r) => r.id === activeRoute) + 1
  // the section changes height when a route is chosen: the mode triggers need new positions
  useEffect(() => { ScrollTrigger.refresh() }, [activeRoute])

  // A route picked further down (in the explorer, or by search) changes this section's height,
  // which would move everything below it on screen. Keep the view where it is: the page is shifted
  // by the difference before it paints. (Browser scroll anchoring would do this in Chrome only;
  // it is switched off for the page, so every browser gets the same.)
  const lastHeight = useRef(0)
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const h = el.offsetHeight
    const prev = lastHeight.current
    lastHeight.current = h
    if (!prev || prev === h) return
    const top = el.getBoundingClientRect().top + window.scrollY
    if (window.scrollY >= top + prev - 1) jumpTo(window.scrollY + (h - prev))
  }, [activeRoute, stops.length])

  // phones: the tabs are one row that scrolls sideways; bring the chosen one into it
  const tabsRef = useRef()
  useEffect(() => {
    const strip = tabsRef.current
    const tab = strip?.querySelector('[aria-selected="true"]')
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) return
    strip.scrollLeft = Math.max(0, tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2)
  }, [activeRoute])

  if (!route) {
    return (
      <section id="ascent" className="ascent is-choose" ref={root} aria-label="Choose a route">
        <div className="wrap">
          <div className="choose">
            <div className="choose-head">
              <span className="mono">{routes.length} ways up</span>
              <h2>Choose a route</h2>
              <p>Each route is climbed camp by camp as you scroll. Pick one to draw it on the mountain.</p>
            </div>
            <ul className="choose-list">
              {routes.map((r, i) => (
                <li key={r.id}>
                  <button className="choose-item" onClick={() => pick(r.id)}>
                    <span className="num mono">{pad2(i + 1)}</span>
                    <span className="txt">
                      <b>{r.name}</b>
                      <small>{r.aka}</small>
                      <span className="meta mono">{r.share} · {r.verticalGain}</span>
                    </span>
                    <ArrowRight />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="ascent" className="ascent" ref={root} data-active="1" aria-label="Climb each route camp by camp">
      <div className="ascent-sticky">
        <div className="ascent-tabs" role="tablist" aria-label="Route" ref={tabsRef}>
          {routes.map((r, i) => (
            <button key={r.id} role="tab" aria-selected={r.id === activeRoute} className="tab" onClick={() => pick(r.id)}>
              <i className="mono">{pad2(i + 1)}</i><span>{r.name}</span>
            </button>
          ))}
        </div>
        {stops.map((s, i) => <StopCard key={s.key} s={s} i={i} n={stops.length} route={route} num={num} active={i === active} units={units} />)}
        <div className="altimeter" aria-live="off">
          <small className="mono">altitude, {unitName(units)}</small>
          <b className="mono"><span ref={altRef}>{fmt(inUnits(minAlt, units))}</span></b>
          <div className="rail">
            <i style={{ bottom: '0%' }} />
            <i className="dz" style={{ bottom: `${((8000 - minAlt) / (maxAlt - minAlt)) * 100}%` }} title="8,000 m" />
            <i style={{ bottom: '100%' }} />
            <b ref={dotRef} style={{ bottom: '0%' }} />
          </div>
          <small className="mono">the orange tick is {altitude(8000, units)}</small>
        </div>
      </div>
      <div className="ascent-track" style={{ marginTop: '-100dvh' }}>
        {stops.map((s) => <div key={s.key} className="ascent-stop" />)}
      </div>
    </section>
  )
}

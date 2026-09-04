import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fractionNear, pointAt } from '../lib/paths'
import { useStore, useMountain } from '../store'
import { Warning, ArrowRight } from './Icons'

gsap.registerPlugin(ScrollTrigger)


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
  return [overview, ...merged.filter((m) => m.t < 0.975), end]
}

function StopCard({ s, i, n, route, active, H }) {
  const hz = s.hazard
  return (
    <article className={`ascent-card ${active ? 'is-active' : ''} ${s.overview ? 'is-overview' : ''}`} aria-hidden={!active} style={{ '--c': route.color }}>
      <div className="alt"><b>{s.alt.toLocaleString()} m</b><i>{route.name} · {i + 1} of {n}</i></div>
      <h3>{s.title}{s.overview && <span>{route.aka}</span>}</h3>
      <p>{s.body}</p>
      {s.overview && (
        <dl className="facts">
          <div><dt>first ascent</dt><dd>{route.firstAscent}</dd></div>
          <div><dt>traffic</dt><dd>{route.share}</dd></div>
          <div><dt>difficulty</dt><dd>{route.difficulty}</dd></div>
          <div><dt>vertical</dt><dd>{route.verticalGain}</dd></div>
        </dl>
      )}
      {hz && (
        <div className={`haz sev-${hz.severity}`}>
          <Warning />
          <div><b>{hz.kind}</b>{hz.incidents[0] ? <><br />{hz.incidents[0]}</> : null}</div>
        </div>
      )}
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
  const [active, setActive] = useState(0)
  const root = useRef()
  const altRef = useRef()
  const dotRef = useRef()
  const minAlt = stops[0]?.alt || 5000, maxAlt = peak.elevation

  useEffect(() => {
    if (!stops.length || !root.current || !path) return
    const el = root.current
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate(self) {
        const n = stops.length
        const seg = self.progress * (n - 1)
        const i = Math.min(Math.floor(seg), n - 2)
        const f = seg - i
        const t = stops[i].t + (stops[i + 1].t - stops[i].t) * f
        useStore.setState({ progress: t })
        setActive(Math.round(seg))
        if (altRef.current) {
          const p = pointAt(path, t)
          const alt = Math.round(p.y * 1000 - 22)
          altRef.current.textContent = alt.toLocaleString()
          if (dotRef.current) dotRef.current.style.bottom = `${Math.min(100, Math.max(0, ((alt - minAlt) / (maxAlt - minAlt)) * 100))}%`
        }
      },
    })
    ScrollTrigger.refresh()
    return () => st.kill()
  }, [stops, path, minAlt, maxAlt])

  const pick = (id) => {
    if (id === activeRoute) return
    choose(id)
    setActive(0)
    const top = root.current?.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: 'auto' })
  }
  // the section changes height when a route is chosen: the mode triggers need new positions
  useEffect(() => { ScrollTrigger.refresh() }, [activeRoute])

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
              {routes.map((r) => (
                <li key={r.id}>
                  <button className="choose-item" style={{ '--c': r.color }} onClick={() => pick(r.id)}>
                    <span className="sw" />
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
        <div className="ascent-tabs" role="tablist" aria-label="Route">
          {routes.map((r) => (
            <button key={r.id} role="tab" aria-selected={r.id === activeRoute} className="tab" style={{ '--c': r.color }} onClick={() => pick(r.id)}>
              <i /><span>{r.name}</span>
            </button>
          ))}
        </div>
        {stops.map((s, i) => <StopCard key={s.key} s={s} i={i} n={stops.length} route={route} active={i === active} H={H} />)}
        <div className="altimeter" aria-live="off">
          <small>altitude</small>
          <b><span ref={altRef}>{minAlt.toLocaleString()}</span> m</b>
          <div className="rail">
            <i style={{ bottom: '0%' }} />
            <i className="dz" style={{ bottom: `${((8000 - minAlt) / (maxAlt - minAlt)) * 100}%` }} title="8,000 m" />
            <i style={{ bottom: '100%' }} />
            <b ref={dotRef} style={{ bottom: '0%' }} />
          </div>
          <small>8,000 m line in red</small>
        </div>
      </div>
      <div className="ascent-track" style={{ marginTop: '-100dvh' }}>
        {stops.map((s) => <div key={s.key} className="ascent-stop" />)}
      </div>
    </section>
  )
}

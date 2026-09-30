import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ROUTE_LIFT_M, fractionNear, pointAt } from '../lib/paths'
import { useStore, useMountain } from '../store'
import { jumpTo } from '../lib/clock'
import { fmt, pad2 } from '../lib/format'
import { alt as altitude, inUnits, metresText, unitName, useUnits } from '../lib/units'
import { campSlug, routeEnd, routePath, stopTitle, routeTitle } from '../lib/meta'
import { share } from '../lib/share'
import { t } from '../i18n'
import { Warning, ArrowRight, Link } from './Icons'

gsap.registerPlugin(ScrollTrigger)

// a system share sheet (phones, tablets) shares a stop; elsewhere its link is copied
const canShare = typeof navigator !== 'undefined' && !!navigator.share && typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches

/** Ground altitude of the elevation model (m) at fraction t along a draped route. */
const modelAlt = (path, t) => pointAt(path, t).y * 1000 - ROUTE_LIFT_M

/**
 * Build the scroll stops for one route: overview, then camps and hazards in order along the line,
 * then the finish. Each stop has the slug its address uses (lib/address.js): a camp's from its
 * English name, a hazard's id, 'summit', 'finish' or 'join'; a hazard folded into a camp's card
 * answers to its own id too (aliases).
 */
function buildStops(terrain, route, path, H, peak) {
  const at = (lat, lon) => fractionNear(path, terrain.surface(lat, lon))
  const items = []
  route.camps.forEach((c, i) => items.push({ key: `camp:${i}:${c.name}`, slug: campSlug(c), t: at(c.lat, c.lon), title: c.name, alt: c.alt, body: c.blurb, camp: c }))
  for (const id of route.hazards) {
    const h = H[id]
    if (!h || h.band) continue
    items.push({ key: `hz:${id}`, slug: id, t: at(h.lat, h.lon), title: h.name, alt: h.alt, body: h.blurb, hazard: h })
  }
  items.sort((a, b) => a.t - b.t)

  // a hazard sitting on a camp becomes a line on the camp's card
  const merged = []
  for (const it of items) {
    const prev = merged[merged.length - 1]
    if (prev && Math.abs(prev.t - it.t) < 0.035) {
      if (it.hazard && !prev.hazard) { prev.hazard = it.hazard; prev.aliases = [it.slug]; continue }
      if (it.camp && !prev.camp) { merged[merged.length - 1] = { ...it, hazard: prev.hazard, aliases: [prev.slug] }; continue }
    }
    merged.push(it)
  }

  const joinName = route.joins ? (peak.routesById?.[route.joins]?.name || t('normal route')) : t('normal route')
  const kind = routeEnd(route, peak)
  const end = kind === 'summit'
    ? { key: 'summit', slug: 'summit', t: 1, title: t('Summit'), alt: peak.elevation, body: peak.summitText }
    : kind === 'finish'
    ? { key: 'finish', slug: 'finish', t: 1, ...route.finish }
    : { key: 'join', slug: 'join', t: 1, title: t('Joins the {route}', { route: joinName }), alt: route.camps[route.camps.length - 1]?.alt || 7900, body: t('From here the line shares the {route} to the summit.', { route: joinName }) }

  const first = merged[0]
  const overview = { key: 'overview', slug: null, t: 0, overview: true, title: route.name, alt: first?.alt || 5000, body: route.summary, route }
  const stops = [overview, ...merged.filter((m) => m.t < 0.975), end]
  // The model rounds off the summits (lib/calibrate.js), so the altimeter follows the ground
  // between stops but is pinned to the documented altitude on each stop's card.
  for (const s of stops) s.gap = s.alt - modelAlt(path, s.t)
  return stops
}

/** The stop's own address, shared from its card (the system sheet on a phone, else copied). */
function shareStop(mountain, route, s) {
  const stop = s.overview ? null : { kind: s.slug === 'summit' ? 'summit' : 'camp', name: s.title, alt: s.alt }
  share({
    title: stop ? stopTitle(mountain, route, stop) : routeTitle(mountain, route),
    text: stop ? `${s.title} · ${route.name}, ${mountain.peak.name}` : `${route.name}, ${mountain.peak.name}`,
    path: routePath(mountain.id, route.id, s.slug),
  })
}

function StopCard({ s, i, n, route, num, active, units, mountain }) {
  const hz = s.hazard
  // on a phone the route's facts fold away behind a button, so the card leaves the route in view
  const [facts, setFacts] = useState(false)
  const shareLabel = s.overview
    ? (canShare ? t('Share this route') : t('Copy the link to this route'))
    : (canShare ? t('Share this stop') : t('Copy the link to this stop'))
  return (
    // the altitude is the altimeter's to show; the card names the stop (and tells screen readers the height)
    <article className={`ascent-card ${active ? 'is-active' : ''} ${s.overview ? 'is-overview' : ''}`} aria-hidden={!active} data-alt={s.alt}>
      <h3>{s.title}<span className="visually-hidden">, {altitude(s.alt, units)}</span>{s.overview && <span>{route.aka}</span>}</h3>
      <p>{s.body}</p>
      {s.overview && (
        <>
          <button type="button" className="facts-toggle mono" aria-expanded={facts} aria-controls={`facts-${route.id}`} onClick={() => setFacts(!facts)} tabIndex={active ? 0 : -1}>
            {facts ? t('Fewer details') : t('Route facts')}
          </button>
          <dl className="facts" id={`facts-${route.id}`} data-open={facts ? '1' : '0'}>
            <div><dt>{t('first ascent')}</dt><dd>{route.firstAscent}</dd></div>
            <div><dt>{t('traffic')}</dt><dd>{route.share}</dd></div>
            <div><dt>{t('difficulty')}</dt><dd>{route.difficulty}</dd></div>
            <div><dt>{t('vertical')}</dt><dd>{metresText(route.verticalGain, units)}</dd></div>
          </dl>
        </>
      )}
      {hz && (
        <div className={`haz sev-${hz.severity}`}>
          <Warning />
          <div><b>{hz.kind}</b>{hz.incidents[0] ? <><br />{hz.incidents[0]}</> : null}</div>
        </div>
      )}
      <div className="stop-foot">
        <p className="mono">{pad2(num)} {route.name} · {t('{i} of {n}', { i: i + 1, n })}</p>
        <button type="button" className="stop-share" onClick={() => shareStop(mountain, route, s)} aria-label={shareLabel} title={shareLabel} tabIndex={active ? 0 : -1}><Link /></button>
      </div>
    </article>
  )
}

export default function Ascent({ terrain }) {
  const paths = useStore((s) => s.paths)
  const activeRoute = useStore((s) => s.activeRoute)
  const mountain = useMountain()
  const { routes, hazards, peak: peakData } = mountain
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
  const trigger = useRef(null)
  const minAlt = stops[0]?.alt || 5000, maxAlt = peak.elevation

  useEffect(() => {
    if (!stops.length || !root.current || !path) return
    const el = root.current
    let shown = -1
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
        const at = Math.round(seg)
        // the stop on screen goes in the address (lib/address.js)
        if (at !== shown) { shown = at; useStore.setState({ progress: t, stop: stops[at].slug }) }
        else useStore.setState({ progress: t })
        setActive(at)
        if (altRef.current) {
          const alt = Math.round(modelAlt(path, t) + stops[i].gap + (stops[i + 1].gap - stops[i].gap) * f)
          shownAlt.current = alt
          altRef.current.textContent = fmt(inUnits(alt))
          if (dotRef.current) dotRef.current.style.bottom = `${Math.min(100, Math.max(0, ((alt - minAlt) / (maxAlt - minAlt)) * 100))}%`
        }
      },
    })
    trigger.current = st
    ScrollTrigger.refresh()
    return () => { st.kill(); if (trigger.current === st) trigger.current = null }
  }, [stops, path, minAlt, maxAlt, motion])

  // A place named by the address (/k2/abruzzi/camp-4/, or Back to one): once this climb is laid
  // out, the page goes to that stop, the route's first card for a route alone. Only for the
  // mountain whose terrain this is: another one may be on its way in.
  const pendingStop = useStore((s) => s.pendingStop)
  const mountainId = useStore((s) => s.mountainId)
  useEffect(() => {
    const st = trigger.current
    if (pendingStop === null || !st || !stops.length || terrain.id !== mountainId) return
    const found = pendingStop ? stops.findIndex((s) => s.slug === pendingStop || s.aliases?.includes(pendingStop)) : 0
    const i = Math.max(0, found)
    jumpTo(st.start + ((st.end - st.start) * i) / Math.max(1, stops.length - 1) + 1)
    useStore.setState({ pendingStop: null })
  }, [pendingStop, stops, terrain.id, mountainId])

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
      <section id="ascent" className="ascent is-choose" ref={root} aria-label={t('Choose a route')}>
        <div className="wrap">
          <div className="choose">
            <div className="choose-head">
              <span className="mono">{t('{n} ways up', { n: routes.length })}</span>
              <h2>{t('Choose a route')}</h2>
              <p>{t('Each route is climbed camp by camp as you scroll. Pick one to draw it on the mountain.')}</p>
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
    <section id="ascent" className="ascent" ref={root} data-active="1" aria-label={t('Climb each route camp by camp')}>
      <div className="ascent-sticky">
        <div className="ascent-tabs" role="tablist" aria-label={t('Route')} ref={tabsRef}>
          {routes.map((r, i) => (
            <button key={r.id} role="tab" aria-selected={r.id === activeRoute} className="tab" onClick={() => pick(r.id)}>
              <i className="mono">{pad2(i + 1)}</i><span>{r.name}</span>
            </button>
          ))}
        </div>
        {stops.map((s, i) => <StopCard key={s.key} s={s} i={i} n={stops.length} route={route} num={num} active={i === active} units={units} mountain={mountain} />)}
        <div className="altimeter" aria-live="off">
          <small className="mono">{t('altitude, {unit}', { unit: unitName(units) })}</small>
          <b className="mono"><span ref={altRef}>{fmt(inUnits(minAlt, units))}</span></b>
          <div className="rail">
            <i style={{ bottom: '0%' }} />
            <i className="dz" style={{ bottom: `${((8000 - minAlt) / (maxAlt - minAlt)) * 100}%` }} title={altitude(8000, units)} />
            <i style={{ bottom: '100%' }} />
            <b ref={dotRef} style={{ bottom: '0%' }} />
          </div>
          <small className="mono">{t('the orange tick is {height}', { height: altitude(8000, units) })}</small>
        </div>
      </div>
      <div className="ascent-track" style={{ marginTop: '-100dvh' }}>
        {stops.map((s) => <div key={s.key} className="ascent-stop" />)}
      </div>
    </section>
  )
}

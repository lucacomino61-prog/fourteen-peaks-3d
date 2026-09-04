import { useEffect, useRef } from 'react'
import { useStore, useMountain } from '../store'
import { mountains } from '../data'
import { ArrowDown, Compass, ArrowLeft, ArrowRight, X } from './Icons'

export function Nav({ current }) {
  const { peak } = useMountain()
  const routesOpen = useStore((s) => s.routesOpen)
  return (
    <nav className="nav" aria-label="Sections">
      <a className="nav-brand" href="#top">{peak.name} <span>{peak.elevation.toLocaleString()} m</span></a>
      <div className="nav-links">
        <button className="nav-routes" aria-expanded={routesOpen} aria-controls="routes-menu" onClick={() => useStore.setState({ routesOpen: !routesOpen })}>Menu <i /></button>
      </div>
      <button className="nav-all" onClick={() => useStore.setState({ overviewOpen: true })}>All fourteen</button>
    </nav>
  )
}

export function Hero({ loading }) {
  const { peak, id } = useMountain()
  const step = useStore((s) => s.stepMountain)
  const index = mountains.findIndex((m) => m.id === id)
  const next = mountains[(index + 1) % mountains.length]
  const prev = mountains[(index - 1 + mountains.length) % mountains.length]
  const go = (dir) => { step(dir); window.scrollTo({ top: 0, behavior: 'auto' }) }
  useEffect(() => {
    const onKey = (e) => {
      if (useStore.getState().mode !== 'hero') return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <section id="top" className="hero" aria-label={peak.name}>
      <button className="switch switch-prev" onClick={() => go(-1)} aria-label={`Previous mountain: ${prev.peak.name}`}><ArrowLeft /></button>
      <button className="switch switch-next" onClick={() => go(1)} aria-label={`Next mountain: ${next.peak.name}`}><ArrowRight /></button>
      <div className="hero-min">
        <div className="hero-index mono">
          <button className="hero-index-btn" onClick={() => useStore.setState({ overviewOpen: true })}>{String(index + 1).padStart(2, '0')} / {String(mountains.length).padStart(2, '0')}</button>
          <span>{peak.range}</span>
          {loading && <span className="hero-loading">loading terrain…</span>}
        </div>
        <button className="hero-open" onClick={() => useStore.setState({ routesOpen: true })}>Routes and information <ArrowDown /></button>
      </div>
      <div className="hero-side">
        <div>Drag the mountain to turn it</div>
        <div>Next: <b>{next.peak.name}</b></div>
        <div><b>{peak.range}</b>, {peak.countries}</div>
        <div>Terrain from Copernicus GLO-30</div>
        <div>Imagery: Esri World Imagery</div>
      </div>
    </section>
  )
}

/** Scroll the page so the route section starts at the top. */
export function goToAscent() {
  const el = document.getElementById('ascent')
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'auto' })
}

/** The routes menu under the nav: pick a route and the page jumps to its ascent. */
export function RoutesMenu() {
  const { routes, peak, id } = useMountain()
  const index = mountains.findIndex((m) => m.id === id)
  const open = useStore((s) => s.routesOpen)
  const step = useStore((s) => s.stepMountain)
  const close = () => useStore.setState({ routesOpen: false })
  const jump = (dir) => { step(dir); window.scrollTo({ top: 0, behavior: 'auto' }) }
  const active = useStore((s) => s.activeRoute)
  const choose = useStore((s) => s.chooseRoute)
  const ref = useRef()
  useEffect(() => {
    if (!open) return
    const close = () => useStore.setState({ routesOpen: false })
    const onKey = (e) => { if (e.key === 'Escape') close() }
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target) && !e.target.closest('.nav-routes')) close() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onDown) }
  }, [open])
  const pick = (id) => { choose(id); requestAnimationFrame(goToAscent) }
  return (
    <div id="routes-menu" className={`routes-menu ${open ? 'is-open' : ''}`} ref={ref} role="dialog" aria-label={`${peak.name}: routes and information`} aria-hidden={!open}>
      <div className="routes-menu-head">
        <span className="mono">{String(index + 1).padStart(2, '0')} / {String(mountains.length).padStart(2, '0')} · {peak.range}</span>
        <button className="close" onClick={close} aria-label="Close"><X /></button>
      </div>
      <div className="menu-about">
        <h3>{peak.name} <small className="mono">{peak.elevation.toLocaleString()} m · {peak.countries}</small></h3>
        <p>{peak.tagline}</p>
      </div>
      <h4 className="menu-label mono">{routes.length} routes · pick one to climb it</h4>
      <ul>
        {routes.map((r, i) => (
          <li key={r.id}>
            <button className={`routes-menu-item ${active === r.id ? 'is-active' : ''}`} style={{ '--c': r.color }} onClick={() => pick(r.id)}>
              <span className="mono num">{String(i + 1).padStart(2, '0')}</span>
              <span className="sw" />
              <span className="txt"><b>{r.name}</b><small>{r.aka}</small></span>
            </button>
          </li>
        ))}
      </ul>
      <h4 className="menu-label mono">Information</h4>
      <ul className="menu-links">
        <li><a href="#explorer" onClick={close}><Compass /> Free explorer <small>orbit, zoom, every route and camp</small></a></li>
        <li><a href="#figures" onClick={close}>The numbers <small>ascents, deaths, fatality rate</small></a></li>
        <li><a href="#history" onClick={close}>History <small>{peak.historyTitle}</small></a></li>
        <li><button onClick={() => useStore.setState({ routesOpen: false, overviewOpen: true })}>All fourteen peaks <small>the overview grid</small></button></li>
      </ul>
      <div className="routes-menu-foot">
        <button onClick={() => jump(-1)}><ArrowLeft /> {mountains[(index - 1 + mountains.length) % mountains.length].peak.name}</button>
        <button onClick={() => jump(1)}>{mountains[(index + 1) % mountains.length].peak.name} <ArrowRight /></button>
      </div>
    </div>
  )
}

export function Figures() {
  const { stats, peak } = useMountain()
  return (
    <section id="figures" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>The numbers</h2>
          <p>{peak.figuresLead}</p>
        </div>
        <div className="stats" aria-label="Key figures">
          {stats.map((s) => (
            <div key={s.label}><span>{s.label}</span><b>{s.value}</b><small>{s.note}</small></div>
          ))}
        </div>
        <p className="routes-other">{peak.otherLines}</p>
      </div>
    </section>
  )
}

const KEY_YEARS = new Set([1954, 1986, 2008, 2021, 1953, 1996, 2014, 2019])

export function History() {
  const { timeline, peak } = useMountain()
  return (
    <section id="history" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2>{peak.historyTitle}</h2>
          <p>{peak.historyLead}</p>
        </div>
        <div className="timeline">
          {timeline.map((t) => (
            <div key={t.year} className={`tl-item ${KEY_YEARS.has(t.year) ? 'is-key' : ''}`}>
              <div className="year">{t.year}</div>
              <div className="body"><h3>{t.title}</h3><p>{t.text}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const { sources, peak } = useMountain()
  return (
    <footer className="footer">
      <div className="wrap cols">
        <div>
          <h3>About the model</h3>
          <p>The terrain is a 31 km square around {peak.name} at roughly 15 m per pixel, displaced from a real digital elevation model and draped with satellite imagery. Route lines and camp positions are approximate: they were reconstructed from published expedition accounts and fitted to the elevation data so that camp altitudes match documented values. Use it to understand the mountain, not to navigate it.</p>
        </div>
        <div>
          <h3>Data</h3>
          <ul>{sources.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      </div>
    </footer>
  )
}

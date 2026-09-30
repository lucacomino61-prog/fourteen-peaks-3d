import { useEffect, useRef, useState } from 'react'
import { useStore, useMountain } from '../store'
import { mountains } from '../data'
import { jumpTo } from '../lib/clock'
import { pad2, longDate, fmt } from '../lib/format'
import { alt, metresText, useUnits } from '../lib/units'
import { mountainPath, mountainTitle } from '../lib/meta'
import { share, copyLink } from '../lib/share'
import { downloadStl, PRINT, printScale } from '../lib/stl'
import { withLang } from '../i18n'
import { WeatherLine, WeatherPanel } from './Weather'
import { analyticsConfigured } from '../lib/analytics'
import { Compass, ArrowLeft, ArrowRight, X, Search as SearchIcon, Share as ShareIcon, Sliders } from './Icons'

const UPDATED = import.meta.env.VITE_LAST_UPDATED
const REPO_URL = 'https://github.com/lucacomino61-prog/fourteen-peaks-3d'
const openSettings = () => useStore.setState({ settingsOpen: true, routesOpen: false })

// a system share sheet (phones, tablets): "Share"; everywhere else the link is copied
const canShare = typeof navigator !== 'undefined' && !!navigator.share && typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches

/** Share the mountain on screen: the system sheet on a phone, else its link is copied. */
function shareMountain(m) {
  share({ title: mountainTitle(m), text: `${m.peak.name}, ${alt(m.peak.elevation)}, in real 3D terrain`, path: mountainPath(m.id) })
}

/** Switch to the next (1) or previous (-1) mountain and go back to the top of the page. */
function stepMountain(dir) {
  useStore.getState().stepMountain(dir)
  jumpTo(0)
}

export function Nav() {
  const { peak } = useMountain()
  const routesOpen = useStore((s) => s.routesOpen)
  const motion = useStore((s) => s.motion)
  const setMotion = useStore((s) => s.setMotion)
  const mode = useStore((s) => s.mode)
  const units = useUnits()
  return (
    // over the reading sections the nav is solid, so nothing shows through under it
    <nav className="nav" aria-label="Site" data-solid={mode === 'idle' ? '1' : '0'}>
      <a className="nav-brand" href="#top"><b translate="no">{peak.name}</b> <span className="mono">{alt(peak.elevation, units)}</span></a>
      <button className="nav-menu" aria-expanded={routesOpen} aria-controls="routes-menu" onClick={() => useStore.setState({ routesOpen: !routesOpen })}>Menu <i aria-hidden /></button>
      <div className="nav-end">
        <button className="nav-search" onClick={() => useStore.setState({ searchOpen: true, routesOpen: false })} aria-label="Search the fourteen" aria-keyshortcuts="/ Control+K Meta+K">
          <SearchIcon /><span>Search</span>
        </button>
        <button className="nav-settings" onClick={openSettings} aria-label="Settings" aria-haspopup="dialog" title="Settings"><Sliders /></button>
        {/* the visible Stop-animations switch (html[data-motion]); reduced motion starts it pressed */}
        <button className="nav-motion" aria-pressed={motion === 'off'} onClick={() => setMotion(motion === 'on' ? 'off' : 'on')} title={motion === 'on' ? 'Stop animations' : 'Animations stopped'}>
          <i aria-hidden /><span>Stop animations</span>
        </button>
        <button className="nav-all" onClick={() => useStore.setState({ overviewOpen: true })}>All fourteen</button>
      </div>
    </nav>
  )
}

export function Hero({ loading }) {
  const { peak, id } = useMountain()
  const units = useUnits()
  const index = mountains.findIndex((m) => m.id === id)
  const next = mountains[(index + 1) % mountains.length]
  const prev = mountains[(index - 1 + mountains.length) % mountains.length]
  useEffect(() => {
    const onKey = (e) => {
      if (useStore.getState().mode !== 'hero') return
      // not while a dialog is open or a field has the keys (the settings' choices move with the
      // arrows; a search field moves its caret)
      if (document.querySelector('dialog[open]') || e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return
      if (e.key === 'ArrowRight') stepMountain(1)
      if (e.key === 'ArrowLeft') stepMountain(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <section id="top" className="hero" aria-labelledby="peak-title">
      {/* the poster name behind the mountain is drawn in the stage (ui/Poster.jsx); this is its text */}
      <h1 id="peak-title" className="visually-hidden"><span translate="no">{peak.name}</span>, {alt(peak.elevation, units)}</h1>
      <button className="switch switch-prev" onClick={() => stepMountain(-1)} aria-label={`Previous mountain: ${prev.peak.name}`}><ArrowLeft /></button>
      <button className="switch switch-next" onClick={() => stepMountain(1)} aria-label={`Next mountain: ${next.peak.name}`}><ArrowRight /></button>
      <div className="hero-min">
        <p className="hero-index mono">
          <button className="hero-index-btn" onClick={() => useStore.setState({ overviewOpen: true })} aria-label={`Mountain ${index + 1} of ${mountains.length}: all fourteen`}>{pad2(index + 1)} / {pad2(mountains.length)}</button>
          <span>{peak.range}</span>
          {loading && <span className="hero-loading">loading terrain…</span>}
        </p>
        <button className="hero-open" onClick={() => useStore.setState({ routesOpen: true })} aria-haspopup="dialog" aria-controls="routes-menu">Climb a route <ArrowRight /></button>
      </div>
      <div className="hero-side">
        <p>Drag the mountain to turn it. Point at the ground to read it through the loupe.</p>
        <p className="mono">{peak.countries} · Copernicus GLO-30 · Esri imagery</p>
        <WeatherLine />
      </div>
    </section>
  )
}

/** Scroll the page so the route section starts at the top. */
function goToAscent() {
  const el = document.getElementById('ascent')
  if (el) jumpTo(el.getBoundingClientRect().top + window.scrollY)
}

/** The routes menu under the nav: pick a route and the page jumps to its ascent. */
export function RoutesMenu() {
  const mountain = useMountain()
  const { routes, peak, id } = mountain
  const index = mountains.findIndex((m) => m.id === id)
  const open = useStore((s) => s.routesOpen)
  const close = () => useStore.setState({ routesOpen: false })
  const active = useStore((s) => s.activeRoute)
  const choose = useStore((s) => s.chooseRoute)
  const units = useUnits()
  const ref = useRef()
  useEffect(() => {
    if (!open) return
    const close = () => useStore.setState({ routesOpen: false })
    const onKey = (e) => { if (e.key === 'Escape') close() }
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target) && !e.target.closest('.nav-menu')) close() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onDown) }
  }, [open])
  const pick = (id) => { choose(id); requestAnimationFrame(goToAscent) }
  return (
    <div id="routes-menu" className={`routes-menu ${open ? 'is-open' : ''}`} ref={ref} role="dialog" aria-label={`${peak.name}: routes and information`} aria-hidden={!open} data-lenis-prevent>
      <div className="routes-menu-head">
        <span className="mono">{pad2(index + 1)} / {pad2(mountains.length)} · {peak.range}</span>
        <button className="close" onClick={close} aria-label="Close"><X /></button>
      </div>
      <div className="menu-about">
        <h2><span translate="no">{peak.name}</span> <small className="mono">{alt(peak.elevation, units)} · {peak.countries}</small></h2>
        <p>{peak.tagline}</p>
      </div>
      <h3 className="menu-label mono">{routes.length} routes · pick one to climb it</h3>
      <ol className="menu-routes">
        {routes.map((r, i) => (
          <li key={r.id}>
            <button className={`routes-menu-item ${active === r.id ? 'is-active' : ''}`} onClick={() => pick(r.id)} aria-current={active === r.id ? 'true' : undefined}>
              <span className="mono num">{pad2(i + 1)}</span>
              <span className="txt"><b>{r.name}</b><small>{r.aka}</small></span>
            </button>
          </li>
        ))}
      </ol>
      <h3 className="menu-label mono">Information</h3>
      <ul className="menu-links">
        <li><a href="#explorer" onClick={close}><Compass /> Free explorer <small>orbit, zoom, every route and camp</small></a></li>
        <li><a href="#explorer" onClick={() => { close(); useStore.setState({ sun: { ...useStore.getState().sun, mode: 'now' } }) }}>Light it now <small>the real sun there, or any hour</small></a></li>
        <li><a href="#figures" onClick={close}>The numbers <small>ascents, deaths, fatality rate</small></a></li>
        <li><a href="#history" onClick={close}>History <small>{peak.historyTitle}</small></a></li>
        <li><button onClick={() => useStore.setState({ routesOpen: false, overviewOpen: true, overviewView: 'grid' })}>All fourteen peaks <small>pick one to open it</small></button></li>
        <li><button onClick={() => useStore.setState({ routesOpen: false, overviewOpen: true, overviewView: 'lineup' })}>Compare the fourteen <small>side by side at one scale, and a table</small></button></li>
        <li><button onClick={() => useStore.setState({ routesOpen: false, searchOpen: true })}><SearchIcon /> Search <small>peaks, routes, camps, hazards, years</small></button></li>
        <li><a href={withLang('/guess/')}>Guess the mountain <small>a game with contour maps</small></a></li>
        <li><button onClick={() => { close(); shareMountain(mountain) }}><ShareIcon /> {canShare ? `Share ${peak.name}` : `Copy the link to ${peak.name}`} <small>send its page</small></button></li>
        <li><button onClick={() => useStore.setState({ routesOpen: false, correctionOpen: true })}>Suggest a correction <small>a wrong altitude, date or line</small></button></li>
        <li><button onClick={openSettings} aria-haspopup="dialog"><Sliders /> Settings <small>theme, text size, units, notifications</small></button></li>
      </ul>
      <div className="routes-menu-foot">
        <button onClick={() => stepMountain(-1)}><ArrowLeft /> {mountains[(index - 1 + mountains.length) % mountains.length].peak.name}</button>
        <button onClick={() => stepMountain(1)}>{mountains[(index + 1) % mountains.length].peak.name} <ArrowRight /></button>
      </div>
    </div>
  )
}

/** "8,611 m" → the number big, the unit small (in feet when the settings say so) */
function StatValue({ v, units }) {
  const m = /^(.*\S)\s(m|km|ft)$/.exec(metresText(v, units))
  return m ? <>{m[1]}<span className="unit">{m[2]}</span></> : v
}

export function Figures() {
  const { stats, peak } = useMountain()
  const units = useUnits()
  return (
    <section id="figures" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2 className="display">The numbers</h2>
          <p>{peak.figuresLead}</p>
        </div>
        <dl className="stats">
          {stats.map((s) => (
            <div key={s.label}><dt className="mono">{s.label}</dt><dd><b><StatValue v={s.value} units={units} /></b><small>{s.note}</small></dd></div>
          ))}
        </dl>
        <p className="routes-other">{peak.otherLines}</p>
        <WeatherPanel />
      </div>
    </section>
  )
}

export function History() {
  const { timeline, peak } = useMountain()
  return (
    <section id="history" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2 className="display">{peak.historyTitle}</h2>
          <p>{peak.historyLead}</p>
        </div>
        <ol className="timeline">
          {timeline.map((t) => (
            <li key={t.year} id={`y${t.year}`} className={`tl-item ${t.highlight ? 'is-key' : ''}`}>
              <div className="year mono">{t.year}</div>
              <div className="body"><h3>{t.title}</h3><p>{t.text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Footer({ tile }) {
  const mountain = useMountain()
  const { sources, peak, id } = mountain
  const [making, setMaking] = useState(false) // the 3D-print file is being made (lib/stl.js)
  const makeStl = async () => {
    if (making) return
    setMaking(true)
    await downloadStl(mountain)
    setMaking(false)
  }
  const size = tile ? `a ${Math.round(tile.km)} km square around ${peak.name} at about ${Math.round(tile.metresPerPx)} m per pixel` : `a square of about 32 km around ${peak.name}`
  return (
    <footer className="footer">
      <div className="wrap cols">
        <div>
          <h2>About the model</h2>
          <p>The terrain is {size}, displaced from a real digital elevation model and draped with satellite imagery. The elevation model rounds off sharp summits, so near the top the 3D mountain stands up to about 250 m lower than its surveyed height; the altitudes quoted on the page, and in the loupe, are corrected to the documented ones. Route lines and camp positions are approximate: they were reconstructed from published expedition accounts and fitted to the elevation data so that camp altitudes match documented values. Use it to understand the mountain, not to navigate it.</p>
          <p>Next to the altimeter, the air at that height is estimated: its pressure as a share of sea level’s, from J. B. West’s model atmosphere for high mountains (Journal of Applied Physiology, 1996), and the temperature water boils at, from the Antoine equation for water.</p>
        </div>
        <div>
          <h2>Data</h2>
          <ul>{sources.map((s) => <li key={s}>{s}</li>)}</ul>
          <p id="stl-note">The 3D-print file (STL) is {fmt(PRINT.sizeKm)} km of ground around the summit at true scale, {fmt(PRINT.widthMm)} mm across (1:{fmt(printScale())}), on a {fmt(PRINT.baseMm)} mm base. It is made in your browser from the elevation data alone, no imagery: keep the Copernicus credit above with it.</p>
        </div>
      </div>
      <div className="wrap foot-actions">
        {canShare && <button type="button" className="pill" onClick={() => shareMountain(mountain)}><ShareIcon /> Share {peak.name}</button>}
        {/* the address as it is now: the mountain, or the route being climbed (lib/address.js) */}
        <button type="button" className="pill" onClick={() => copyLink(location.pathname || mountainPath(id))}>Copy link</button>
        <button type="button" className="pill" onClick={() => window.print()}>Print fact sheet</button>
        <button type="button" className="pill" onClick={makeStl} aria-busy={making} aria-describedby="stl-note">
          {making ? 'Making the 3D-print file…' : 'Download for 3D printing'}
        </button>
        <button type="button" className="pill" onClick={() => useStore.setState({ correctionOpen: true })}>Suggest a correction</button>
      </div>
      <div className="wrap foot-bar">
        <nav aria-label="About this site">
          <a href={withLang('/guess/')}>Guess the mountain</a>
          <a href="/privacy/">Privacy</a>
          <a href="/terms/">Terms of use</a>
          {analyticsConfigured && <button type="button" onClick={() => useStore.setState({ consentOpen: 'asked' })}>Privacy choices</button>}
          <button type="button" onClick={openSettings} aria-haspopup="dialog">Settings</button>
          <a href={REPO_URL}>Source</a>
        </nav>
        {UPDATED && <p className="mono">Last updated <time dateTime={UPDATED}>{longDate(UPDATED)}</time></p>}
      </div>
    </footer>
  )
}

import { useStore, useMountain } from '../store'
import { pad2 } from '../lib/format'
import { alt, useUnits } from '../lib/units'
import { SNOW, SIGNAL, hazardColor } from '../lib/palette'
import { Eye, X, ArrowDown } from './Icons'
import LightControl from './LightControl'
import Glossed from './Glossed'

function Detail() {
  const { routes, hazards, peak } = useMountain()
  const selected = useStore((s) => s.selected)
  const active = useStore((s) => s.activeRoute)
  const set = useStore((s) => s.set)
  const units = useUnits()
  let content = null, color = null
  if (selected?.type === 'camp') {
    const i = routes.findIndex((x) => x.id === selected.routeId)
    const r = routes[i]
    const c = r?.camps.find((x, k) => `${r.id}:${k}:${x.name}` === selected.id)
    if (c) {
      color = r.id === active ? SIGNAL : SNOW
      content = (
        <>
          <div className="kicker"><span>{pad2(i + 1)} {r.name}</span><span>{alt(c.alt, units)}</span></div>
          <h3>{c.name}</h3>
          <p><Glossed text={c.blurb} /></p>
          <div className="row">
            <div><span>position (approx.)</span>{c.lat.toFixed(4)} N, {c.lon.toFixed(4)} E</div>
            <div><span>route</span>{r.aka}</div>
          </div>
        </>
      )
    }
  } else if (selected?.type === 'hazard') {
    const h = hazards.find((x) => x.id === selected.id)
    if (h) {
      color = hazardColor(h.severity)
      content = (
        <>
          <div className="kicker"><span>{h.kind}</span><span>≈ {alt(h.alt, units)}</span></div>
          <h3>{h.name}</h3>
          <p><Glossed text={h.blurb} /></p>
          {h.incidents.length > 0 && <ul>{h.incidents.map((i) => <li key={i}>{i}</li>)}</ul>}
        </>
      )
    }
  } else if (selected?.type === 'summit') {
    color = SNOW
    content = (
      <>
        <div className="kicker"><span>{peak.lat.toFixed(4)} N, {peak.lon.toFixed(4)} E</span><span>{alt(peak.elevation, units)}</span></div>
        <h3>{peak.name}</h3>
        <p><Glossed text={peak.summitBlurb} /></p>
      </>
    )
  } else if (selected?.type === 'route') {
    const i = routes.findIndex((x) => x.id === selected.id)
    const r = routes[i]
    if (r) {
      color = r.id === active ? SIGNAL : SNOW
      content = (
        <>
          <div className="kicker"><span>{pad2(i + 1)} · {r.aka}</span><span>{r.share}</span></div>
          <h3>{r.name}</h3>
          <p><Glossed text={r.summary} /></p>
          <div className="row">
            <div><span>first ascent</span>{r.firstAscent}</div>
            <div><span>difficulty</span><Glossed text={r.difficulty} /></div>
          </div>
        </>
      )
    }
  }
  return (
    <aside className={`detail ${content ? 'is-open' : ''}`} style={{ '--c': color }} aria-live="polite" inert={!content}>
      {content}
      <button className="close" onClick={() => set({ selected: null })} aria-label="Close"><X /></button>
    </aside>
  )
}

export default function Explorer() {
  const { routes } = useMountain()
  const visible = useStore((s) => s.visibleRoutes)
  const active = useStore((s) => s.activeRoute)
  const toggleRoute = useStore((s) => s.toggleRoute)
  const set = useStore((s) => s.set)
  const showCamps = useStore((s) => s.showCamps)
  const showHazards = useStore((s) => s.showHazards)
  const showDeathZone = useStore((s) => s.showDeathZone)
  const showContours = useStore((s) => s.showContours)
  const selected = useStore((s) => s.selected)
  const units = useUnits()

  const focus = (id) => set({ activeRoute: id, visibleRoutes: visible.includes(id) ? visible : [...visible, id], selected: { type: 'route', id }, fly: { route: id } })

  return (
    // data-detail: on a phone the detail sheet takes the panel's place instead of covering it
    <section id="explorer" className="explorer" aria-label="Explore all routes" data-detail={selected ? '1' : '0'}>
      <div className="panel" data-lenis-prevent>
        <div className="panel-head">
          <h2>{routes.length} ways up</h2>
          <p>Select a route to fly to it. Click any camp or hazard on the mountain; the loupe reads the ground under the pointer.</p>
        </div>
        <div className="panel-body">
          <ol className="route-list">
            {routes.map((r, i) => {
              const on = visible.includes(r.id)
              return (
                <li key={r.id} className={`route-row ${active === r.id ? 'is-active' : ''} ${on ? '' : 'is-off'}`}>
                  <span className="num mono" aria-hidden>{pad2(i + 1)}</span>
                  <button className="name" onClick={() => focus(r.id)} onMouseEnter={() => set({ hovered: { type: 'route', id: r.id } })} onMouseLeave={() => set({ hovered: null })} aria-current={active === r.id ? 'true' : undefined}>
                    <b>{r.name}</b>
                    <span>{r.aka}</span>
                  </button>
                  <button className="eye" onClick={() => toggleRoute(r.id)} aria-pressed={on} aria-label={on ? `Hide ${r.name}` : `Show ${r.name}`}><Eye off={!on} /></button>
                </li>
              )
            })}
          </ol>
          <div className="layer-list">
            <h3 className="mono">Layers</h3>
            <button className="toggle" aria-pressed={showCamps} onClick={() => set({ showCamps: !showCamps })}>Camps<i /></button>
            <button className="toggle" aria-pressed={showHazards} onClick={() => set({ showHazards: !showHazards })}>Hazard zones<i /></button>
            <button className="toggle" aria-pressed={showContours} onClick={() => set({ showContours: !showContours })}>Contour map<i /></button>
            <button className="toggle" data-tone="signal" aria-pressed={showDeathZone} onClick={() => set({ showDeathZone: !showDeathZone })}>Death Zone, above {alt(8000, units)}<i /></button>
          </div>
          <LightControl />
        </div>
        <div className="panel-foot">
          <span>Drag to orbit, scroll or pinch to zoom</span>
          <button className="btn-ghost btn-small" onClick={() => set({ fly: { route: 'overview' }, selected: null })}>Reset view</button>
        </div>
      </div>
      <Detail />
      <a className="explorer-continue btn-ghost btn-small" href="#history">History <ArrowDown /></a>
    </section>
  )
}

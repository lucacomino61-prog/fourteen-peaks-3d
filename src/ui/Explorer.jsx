import { useStore, useMountain } from '../store'
import { Eye, X, ArrowDown } from './Icons'

const SEV = { 3: '#ffb64d', 4: '#ff7a45', 5: '#ff3b3b' }

function Detail() {
  const { routes, hazards, peak } = useMountain()
  const selected = useStore((s) => s.selected)
  const set = useStore((s) => s.set)
  let content = null, color = null
  if (selected?.type === 'camp') {
    const r = routes.find((x) => x.id === selected.routeId)
    const c = r?.camps.find((x, i) => `${r.id}:${i}:${x.name}` === selected.id)
    if (c) {
      color = r.color
      content = (
        <>
          <div className="kicker"><span>{r.name}</span><span>{c.alt.toLocaleString()} m</span></div>
          <h3>{c.name}</h3>
          <p>{c.blurb}</p>
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
      color = SEV[h.severity]
      content = (
        <>
          <div className="kicker"><span>{h.kind}</span><span>≈ {h.alt.toLocaleString()} m</span></div>
          <h3>{h.name}</h3>
          <p>{h.blurb}</p>
          {h.incidents.length > 0 && <ul>{h.incidents.map((i) => <li key={i}>{i}</li>)}</ul>}
        </>
      )
    }
  } else if (selected?.type === 'summit') {
    color = '#fff'
    content = (
      <>
        <div className="kicker"><span>{peak.lat.toFixed(4)} N, {peak.lon.toFixed(4)} E</span><span>{peak.elevation.toLocaleString()} m</span></div>
        <h3>{peak.name}</h3>
        <p>{peak.summitBlurb}</p>
      </>
    )
  } else if (selected?.type === 'route') {
    const r = routes.find((x) => x.id === selected.id)
    if (r) {
      color = r.color
      content = (
        <>
          <div className="kicker"><span>{r.aka}</span><span>{r.share}</span></div>
          <h3>{r.name}</h3>
          <p>{r.summary}</p>
          <div className="row">
            <div><span>first ascent</span>{r.firstAscent}</div>
            <div><span>difficulty</span>{r.difficulty}</div>
          </div>
        </>
      )
    }
  }
  return (
    <aside className={`detail ${content ? 'is-open' : ''}`} style={{ '--c': color }} aria-live="polite">
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

  const focus = (id) => set({ activeRoute: id, visibleRoutes: visible.includes(id) ? visible : [...visible, id], selected: { type: 'route', id }, fly: { route: id } })

  return (
    <section id="explorer" className="explorer" aria-label="Explore all routes">
      <div className="panel">
        <div className="panel-head">
          <h2>{routes.length} ways up</h2>
          <p>Select a route to fly to it. Click any camp or hazard on the mountain.</p>
        </div>
        <div className="panel-body">
          {routes.map((r) => {
            const on = visible.includes(r.id)
            return (
              <div key={r.id} className={`route-row ${active === r.id ? 'is-active' : ''} ${on ? '' : 'is-off'}`} style={{ '--c': r.color }}>
                <span className="sw" />
                <button className="name" onClick={() => focus(r.id)} onMouseEnter={() => set({ hovered: { type: 'route', id: r.id } })} onMouseLeave={() => set({ hovered: null })}>
                  <b>{r.name}</b>
                  <span>{r.aka}</span>
                </button>
                <button className="eye" onClick={() => toggleRoute(r.id)} aria-pressed={on} aria-label={on ? `Hide ${r.name}` : `Show ${r.name}`}><Eye off={!on} /></button>
              </div>
            )
          })}
          <div className="layer-list">
            <h4>Layers</h4>
            <button className="toggle" aria-pressed={showCamps} onClick={() => set({ showCamps: !showCamps })}>Camps<i /></button>
            <button className="toggle" aria-pressed={showHazards} onClick={() => set({ showHazards: !showHazards })}>Hazard zones<i /></button>
            <button className="toggle" data-tone="danger" aria-pressed={showDeathZone} onClick={() => set({ showDeathZone: !showDeathZone })}>Death Zone, above 8,000 m<i /></button>
          </div>
        </div>
        <div className="panel-foot">
          <span>Drag to orbit, scroll or pinch to zoom</span>
          <button className="btn btn-ghost" style={{ height: 32, padding: '0 12px', fontSize: 13 }} onClick={() => set({ fly: { route: 'overview' }, selected: null })}>Reset view</button>
        </div>
      </div>
      <Detail />
      <a className="explorer-continue btn btn-ghost" href="#history">History <ArrowDown /></a>
    </section>
  )
}

import { useStore, useMountain } from '../store'
import { fmt, pad2 } from '../lib/format'
import { alt, useUnits } from '../lib/units'
import { SNOW, SIGNAL, hazardColor } from '../lib/palette'
import { placeOf } from '../lib/history'
import { historyAt } from '../lib/navigate'
import { t } from '../i18n'
import { Eye, X, ArrowDown } from './Icons'
import LightControl from './LightControl'
import Glossed from './Glossed'

function Detail() {
  const m = useMountain()
  const { routes, hazards, peak } = m
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
            <div><span>{t('position (approx.)')}</span>{c.lat.toFixed(4)} N, {c.lon.toFixed(4)} E</div>
            <div><span>{t('route')}</span>{r.aka}</div>
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
  } else if (selected?.type === 'history') {
    // a year of the history where it happened (scene/Events.jsx): the entry, the other years at the
    // same place, and the way back to the history
    const place = placeOf(m, selected.id)
    const here = m.timeline.filter((e) => e.at === selected.id)
    const e = here.find((x) => x.year === selected.year) || here[0]
    if (place && e) {
      color = SIGNAL
      content = (
        <>
          <div className="kicker"><span>{t('History')} · {place.kind === 'summit' ? t('the summit') : place.name}</span><span>{place.alt ? `${place.approx ? '≈ ' : ''}${alt(place.alt, units)}` : t('the route')}</span></div>
          <h3><span className="detail-year mono">{e.year}</span> {e.title}</h3>
          <p><Glossed text={e.text} /></p>
          {here.length > 1 && (
            <div className="detail-years" role="group" aria-label={t('Years at this place')}>
              {here.map((x) => <button key={x.year} type="button" className="mono" aria-pressed={x === e} onClick={() => set({ selected: { ...selected, year: x.year } })}>{x.year}</button>)}
            </div>
          )}
          <a className="detail-back" href={`#y${e.year}`} onClick={(ev) => { ev.preventDefault(); historyAt(e.year) }}><ArrowDown /> {t('Read it in the history')}</a>
        </>
      )
    }
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
            <div><span>{t('first ascent')}</span>{r.firstAscent}</div>
            <div><span>{t('difficulty')}</span><Glossed text={r.difficulty} /></div>
          </div>
        </>
      )
    }
  }
  return (
    // focusable (not in the tab order), so "Show on the mountain" can move focus to the card it opens
    <aside className={`detail ${content ? 'is-open' : ''}`} style={{ '--c': color }} aria-live="polite" inert={!content} tabIndex={-1}>
      {content}
      <button className="close" onClick={() => set({ selected: null })} aria-label={t('Close')}><X /></button>
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
  const showHistory = useStore((s) => s.showHistory)
  const selected = useStore((s) => s.selected)
  const units = useUnits()

  const focus = (id) => set({ activeRoute: id, visibleRoutes: visible.includes(id) ? visible : [...visible, id], selected: { type: 'route', id }, fly: { route: id } })

  return (
    // data-detail: on a phone the detail sheet takes the panel's place instead of covering it
    <section id="explorer" className="explorer" aria-label={t('Explore all routes')} data-detail={selected ? '1' : '0'}>
      <div className="panel" data-lenis-prevent>
        <div className="panel-head">
          <h2>{t('{n} ways up', { n: fmt(routes.length) })}</h2>
          <p>{t('Select a route to fly to it. Click any camp or hazard on the mountain; the loupe reads the ground under the pointer.')}</p>
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
                  <button className="eye" onClick={() => toggleRoute(r.id)} aria-pressed={on} aria-label={on ? t('Hide {name}', { name: r.name }) : t('Show {name}', { name: r.name })}><Eye off={!on} /></button>
                </li>
              )
            })}
          </ol>
          <div className="layer-list">
            <h3 className="mono">{t('Layers')}</h3>
            <button className="toggle" aria-pressed={showCamps} onClick={() => set({ showCamps: !showCamps })}>{t('Camps')}<i /></button>
            <button className="toggle" aria-pressed={showHazards} onClick={() => set({ showHazards: !showHazards })}>{t('Hazard zones')}<i /></button>
            <button className="toggle" aria-pressed={showHistory} onClick={() => set({ showHistory: !showHistory, selected: showHistory && selected?.type === 'history' ? null : selected })}>{t('History, where it happened')}<i /></button>
            <button className="toggle" aria-pressed={showContours} onClick={() => set({ showContours: !showContours })}>{t('Contour map')}<i /></button>
            <button className="toggle" data-tone="signal" aria-pressed={showDeathZone} onClick={() => set({ showDeathZone: !showDeathZone })}>{t('Death Zone, above {alt}', { alt: alt(8000, units) })}<i /></button>
          </div>
          <LightControl />
        </div>
        <div className="panel-foot">
          <span>{t('Drag to orbit, scroll or pinch to zoom')}</span>
          <button className="btn-ghost btn-small" onClick={() => set({ fly: { route: 'overview' }, selected: null })}>{t('Reset view')}</button>
        </div>
      </div>
      <Detail />
      <a className="explorer-continue btn-ghost btn-small" href="#history">{t('History')} <ArrowDown /></a>
    </section>
  )
}

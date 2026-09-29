import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { byRank } from '../data'
import { jumpTo } from '../lib/clock'
import { fmt, pad2 } from '../lib/format'
import { X } from './Icons'

const stat = (m, label) => m.stats.find((s) => s.label === label)?.value || '–'

/** All fourteen: a grid of shaded-relief cards, or the same peaks as a plain list. */
export default function Overview() {
  const open = useStore((s) => s.overviewOpen)
  const current = useStore((s) => s.mountainId)
  const view = useStore((s) => s.overviewView)
  const setMountain = useStore((s) => s.setMountain)
  const root = useRef()
  const close = () => useStore.setState({ overviewOpen: false })

  // a modal: focus moves in, Tab stays inside, Escape closes, focus goes back where it was
  useEffect(() => {
    if (!open) return
    const back = document.activeElement
    const el = root.current
    el?.focus() // the dialog itself, so no control looks selected on arrival
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key !== 'Tab' || !el) return
      const all = [...el.querySelectorAll('button, a[href]')]
      const first = all[0], last = all[all.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; back?.focus?.() }
  }, [open])

  if (!open) return null
  const pick = (id) => {
    if (id !== current) setMountain(id)
    else close()
    jumpTo(0)
  }

  return (
    <div className="overview" role="dialog" aria-modal="true" aria-labelledby="overview-title" ref={root} tabIndex={-1} data-lenis-prevent>
      <div className="wrap">
        <div className="overview-head">
          <h2 id="overview-title" className="display">The fourteen</h2>
          <p>Ranked by height. Each is a real-terrain model with its routes, camps and hazards.</p>
          <div className="view-switch" role="group" aria-label="Show as">
            <button aria-pressed={view === 'grid'} onClick={() => useStore.setState({ overviewView: 'grid' })}>Grid</button>
            <button aria-pressed={view === 'list'} onClick={() => useStore.setState({ overviewView: 'list' })}>List</button>
          </div>
          <button className="overview-close" onClick={close} aria-label="Close"><X /></button>
        </div>
        {view === 'grid' ? (
          <div className="peak-grid">
            {byRank.map((m) => (
              <button key={m.id} className={`peak-card ${m.id === current ? 'is-current' : ''}`} onClick={() => pick(m.id)} aria-current={m.id === current ? 'true' : undefined}>
                <img src={`/terrain/${m.id}/thumb.webp`} alt="" loading="lazy" width="720" height="450" />
                <span className="rank mono">{pad2(m.rank)}</span>
                <span className="meta">
                  <b translate="no">{m.peak.name}</b>
                  <span className="alt mono">{fmt(m.peak.elevation)}&nbsp;m · {m.peak.countries}</span>
                  <span className="line">{m.routes.length} routes · {stat(m, 'Deaths')} deaths</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <ol className="peak-list">
            <li className="peak-list-head mono" aria-hidden>
              <span>#</span><span>Peak</span><span>Height</span><span>Countries</span><span>First ascent</span><span>Routes</span><span>Deaths</span>
            </li>
            {byRank.map((m) => (
              <li key={m.id}>
                <button className={`peak-row ${m.id === current ? 'is-current' : ''}`} onClick={() => pick(m.id)} aria-current={m.id === current ? 'true' : undefined}>
                  <span className="mono">{pad2(m.rank)}</span>
                  <b translate="no">{m.peak.name}</b>
                  <span className="mono">{fmt(m.peak.elevation)}&nbsp;m</span>
                  <span>{m.peak.countries}</span>
                  <span className="mono">{stat(m, 'First ascent')}</span>
                  <span className="mono">{m.routes.length}</span>
                  <span className="mono">{stat(m, 'Deaths')}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

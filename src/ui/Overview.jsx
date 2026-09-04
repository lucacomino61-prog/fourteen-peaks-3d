import { useEffect } from 'react'
import { useStore } from '../store'
import { byRank } from '../data'
import { X } from './Icons'

export default function Overview() {
  const open = useStore((s) => s.overviewOpen)
  const current = useStore((s) => s.mountainId)
  const setMountain = useStore((s) => s.setMountain)
  const close = () => useStore.setState({ overviewOpen: false })

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  const pick = (id) => {
    if (id !== current) setMountain(id)
    else close()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  return (
    <div className="overview" role="dialog" aria-modal="true" aria-label="All fourteen 8,000 m peaks">
      <button className="overview-close" onClick={close} aria-label="Close"><X /></button>
      <div className="wrap">
        <div className="overview-head">
          <h2>The fourteen</h2>
          <p>Ranked by height. Each is a real-terrain model with its routes, camps and hazards.</p>
        </div>
        <div className="peak-grid">
          {byRank.map((m) => (
            <button key={m.id} className={`peak-card ${m.id === current ? 'is-current' : ''}`} onClick={() => pick(m.id)}>
              <img src={`/terrain/${m.id}/thumb.webp`} alt="" loading="lazy" width="720" height="450" />
              <span className="rank">{String(m.rank).padStart(2, '0')}</span>
              <span className="meta">
                <b>{m.peak.name}</b>
                <span className="alt">{m.peak.elevation.toLocaleString()} m · {m.peak.countries}</span>
                <span className="line">{m.routes.length} routes · {m.stats.find((s) => s.label === 'Deaths')?.value || ''} deaths</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

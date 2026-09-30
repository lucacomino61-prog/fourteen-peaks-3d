import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { byRank } from '../data'
import { jumpTo } from '../lib/clock'
import { fmt, pad2 } from '../lib/format'
import { alt, useUnits } from '../lib/units'
import { mountainPath } from '../lib/meta'
import { figures } from '../lib/compare'
import { t } from '../i18n'
import Lineup from './Lineup'
import { X } from './Icons'

const stat = (m, key) => m.stats.find((s) => (s.key || s.label) === key)?.value || '–'

/**
 * The comparison table's columns: what each shows and what it sorts by. Numbers sort high to low on
 * the first press, names A to Z; a mountain without the figure (a dash) sorts last either way.
 */
const COLUMNS = [
  { key: 'rank', label: '#', sort: (m) => m.rank, first: 1, cell: (m) => pad2(m.rank), mono: true },
  { key: 'name', label: 'Peak', sort: (m) => m.peak.name, text: true, first: 1 },
  { key: 'height', label: 'Height', sort: (m) => m.peak.elevation, first: -1, cell: (m, f, units) => alt(m.peak.elevation, units), mono: true },
  { key: 'range', label: 'Range', sort: (m) => m.peak.range, text: true, first: 1, cell: (m) => m.peak.range },
  { key: 'countries', label: 'Countries', sort: (m) => m.peak.countries, text: true, first: 1, cell: (m) => m.peak.countries },
  { key: 'first', label: 'First ascent', sort: (m, f) => f.first, first: 1, cell: (m, f) => f.first ?? '–', mono: true },
  { key: 'winter', label: 'First in winter', sort: (m, f) => f.winter, first: 1, cell: (m, f) => f.winter ?? '–', mono: true },
  { key: 'summits', label: 'Summits', sort: (m, f) => f.summits, first: -1, cell: (m, f) => (f.summitsText ? <>{f.summitsText}{f.trueSummits && <sup aria-label={t('see the note')}>†</sup>}</> : '–'), mono: true },
  { key: 'deaths', label: 'Deaths', sort: (m, f) => f.deaths, first: -1, cell: (m, f) => f.deathsText ?? '–', mono: true },
]

function CompareTable({ current, onPick }) {
  const units = useUnits()
  const [by, setBy] = useState({ key: 'rank', dir: 1 })
  const rows = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === by.key)
    const list = byRank.map((m) => ({ m, f: figures(m) }))
    return list.sort((a, b) => {
      const va = col.sort(a.m, a.f), vb = col.sort(b.m, b.f)
      if (va == null && vb == null) return a.m.rank - b.m.rank
      if (va == null) return 1
      if (vb == null) return -1
      const d = col.text ? String(va).localeCompare(String(vb)) : va - vb
      return (d || a.m.rank - b.m.rank) * by.dir
    })
  }, [by])
  const press = (c) => setBy((s) => (s.key === c.key ? { key: c.key, dir: -s.dir } : { key: c.key, dir: c.first }))
  const anyTrue = rows.some((r) => r.f.trueSummits)
  return (
    <div className="cmp">
      <p className="swipe-hint mono" aria-hidden="true">{t('Swipe the table sideways for more columns')}</p>
      <div className="cmp-scroll" data-lenis-prevent>
        <table className="cmp-table">
          <caption className="visually-hidden">{t('The fourteen 8,000 m peaks compared. The column buttons sort the table.')}</caption>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} scope="col" aria-sort={by.key === c.key ? (by.dir > 0 ? 'ascending' : 'descending') : 'none'} className={c.mono ? 'num' : undefined}>
                  <button type="button" onClick={() => press(c)}>
                    {t(c.label)}<i className="sort" aria-hidden="true" data-dir={by.key === c.key ? by.dir : 0} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ m, f }) => (
              <tr key={m.id} className={m.id === current ? 'is-current' : undefined}>
                {COLUMNS.map((c) => c.key === 'name'
                  ? <th key={c.key} scope="row"><a href={mountainPath(m.id)} onClick={(e) => { e.preventDefault(); onPick(m.id) }} aria-current={m.id === current ? 'page' : undefined} translate="no">{m.peak.name}</a></th>
                  : <td key={c.key} className={c.mono ? 'num mono' : undefined}>{c.cell(m, f, units)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cmp-notes">
        {t('Figures as each mountain’s page gives them, rounded (≈) where the counts differ between sources; a dash where it gives none.')}
        {anyTrue && <> {t('† To the true summit: hundreds more stopped at the central summit, 8,008 m.')}</>}
      </p>
    </div>
  )
}

const VIEWS = [['grid', 'Grid'], ['list', 'Table'], ['lineup', 'Side by side']]

/** All fourteen: a grid of shaded-relief cards, a table that sorts, or the outlines side by side. */
export default function Overview() {
  const open = useStore((s) => s.overviewOpen)
  const current = useStore((s) => s.mountainId)
  const view = useStore((s) => s.overviewView)
  const setMountain = useStore((s) => s.setMountain)
  const units = useUnits()
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
          <h2 id="overview-title" className="display">{t('The fourteen')}</h2>
          <p>{view === 'lineup' ? t('Highest first, at one scale. Pick one to open it in 3D.') : view === 'list' ? t('Sort by any column. Pick a name to open it in 3D.') : t('Ranked by height. Each is a real-terrain model with its routes, camps and hazards.')}</p>
          <div className="view-switch" role="group" aria-label={t('Show as')}>
            {VIEWS.map(([v, label]) => <button key={v} aria-pressed={view === v} onClick={() => useStore.setState({ overviewView: v })}>{t(label)}</button>)}
          </div>
          <button className="overview-close" onClick={close} aria-label={t('Close')}><X /></button>
        </div>
        {view === 'grid' && (
          <div className="peak-grid">
            {byRank.map((m) => (
              <button key={m.id} className={`peak-card ${m.id === current ? 'is-current' : ''}`} onClick={() => pick(m.id)} aria-current={m.id === current ? 'true' : undefined}>
                <img src={`/terrain/${m.id}/thumb.webp`} alt="" loading="lazy" width="720" height="450" />
                <span className="rank mono">{pad2(m.rank)}</span>
                <span className="meta">
                  <b translate="no">{m.peak.name}</b>
                  <span className="alt mono">{alt(m.peak.elevation, units)} · {m.peak.countries}</span>
                  <span className="line">{t('{n} routes · {deaths} deaths', { n: fmt(m.routes.length), deaths: stat(m, 'Deaths') })}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        {view === 'list' && <CompareTable current={current} onPick={pick} />}
        {view === 'lineup' && <Lineup list={byRank} current={current} onPick={pick} />}
      </div>
    </div>
  )
}

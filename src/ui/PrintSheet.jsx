import { useMountain } from '../store'
import { fmt } from '../lib/format'
import { SITE_NAME, mountainPath } from '../lib/meta'

const UPDATED = import.meta.env.VITE_LAST_UPDATED

/**
 * What a printer gets: the mountain as a fact sheet in black on white (routes with their camps,
 * hazards, the numbers, the history, the sources). Hidden on screen; the print styles hide
 * everything else (index.css, "print").
 */
export default function PrintSheet() {
  const { id, peak, routes, hazards, stats, timeline, sources } = useMountain()
  const url = typeof location !== 'undefined' ? `${location.origin}${mountainPath(id)}` : mountainPath(id)
  return (
    <section className="print-sheet" aria-label={`${peak.name}: printable fact sheet`}>
      <p className="ps-site">{SITE_NAME}</p>
      {/* not an h1: the page keeps its one h1 (the hero's) */}
      <p className="ps-title">{peak.name} <span>{fmt(peak.elevation)} m</span></p>
      <p className="ps-meta">{peak.range} · {peak.countries} · {peak.lat.toFixed(4)}° N, {peak.lon.toFixed(4)}° E{peak.aka ? ` · also ${peak.aka}` : ''}</p>
      <p className="ps-lead">{peak.tagline}</p>

      <h2>Routes</h2>
      {routes.map((r, i) => (
        <article key={r.id} className="ps-route">
          <h3>{String(i + 1).padStart(2, '0')} {r.name} <small>{r.aka}</small></h3>
          <p>{r.summary}</p>
          <dl>
            {r.firstAscent && <><dt>First ascent</dt><dd>{r.firstAscent}</dd></>}
            {r.difficulty && <><dt>Difficulty</dt><dd>{r.difficulty}</dd></>}
            {r.verticalGain && <><dt>Climb</dt><dd>{r.verticalGain}</dd></>}
            {r.share && <><dt>Share</dt><dd>{r.share}</dd></>}
          </dl>
          <ol className="ps-camps">{r.camps.map((c) => <li key={c.name}>{c.name}, {fmt(c.alt)} m</li>)}</ol>
        </article>
      ))}

      <h2>Hazards</h2>
      <ul className="ps-hazards">{hazards.map((h) => <li key={h.id}><b>{h.name}</b> ({h.kind}{h.alt ? `, about ${fmt(h.alt)} m` : ''}). {h.blurb}</li>)}</ul>

      <h2>The numbers</h2>
      <dl className="ps-stats">{stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}{s.note ? ` (${s.note})` : ''}</dd></div>)}</dl>

      <h2>{peak.historyTitle}</h2>
      <ol className="ps-timeline">{timeline.map((t) => <li key={t.year}><b>{t.year}</b> {t.title}. {t.text}</li>)}</ol>

      <p className="ps-foot">
        Printed from {url}{UPDATED ? `, last updated ${UPDATED}` : ''}. Route lines, camps and hazard zones are approximate reconstructions: not for navigation.
        Sources: {sources.join('; ')}.
      </p>
    </section>
  )
}

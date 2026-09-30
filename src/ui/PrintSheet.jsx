import { useMountain } from '../store'
import { alt, metresText, useUnits } from '../lib/units'
import { SITE_NAME, mountainPath } from '../lib/meta'
import { seasonText } from '../data/seasons'
import { longDate } from '../lib/format'
import { t } from '../i18n'

const UPDATED = import.meta.env.VITE_LAST_UPDATED

/**
 * What a printer gets: the mountain as a fact sheet in black on white (routes with their camps,
 * hazards, the numbers, the history, the sources). Hidden on screen; the print styles hide
 * everything else (index.css, "print").
 */
export default function PrintSheet() {
  const { id, peak, routes, hazards, stats, timeline, sources, season } = useMountain()
  const units = useUnits()
  const url = typeof location !== 'undefined' ? `${location.origin}${mountainPath(id)}` : mountainPath(id)
  return (
    <section className="print-sheet" aria-label={t('{name}: printable fact sheet', { name: peak.name })}>
      <p className="ps-site">{SITE_NAME}</p>
      {/* not an h1: the page keeps its one h1 (the hero's) */}
      <p className="ps-title">{peak.name} <span>{alt(peak.elevation, units)}</span></p>
      <p className="ps-meta">{peak.range} · {peak.countries} · {peak.lat.toFixed(4)}° N, {peak.lon.toFixed(4)}° E{peak.aka ? ` · ${t('also {names}', { names: peak.aka })}` : ''}</p>
      <p className="ps-lead">{peak.tagline}</p>

      <h2>{t('Routes')}</h2>
      {routes.map((r, i) => (
        <article key={r.id} className="ps-route">
          <h3>{String(i + 1).padStart(2, '0')} {r.name} <small>{r.aka}</small></h3>
          <p>{r.summary}</p>
          <dl>
            {r.firstAscent && <><dt>{t('First ascent')}</dt><dd>{r.firstAscent}</dd></>}
            {r.difficulty && <><dt>{t('Difficulty')}</dt><dd>{r.difficulty}</dd></>}
            {r.verticalGain && <><dt>{t('Climb')}</dt><dd>{metresText(r.verticalGain, units)}</dd></>}
            {r.share && <><dt>{t('Share')}</dt><dd>{r.share}</dd></>}
          </dl>
          <ol className="ps-camps">{r.camps.map((c) => <li key={c.name}>{c.name}, {alt(c.alt, units)}</li>)}</ol>
        </article>
      ))}

      <h2>{t('Hazards')}</h2>
      <ul className="ps-hazards">{hazards.map((h) => <li key={h.id}><b>{h.name}</b> ({h.kind}{h.alt ? `, ${t('about {alt}', { alt: alt(h.alt, units) })}` : ''}). {h.blurb}</li>)}</ul>

      <h2>{t('The numbers')}</h2>
      <dl className="ps-stats">{stats.map((s) => <div key={s.key || s.label}><dt>{s.label}</dt><dd>{metresText(s.value, units)}{s.note ? ` (${s.note})` : ''}</dd></div>)}</dl>
      {season && <p className="ps-season"><b>{t('Climbing season, {months}.', { months: seasonText(season.months, 'long') })}</b> {season.note}</p>}

      <h2>{peak.historyTitle}</h2>
      <ol className="ps-timeline">{timeline.map((e) => <li key={e.year}><b>{e.year}</b> {e.title}. {e.text}</li>)}</ol>

      <p className="ps-foot">
        {UPDATED ? t('Printed from {url}, last updated {date}.', { url, date: longDate(UPDATED) }) : t('Printed from {url}.', { url })} {t('Route lines, camps and hazard zones are approximate reconstructions: not for navigation.')}
        {t('Sources')}: {sources.map((s) => t(s)).join('; ')}.
      </p>
    </section>
  )
}

// The mountains' texts in another language: an overlay per mountain (src/data/it/<id>.js) that
// holds only the words, laid over the data here. Ids, positions, heights, dates of summit pushes and
// the keys the site finds things by (a camp's slug, a figure's English label: src/data/index.js)
// stay as they are, so addresses, the comparison table and the maps don't change with the language.
//
// An overlay's shape:
//   peak:     { aka, range, countries, tagline, summitText, summitBlurb, figuresLead, otherLines, historyTitle, historyLead }
//   routes:   { <route id>: { name, aka, firstAscent, share, difficulty, verticalGain, summary,
//                             camps: [[name, blurb], …] (in the data's order), finish: { title, body } } }
//   hazards:  { <hazard id>: { name, kind, blurb, incidents: […] } }
//   stats:    [[label, value, note], …] (in the data's order)
//   timeline: { <year>: [title, text] }
// Anything an overlay leaves out stays in English.

const PEAK = ['aka', 'range', 'countries', 'tagline', 'summitText', 'summitBlurb', 'figuresLead', 'otherLines', 'historyTitle', 'historyLead']
const ROUTE = ['name', 'aka', 'firstAscent', 'share', 'difficulty', 'verticalGain', 'summary']
const HAZARD = ['name', 'kind', 'blurb']

const copy = (to, from, fields) => { if (from) for (const f of fields) if (from[f] != null) to[f] = from[f] }

/** Lays an overlay over a mountain, in place (the page's own language, before anything reads it) */
export function applyOverlay(m, o) {
  if (!o) return m
  copy(m.peak, o.peak, PEAK)
  for (const r of m.routes) {
    const ro = o.routes?.[r.id]
    if (!ro) continue
    copy(r, ro, ROUTE)
    r.camps.forEach((c, i) => { const w = ro.camps?.[i]; if (w) { c.name = w[0]; if (w[1] != null) c.blurb = w[1] } })
    if (r.finish && ro.finish) r.finish = { ...r.finish, ...ro.finish }
  }
  for (const h of m.hazards) {
    const ho = o.hazards?.[h.id]
    if (!ho) continue
    copy(h, ho, HAZARD)
    if (ho.incidents) h.incidents = ho.incidents
  }
  m.stats.forEach((s, i) => { const w = o.stats?.[i]; if (w) { s.label = w[0]; s.value = w[1]; if (w[2] != null) s.note = w[2] } })
  for (const e of m.timeline) { const w = o.timeline?.[e.year]; if (w) { e.title = w[0]; e.text = w[1] } }
  return m
}

/** A copy of a mountain in another language, the English left as it was (the build writes both) */
export function localized(m, o, seasonNote) {
  const c = {
    ...m,
    peak: { ...m.peak },
    routes: m.routes.map((r) => ({ ...r, camps: r.camps.map((x) => ({ ...x })), finish: r.finish && { ...r.finish } })),
    hazards: m.hazards.map((h) => ({ ...h, incidents: [...(h.incidents || [])] })),
    stats: m.stats.map((s) => ({ ...s })),
    timeline: m.timeline.map((e) => ({ ...e })),
    season: m.season && { ...m.season, note: seasonNote ?? m.season.note },
  }
  return applyOverlay(c, o)
}

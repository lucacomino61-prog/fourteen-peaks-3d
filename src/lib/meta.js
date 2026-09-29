// Page titles, descriptions and addresses, shared by the app (lib/head.js) and the build, which
// writes one HTML page per mountain from them (vite.config.js). Everything is derived from the
// mountain's data, so the words match the page.
import { fmt } from './format.js'

export const SITE_NAME = 'The fourteen 8,000 m peaks in 3D'
export const SITE_DESCRIPTION =
  'The fourteen 8,000 m peaks as interactive 3D models built from real elevation data and satellite imagery. Pick a mountain, climb its routes camp by camp, and see the hazards and history of each.'

/** Every mountain has its own address: /k2/, /everest/, … */
export const mountainPath = (id) => `/${id}/`

/** At most about 55 characters, so search results show it whole. */
export function mountainTitle(m) {
  return `${m.peak.name}, ${fmt(m.peak.elevation)} m: routes, camps and history in 3D`
}

export function mountainDescription(m) {
  const years = m.timeline.map((t) => Number(t.year)).filter(Number.isFinite)
  const n = m.routes.length
  const history = years.length ? ` and its history, ${Math.min(...years)}–${Math.max(...years)}` : ' and its history'
  return `${m.peak.name} (${fmt(m.peak.elevation)} m, ${m.peak.range}) in real 3D terrain: ${n} route${n === 1 ? '' : 's'} climbed camp by camp, their hazards, the numbers${history}.`
}

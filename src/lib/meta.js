// Page titles, descriptions and addresses, shared by the app (lib/head.js, lib/address.js) and the
// build, which writes one HTML page per mountain, route and stop from them (vite.config.js).
// Everything is derived from the mountain's data, so the words match the page. Each takes the
// language (the page's own by default); the build asks for both.
import { fmt } from './format.js'
import { withLang, LANG, LOCALES } from '../i18n/lang.js'
import { tl } from '../i18n/index.js'

export const siteName = (lang = LANG) => tl(lang, 'The fourteen 8,000 m peaks in 3D')
export const siteDescription = (lang = LANG) => tl(lang, 'The fourteen 8,000 m peaks as interactive 3D models built from real elevation data and satellite imagery. Pick a mountain, climb its routes camp by camp, and see the hazards and history of each.')
export const SITE_NAME = siteName()
export const SITE_DESCRIPTION = siteDescription()

/** Every mountain has its own address: /k2/, /everest/, … (/it/k2/ in Italian) */
export const mountainPath = (id, lang = LANG) => withLang(`/${id}/`, lang)

/** A route (/k2/abruzzi/) or a stop on it (/k2/abruzzi/camp-4/) */
export const routePath = (id, routeId, stop, lang = LANG) => withLang(`/${id}/${routeId}/${stop ? `${stop}/` : ''}`, lang)

/** "Camp 4" → "camp-4", "Česen Route" → "cesen-route" */
export const slugify = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/** How a route's climb ends: at the summit, at another top (route.finish), or joining another route. */
export function routeEnd(route, peak) {
  const [lat, lon] = route.waypoints[route.waypoints.length - 1]
  if (Math.abs(lat - peak.lat) < 1e-4 && Math.abs(lon - peak.lon) < 1e-4) return 'summit'
  return route.finish ? 'finish' : 'join'
}

/** The slug of a camp: from its English name (route.camps[i].slug), the same in every language. */
export const campSlug = (camp) => camp.slug || slugify(camp.name)

/**
 * Every stop of a route an address can name, from the data alone (the app orders them along the
 * line once the terrain is loaded): its camps, its hazards and its end. Slug → { kind, name, alt, text }.
 */
export function routeStops(m, route) {
  const out = new Map()
  for (const c of route.camps) out.set(campSlug(c), { kind: 'camp', name: c.name, alt: c.alt, text: c.blurb })
  for (const id of route.hazards) {
    const h = m.hazards.find((x) => x.id === id)
    if (h && !h.band && !out.has(id)) out.set(id, { kind: 'hazard', name: h.name, alt: h.alt, text: h.blurb })
  }
  const end = routeEnd(route, m.peak)
  if (end === 'summit') out.set('summit', { kind: 'summit', name: m.peak.name, alt: m.peak.elevation, text: m.peak.summitText })
  else if (end === 'finish') out.set('finish', { kind: 'finish', name: route.finish.title, alt: route.finish.alt, text: route.finish.body })
  else out.set('join', { kind: 'join', name: route.name, alt: route.camps[route.camps.length - 1]?.alt, text: route.summary })
  return out
}

/** At most about 55 characters, so search results show it whole. */
export function mountainTitle(m, lang = LANG) {
  return tl(lang, '{name}, {height} m: routes, camps and history in 3D', { name: m.peak.name, height: fmt(m.peak.elevation, LOCALES[lang]) })
}

export function mountainDescription(m, lang = LANG) {
  const years = m.timeline.map((x) => Number(x.year)).filter(Number.isFinite)
  const n = m.routes.length
  const vars = { name: m.peak.name, height: fmt(m.peak.elevation, LOCALES[lang]), range: m.peak.range, n, from: Math.min(...years), to: Math.max(...years) }
  if (!years.length) return tl(lang, '{name} ({height} m, {range}) in real 3D terrain: {n} routes climbed camp by camp, their hazards, the numbers and its history.', vars)
  return n === 1
    ? tl(lang, '{name} ({height} m, {range}) in real 3D terrain: {n} route climbed camp by camp, its hazards, the numbers and its history, {from}–{to}.', vars)
    : tl(lang, '{name} ({height} m, {range}) in real 3D terrain: {n} routes climbed camp by camp, their hazards, the numbers and its history, {from}–{to}.', vars)
}

export function routeTitle(m, route, lang = LANG) {
  return tl(lang, '{route} on {name}: the climb camp by camp in 3D', { route: route.name, name: m.peak.name })
}

export function routeDescription(m, route) {
  return clip(`${route.name}, ${m.peak.name}. ${route.summary}`)
}

export function stopTitle(m, route, stop, lang = LANG) {
  const height = stop.alt ? `, ${fmt(stop.alt, LOCALES[lang])} m` : ''
  if (stop.kind === 'summit') return tl(lang, 'The summit of {name}{height}, by the {route}', { name: m.peak.name, height, route: route.name })
  return tl(lang, '{stop}{height}: {route}, {name}', { stop: stop.name, height, route: route.name, name: m.peak.name })
}

export function stopDescription(m, route, stop) {
  return clip(`${stop.name} · ${route.name}, ${m.peak.name}. ${stop.text || ''}`)
}

/** Descriptions stay under about 160 characters, cut at a word. */
function clip(s, max = 158) {
  const flat = String(s).replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  return `${flat.slice(0, flat.lastIndexOf(' ', max - 1))}…`
}

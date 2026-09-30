// Where the history happened. A timeline entry whose own text names a place the model has carries
// it as `at` (src/data): 'summit', 'hazard:<id>', 'camp:<route>:<camp slug>' or 'route:<id>'. The
// explorer's History layer (scene/Events.jsx) puts one flag on each of those places with the years
// that happened there, and "Show on the mountain" in the history (ui/Sections.jsx) flies to one.
import { pointAt } from './paths'

/**
 * The place an `at` names on mountain m: { key, kind, name, alt, lat, lon, routeId }. A route has
 * no single point or height: its flag stands on its line (placePoint).
 */
export function placeOf(m, key) {
  const [kind, a, b] = key.split(':')
  if (kind === 'summit') return { key, kind, name: m.peak.name, alt: m.peak.elevation, lat: m.peak.lat, lon: m.peak.lon }
  if (kind === 'hazard') {
    const h = m.hazards.find((x) => x.id === a)
    return h ? { key, kind, name: h.name, alt: h.alt, approx: true, lat: h.lat, lon: h.lon } : null
  }
  const r = m.routes.find((x) => x.id === a)
  if (!r) return null
  if (kind === 'route') return { key, kind, name: r.name, routeId: r.id }
  const c = kind === 'camp' ? r.camps.find((x) => x.slug === b) : null
  return c ? { key, kind, name: `${r.name}, ${c.name}`, alt: c.alt, lat: c.lat, lon: c.lon, routeId: r.id } : null
}

/** The places with history on m, each with its entries (oldest first), ordered by their first year */
export function historyPlaces(m) {
  const by = new Map()
  for (const e of m.timeline) {
    if (!e.at) continue
    if (!by.has(e.at)) {
      const p = placeOf(m, e.at)
      if (!p) continue
      by.set(e.at, { ...p, events: [] })
    }
    by.get(e.at).events.push(e)
  }
  return [...by.values()]
}

/** Where a place stands in the scene: the summit's top, a camp's or hazard's ground, 70% up a route's line */
export function placePoint(terrain, paths, place) {
  if (!place) return null
  if (place.kind === 'summit') { const p = terrain.snapToPeak(place.lat, place.lon); p.y += 0.03; return p } // on the summit's dot
  if (place.kind === 'route') return paths?.[place.routeId] ? pointAt(paths[place.routeId], 0.7) : null
  return terrain.surface(place.lat, place.lon, 12)
}

/** A flag's words: its years, "1953 · 1978 · 1980", or the first two and how many more */
export function yearsText(events) {
  const years = events.map((e) => e.year)
  return years.length <= 3 ? years.join(' · ') : `${years.slice(0, 2).join(' · ')} +${years.length - 2}`
}

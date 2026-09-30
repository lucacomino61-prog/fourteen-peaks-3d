// The address bar follows the page: the mountain on screen, the route being climbed and the stop of
// the climb, so any moment of a climb can be bookmarked or sent (/k2/abruzzi/camp-4/). Switching
// mountains is a new entry in the history (Back returns to the one before); climbing from stop to
// stop, or scrolling between sections, only rewrites the address, so the history doesn't fill with
// every camp. The head (title, description, canonical) follows along (lib/head.js).
import { byId } from '../data'
import { stripLang, withLang } from '../i18n/lang.js'
import { routeStops, mountainPath, routePath } from './meta.js'

/**
 * What a path names: { valid, home, mountain, route, stop } (ids and a stop slug). A path that
 * names something that doesn't exist is not valid (the app sends it to the 404 page).
 */
export function parsePath(pathname) {
  const segs = stripLang(pathname).replace(/index\.html$/, '').split('/').filter(Boolean)
  if (!segs.length) return { valid: true, home: true, mountain: null, route: null, stop: null }
  const m = byId[segs[0]]
  if (!m || segs.length > 3) return { valid: false }
  const route = segs[1] ? m.routes.find((r) => r.id === segs[1]) : null
  if (segs[1] && !route) return { valid: false }
  const stop = segs[2] || null
  if (stop && !routeStops(m, route).has(stop)) return { valid: false }
  return { valid: true, home: false, mountain: m.id, route: route?.id || null, stop }
}

/**
 * The address for what's on screen. The hero is the mountain's own page (or the home page, for a
 * visit that started there); the climb is its route and stop; further down the page it is the
 * route that was being climbed, if any.
 */
export function addressFor(s) {
  if (s.mode === 'hero' || !s.activeRoute) return s.home ? withLang('/') : mountainPath(s.mountainId)
  return routePath(s.mountainId, s.activeRoute, s.mode === 'ascent' ? s.stop : null)
}

/** What the address says now (a stop is only named while its climb is on screen). */
export function describeAddress(s) {
  const m = byId[s.mountainId]
  const route = s.activeRoute && s.mode !== 'hero' ? m.routes.find((r) => r.id === s.activeRoute) : null
  const stop = route && s.mode === 'ascent' && s.stop ? routeStops(m, route).get(s.stop) : null
  return { m, route, stop, home: s.home && s.mode === 'hero' }
}

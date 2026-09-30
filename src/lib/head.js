// Keep the document head in step with what's on screen as the visitor switches mountains, climbs a
// route, or moves from stop to stop (the built pages already start with the right one:
// vite.config.js). `path` is the address the page now has (lib/address.js).
import { SITE_NAME, SITE_DESCRIPTION, mountainTitle, mountainDescription, routeTitle, routeDescription, stopTitle, stopDescription } from './meta.js'

export function applyHead({ m, route, stop, home }, path) {
  const title = home ? SITE_NAME : stop ? stopTitle(m, route, stop) : route ? routeTitle(m, route) : mountainTitle(m)
  const description = home ? SITE_DESCRIPTION : stop ? stopDescription(m, route, stop) : route ? routeDescription(m, route) : mountainDescription(m)
  document.title = title
  const set = (selector, value) => document.head.querySelector(selector)?.setAttribute('content', value)
  set('meta[name="description"]', description)
  set('meta[property="og:title"]', title)
  set('meta[name="twitter:title"]', title)
  set('meta[property="og:description"]', description)
  set('meta[name="twitter:description"]', description)
  const canonical = document.head.querySelector('link[rel="canonical"]')
  if (canonical) {
    const url = new URL(canonical.href)
    url.pathname = path
    canonical.href = url.href
    set('meta[property="og:url"]', url.href)
  }
}

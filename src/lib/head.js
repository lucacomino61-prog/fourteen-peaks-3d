// Keep the document head in step with the mountain on screen as the visitor switches (the built
// pages already start with the right one: vite.config.js).
import { SITE_NAME, SITE_DESCRIPTION, mountainPath, mountainTitle, mountainDescription } from './meta.js'

export function applyHead(m, home) {
  const title = home ? SITE_NAME : mountainTitle(m)
  const description = home ? SITE_DESCRIPTION : mountainDescription(m)
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
    url.pathname = home ? '/' : mountainPath(m.id)
    canonical.href = url.href
    set('meta[property="og:url"]', url.href)
  }
}

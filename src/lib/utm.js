// Campaign tags (utm_…) of the link a visit arrived by. They are kept for the visit in
// sessionStorage (fp-utm), sent with counted events and with corrections, and taken out of the
// address bar, so that a link copied from it is clean. While visit counting may still record the
// arrival (lib/analytics.js), they stay in the address until it has.
const KEY = 'fp-utm'
const FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

export function captureCampaign() {
  try {
    const q = new URLSearchParams(location.search)
    const tags = {}
    for (const f of FIELDS) if (q.get(f)) tags[f] = q.get(f).slice(0, 100)
    if (Object.keys(tags).length) sessionStorage.setItem(KEY, JSON.stringify(tags))
  } catch { /* no storage: the tags just aren't remembered */ }
}

export function campaign() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || {} } catch { return {} }
}

/** Take the tags out of the address bar (history.replaceState, nothing reloads). */
export function cleanCampaignFromUrl() {
  try {
    const q = new URLSearchParams(location.search)
    let changed = false
    for (const f of FIELDS) if (q.has(f)) { q.delete(f); changed = true }
    if (changed) history.replaceState(history.state, '', location.pathname + (q.toString() ? `?${q}` : '') + location.hash)
  } catch { /* leave the address as it is */ }
}

/** The address to share, tagged so that visits from shares can be told apart. */
export function taggedUrl(path, source) {
  const u = new URL(path, location.origin)
  u.searchParams.set('utm_source', source)
  u.searchParams.set('utm_medium', 'share')
  return u.href
}

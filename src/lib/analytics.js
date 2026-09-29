// Visit counting. Off unless the build is set up for it (VITE_ANALYTICS = plausible or umami,
// with VITE_ANALYTICS_SRC, the script's address, and VITE_ANALYTICS_SITE, the domain or website
// id) AND the visitor said yes on the consent card; Global Privacy Control or Do Not Track mean no
// without asking. Both services set no cookies. Their script counts page views itself, the
// mountain pages included (history changes); track() adds this site's own events.
import { readConsent, refusedByBrowser, writeConsent } from './consent.js'
import { campaign, cleanCampaignFromUrl } from './utm.js'

const PROVIDER = import.meta.env.VITE_ANALYTICS
const SRC = import.meta.env.VITE_ANALYTICS_SRC
const SITE = import.meta.env.VITE_ANALYTICS_SITE
export const analyticsConfigured = !!(PROVIDER && SRC && SITE)
export const analyticsName = { plausible: 'Plausible', umami: 'Umami' }[PROVIDER] || PROVIDER || ''

let started = false
const allowed = () => analyticsConfigured && !refusedByBrowser() && readConsent() === 'yes'

/** The consent card shows only when counting is set up and the visitor hasn't answered. */
export const mustAsk = () => analyticsConfigured && !refusedByBrowser() && !readConsent()

/** Called once at start-up: load the script if the visitor already agreed, else tidy the address. */
export function initAnalytics() {
  if (allowed()) start()
  else if (!mustAsk()) cleanCampaignFromUrl()
}

export function answer(yes) {
  writeConsent(yes ? 'yes' : 'no')
  if (yes) start()
  else cleanCampaignFromUrl()
}

function start() {
  if (started) return
  started = true
  if (PROVIDER === 'plausible') window.plausible = window.plausible || function (...a) { (window.plausible.q = window.plausible.q || []).push(a) }
  const s = document.createElement('script')
  s.defer = true
  s.src = SRC
  if (PROVIDER === 'plausible') s.dataset.domain = SITE
  if (PROVIDER === 'umami') s.dataset.websiteId = SITE
  // it counts this page view from the address, campaign tags included; then they can go
  s.addEventListener('load', () => setTimeout(cleanCampaignFromUrl, 0))
  s.addEventListener('error', cleanCampaignFromUrl)
  document.head.append(s)
}

/** One of the site's own events (route chosen, search, share, the correction form's steps). */
export function track(name, props = {}) {
  if (!allowed()) return
  const all = { ...campaign(), ...props }
  try {
    if (PROVIDER === 'plausible') window.plausible?.(name, { props: all })
    else if (PROVIDER === 'umami') window.umami?.track(name, all)
  } catch { /* counting must never break the page */ }
}

// The visitor's answer to visit counting, kept in the browser (read by lib/analytics.js, the
// consent card and the privacy page). Global Privacy Control or Do Not Track mean no, unasked.
export const CONSENT_KEY = 'fp-stats'

export function refusedByBrowser() {
  if (typeof navigator === 'undefined') return false
  return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1'
}

export function readConsent() {
  try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}

export function writeConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value) } catch { /* private window: asked again next time */ }
}

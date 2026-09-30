// Numbers and dates as the page's language writes them: 8,611 m and 30 September 2026 in English,
// 8611 m (28.251 ft) and 30 settembre 2026 in Italian, whatever the browser's own locale.
import { LOCALE } from '../i18n/lang.js'

export const fmt = (n, locale = LOCALE) => Number(n).toLocaleString(locale)

/** 1 → "01" */
export const pad2 = (n) => String(n).padStart(2, '0')

/** "2026-09-30" → "30 September 2026" */
export const longDate = (iso, locale = LOCALE) => (iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '')

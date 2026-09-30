// Numbers are written the way the copy writes them (8,611 m), whatever the browser's locale.
export const fmt = (n) => Number(n).toLocaleString('en-GB')

/** 1 → "01" */
export const pad2 = (n) => String(n).padStart(2, '0')

/** "2026-09-30" → "30 September 2026" */
export const longDate = (iso) => (iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '')

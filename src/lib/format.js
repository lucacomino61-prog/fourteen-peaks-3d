// Numbers are written the way the copy writes them (8,611 m), whatever the browser's locale.
export const fmt = (n) => Number(n).toLocaleString('en-GB')

/** 1 → "01" */
export const pad2 = (n) => String(n).padStart(2, '0')

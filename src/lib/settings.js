// The visitor's settings, kept on this device (localStorage 'fp-settings', only what differs from
// the defaults): theme, text size, units, notifications, the battery saver, the wind's sound and
// whether the summit forecast loads by itself. Theme and text size
// are applied before the first paint too, by PREPAINT in every page's head (vite.config.js), so a
// day-theme visitor never sees a night flash. The Stop-animations switch keeps its own key
// (fp-motion, store.js).
const KEY = 'fp-settings'

export const DEFAULTS = { theme: 'night', text: 'default', units: 'm', confirmations: true, whatsNew: true, saver: false, sound: false, weather: false }
export const TEXT_SCALE = { small: 0.9, default: 1, large: 1.15, larger: 1.3 }
const ALLOWED = { theme: ['night', 'day', 'system'], text: Object.keys(TEXT_SCALE), units: ['m', 'ft'], confirmations: [true, false], whatsNew: [true, false], saver: [true, false], sound: [true, false], weather: [true, false] }

/** Settings as stored, each one checked (an old or edited value falls back to the default). */
export function loadSettings() {
  let stored = {}
  try { stored = JSON.parse(localStorage.getItem(KEY) || '{}') || {} } catch { /* private mode, bad JSON */ }
  const out = { ...DEFAULTS }
  for (const k of Object.keys(DEFAULTS)) if (ALLOWED[k].includes(stored[k])) out[k] = stored[k]
  return out
}

export function saveSettings(s) {
  try {
    const changed = Object.fromEntries(Object.entries(s).filter(([k, v]) => k in DEFAULTS && DEFAULTS[k] !== v))
    if (Object.keys(changed).length) localStorage.setItem(KEY, JSON.stringify(changed))
    else localStorage.removeItem(KEY)
  } catch { /* the settings still apply for this visit */ }
}

const dayQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: light)') : null
/** 'night' | 'day': what the page shows for a theme setting ('system' follows the device). */
export const resolveTheme = (theme) => (theme === 'day' || (theme === 'system' && !!dayQuery?.matches) ? 'day' : 'night')
/** Calls fn when the device switches between light and dark. */
export function onSystemTheme(fn) {
  dayQuery?.addEventListener?.('change', fn)
  return () => dayQuery?.removeEventListener?.('change', fn)
}

/** Puts theme and text size on the page; returns the theme shown. */
export function applySettings(s) {
  const theme = resolveTheme(s.theme)
  const d = document.documentElement
  d.dataset.theme = theme
  d.style.setProperty('--text-scale', String(TEXT_SCALE[s.text] || 1))
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'day' ? '#ecebe6' : '#0b0d12')
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme === 'day' ? 'light' : 'dark')
  return theme
}

/** The same, as a script for the head of every page, run before anything is drawn. */
export const PREPAINT = `(function(){try{var s=JSON.parse(localStorage.getItem('${KEY}')||'{}')||{},d=document.documentElement,day=s.theme==='day'||(s.theme==='system'&&matchMedia('(prefers-color-scheme: light)').matches),k=${JSON.stringify(TEXT_SCALE)}[s.text];d.dataset.theme=day?'day':'night';if(k)d.style.setProperty('--text-scale',k);if(day){var m=document.querySelector('meta[name="theme-color"]'),c=document.querySelector('meta[name="color-scheme"]');if(m)m.content='#ecebe6';if(c)c.content='light'}}catch(e){}})()`

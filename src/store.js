import { create } from 'zustand'
import { createContext, useContext } from 'react'
import { byId, mountains } from './data'
import { mountainPath } from './lib/meta.js'
import { parsePath } from './lib/address.js'
import { DEFAULTS, loadSettings, saveSettings, applySettings, onSystemTheme } from './lib/settings'

const loadDefaults = () => ({ ...DEFAULTS })

/**
 * What the address names (lib/address.js): a mountain's page (/k2/), a route on it (/k2/abruzzi/),
 * a stop of that climb (/k2/abruzzi/camp-4/), or an older ?peak=k2 link. The home page shows the
 * first mountain.
 */
export function placeFromUrl() {
  try {
    const p = parsePath(location.pathname)
    if (p.valid && p.mountain) return p
    const id = new URLSearchParams(location.search).get('peak')
    if (id && byId[id]) return { valid: true, home: false, mountain: id, route: null, stop: null }
    return { valid: true, home: true, mountain: mountains[0].id, route: null, stop: null }
  } catch { /* no location: the first mountain */ }
  return { valid: true, home: true, mountain: mountains[0].id, route: null, stop: null }
}

const PLACE = placeFromUrl()
const INITIAL = byId[PLACE.mountain]

// an older ?peak= link moves to the mountain's own address
try {
  const q = new URLSearchParams(location.search)
  if (q.has('peak') && byId[q.get('peak')]) {
    q.delete('peak')
    history.replaceState(null, '', mountainPath(INITIAL.id) + (q.toString() ? `?${q}` : '') + location.hash)
  }
} catch { /* keep the address */ }

// the visible Stop-animations switch: remembered, and off from the start under reduced motion
const motionDefault = () => (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on')
const INITIAL_MOTION = (() => {
  try { const v = localStorage.getItem('fp-motion'); if (v === 'on' || v === 'off') return v } catch {}
  return motionDefault()
})()
if (typeof document !== 'undefined') document.documentElement.dataset.motion = INITIAL_MOTION

// the settings (lib/settings.js): theme and text size are already on the page (the head's script)
const INITIAL_SETTINGS = loadSettings()
const INITIAL_THEME = typeof document !== 'undefined' ? applySettings(INITIAL_SETTINGS) : 'night'

export const useStore = create((set, get) => ({
  mode: 'hero', // 'hero' | 'ascent' | 'explorer' | 'idle'
  motion: INITIAL_MOTION, // 'on' | 'off'
  setMotion: (motion) => {
    try { localStorage.setItem('fp-motion', motion) } catch {}
    document.documentElement.dataset.motion = motion
    set({ motion })
  },
  settings: INITIAL_SETTINGS, // { theme, text, units, confirmations, whatsNew, saver }
  theme: INITIAL_THEME, // what the page shows: 'night' | 'day' (a 'system' setting resolved)
  settingsOpen: false,
  setSetting: (key, value) => {
    const settings = { ...get().settings, [key]: value }
    saveSettings(settings)
    set({ settings, theme: applySettings(settings) })
  },
  /** Everything back as it was on a first visit, animations included. */
  resetSettings: () => {
    const settings = loadDefaults()
    saveSettings(settings)
    try { localStorage.removeItem('fp-motion') } catch {}
    const motion = motionDefault()
    document.documentElement.dataset.motion = motion
    set({ settings, theme: applySettings(settings), motion })
  },
  showContours: false, // the explorer's contour-map layer: the whole terrain drawn as the map
  loupeHold: false, // a finger is holding the loupe: the drag moves the loupe, not the camera
  overviewView: 'grid', // 'grid' | 'list' in the All-fourteen overlay
  progress: 0, // 0..1 along the ascent
  altitude: null, // metres, the altimeter's reading on the climb (ui/Ascent.jsx; the wind follows it)
  weather: null, // the summit forecast once loaded (lib/weather.js)
  mountainId: INITIAL.id,
  home: PLACE.home, // the visit started on the home page and hasn't switched mountains (lib/address.js)
  stop: null, // the slug of the climb's stop on screen (ui/Ascent.jsx), for the address
  // a place in the climb named by the address, scrolled to once it is laid out (ui/Ascent.jsx):
  // a stop's slug, '' for the route's first card, null for nothing
  pendingStop: PLACE.route ? PLACE.stop || '' : null,
  overviewOpen: false,
  searchOpen: false,
  correctionOpen: false,
  toast: null, // { text, at, kind }: kind 'confirm' (default), 'error' or 'news' (ui/Toast.jsx)
  consentOpen: false, // 'first' (asked on arrival) | 'asked' (from the footer) | false
  terrainReady: false,
  readyId: null, // the mountain whose terrain was last revealed
  activeRoute: PLACE.route, // nothing is drawn until the user picks a route (or the address names one)
  visibleRoutes: PLACE.route ? [PLACE.route] : [],
  routesOpen: false, // the routes menu under the nav
  showCamps: true,
  showHazards: true,
  showDeathZone: false,
  selected: null, // { type: 'camp' | 'hazard' | 'route', id, routeId }
  hovered: null,
  quality: 'high',
  dpr: 1, // the drawing buffer's pixel ratio, steered by scene/Resolution.jsx
  paths: null,
  fly: null, // { route: id | 'overview' }
  flying: false,
  set: (patch) => set(patch),
  /** Show another mountain. Its address goes on the history (Back returns to the one before),
   *  unless the switch came from the history itself (how = 'none'). */
  setMountain: (id, how = 'push') => {
    const m = byId[id]
    if (!m) return
    if (how !== 'none') {
      try {
        const url = mountainPath(id)
        if (location.pathname !== url) history[how === 'replace' ? 'replaceState' : 'pushState'](null, '', url)
      } catch { /* the page still switches */ }
    }
    set({ mountainId: id, home: false, stop: null, pendingStop: null, weather: null, overviewOpen: false, activeRoute: null, visibleRoutes: [], routesOpen: false, selected: null, hovered: null, progress: 0, mode: 'hero', fly: null, flying: false, paths: null })
  },
  stepMountain: (dir) => {
    const i = mountains.findIndex((m) => m.id === get().mountainId)
    get().setMountain(mountains[(i + dir + mountains.length) % mountains.length].id)
  },
  /** Pick a route: it becomes the active one and is drawn on the mountain. */
  chooseRoute: (id) =>
    set((s) => ({ activeRoute: id, visibleRoutes: s.visibleRoutes.includes(id) ? s.visibleRoutes : [...s.visibleRoutes, id], routesOpen: false, selected: null, progress: 0, stop: null, pendingStop: null })),
  toggleRoute: (id) =>
    set((s) => ({
      visibleRoutes: s.visibleRoutes.includes(id) ? s.visibleRoutes.filter((r) => r !== id) : [...s.visibleRoutes, id],
    })),
}))

// a 'system' theme follows the device when it switches between light and dark
onSystemTheme(() => {
  const s = useStore.getState()
  if (s.settings.theme === 'system') useStore.setState({ theme: applySettings(s.settings) })
})

/** Scene subtrees are wrapped in this with the mountain whose terrain is actually loaded. */
export const MountainCtx = createContext(null)
export const useMountain = () => {
  const ctx = useContext(MountainCtx)
  const fromStore = useStore((s) => byId[s.mountainId])
  return ctx || fromStore
}

import { create } from 'zustand'
import { createContext, useContext } from 'react'
import { byId, mountains } from './data'
import { mountainPath } from './lib/meta.js'
import { DEFAULTS, loadSettings, saveSettings, applySettings, onSystemTheme } from './lib/settings'

const loadDefaults = () => ({ ...DEFAULTS })

/** The mountain in the address: its own page (/k2/), or an older ?peak=k2 link. Null on the home page. */
export function mountainFromUrl() {
  try {
    const seg = location.pathname.split('/').filter(Boolean)[0]
    if (seg && byId[seg]) return byId[seg]
    const id = new URLSearchParams(location.search).get('peak')
    if (id && byId[id]) return byId[id]
  } catch { /* no location: the first mountain */ }
  return null
}

const INITIAL = mountainFromUrl() || mountains[0]

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
  mountainId: INITIAL.id,
  overviewOpen: false,
  searchOpen: false,
  correctionOpen: false,
  toast: null, // { text, at, kind }: kind 'confirm' (default), 'error' or 'news' (ui/Toast.jsx)
  consentOpen: false, // 'first' (asked on arrival) | 'asked' (from the footer) | false
  terrainReady: false,
  readyId: null, // the mountain whose terrain was last revealed
  activeRoute: null, // nothing is drawn until the user picks a route
  visibleRoutes: [],
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
    set({ mountainId: id, overviewOpen: false, activeRoute: null, visibleRoutes: [], routesOpen: false, selected: null, hovered: null, progress: 0, mode: 'hero', fly: null, flying: false, paths: null })
  },
  stepMountain: (dir) => {
    const i = mountains.findIndex((m) => m.id === get().mountainId)
    get().setMountain(mountains[(i + dir + mountains.length) % mountains.length].id)
  },
  /** Pick a route: it becomes the active one and is drawn on the mountain. */
  chooseRoute: (id) =>
    set((s) => ({ activeRoute: id, visibleRoutes: s.visibleRoutes.includes(id) ? s.visibleRoutes : [...s.visibleRoutes, id], routesOpen: false, selected: null, progress: 0 })),
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

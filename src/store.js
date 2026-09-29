import { create } from 'zustand'
import { createContext, useContext } from 'react'
import { byId, mountains } from './data'

// initial mountain from ?peak=<id>, else the first
const INITIAL = (() => {
  try { const id = new URLSearchParams(location.search).get('peak'); if (id && byId[id]) return byId[id] } catch {}
  return mountains[0]
})()

// the visible Stop-animations switch: remembered, and off from the start under reduced motion
const INITIAL_MOTION = (() => {
  try { const v = localStorage.getItem('fp-motion'); if (v === 'on' || v === 'off') return v } catch {}
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on'
})()
if (typeof document !== 'undefined') document.documentElement.dataset.motion = INITIAL_MOTION

export const useStore = create((set, get) => ({
  mode: 'hero', // 'hero' | 'ascent' | 'explorer' | 'idle'
  motion: INITIAL_MOTION, // 'on' | 'off'
  setMotion: (motion) => {
    try { localStorage.setItem('fp-motion', motion) } catch {}
    document.documentElement.dataset.motion = motion
    set({ motion })
  },
  showContours: false, // the explorer's contour-map layer: the whole terrain drawn as the map
  loupeHold: false, // a finger is holding the loupe: the drag moves the loupe, not the camera
  overviewView: 'grid', // 'grid' | 'list' in the All-fourteen overlay
  progress: 0, // 0..1 along the ascent
  mountainId: INITIAL.id,
  overviewOpen: false,
  terrainReady: false,
  activeRoute: null, // nothing is drawn until the user picks a route
  visibleRoutes: [],
  routesOpen: false, // the routes menu under the nav
  showCamps: true,
  showHazards: true,
  showDeathZone: false,
  selected: null, // { type: 'camp' | 'hazard' | 'route', id, routeId }
  hovered: null,
  quality: 'high',
  paths: null,
  fly: null, // { route: id | 'overview' }
  flying: false,
  set: (patch) => set(patch),
  setMountain: (id) => {
    const m = byId[id]
    if (!m) return
    try { history.replaceState(null, '', `?peak=${id}`) } catch {}
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

/** Scene subtrees are wrapped in this with the mountain whose terrain is actually loaded. */
export const MountainCtx = createContext(null)
export const useMountain = () => {
  const ctx = useContext(MountainCtx)
  const fromStore = useStore((s) => byId[s.mountainId])
  return ctx || fromStore
}

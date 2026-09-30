// Go to a place in the site from anywhere (search): a mountain, one of its routes, a camp or a
// hazard in the explorer, or a year of its history. Another mountain first loads, so the rest
// waits until its terrain is on screen with its routes laid out.
import { useStore } from '../store'
import { jumpTo } from './clock'

function whenReady(id, fn) {
  const ok = (s) => s.mountainId === id && s.readyId === id && s.terrainReady && s.paths
  if (ok(useStore.getState())) { requestAnimationFrame(fn); return }
  const stop = useStore.subscribe((s) => {
    if (!ok(s)) return
    stop()
    requestAnimationFrame(fn)
  })
}

/** Put an element at the top of the view; `below: true` keeps it clear of the nav (reading content). */
export function scrollToId(id, { below = false } = {}) {
  let el = document.getElementById(id)
  if (!el) return
  // a timeline row is display: contents and has no box of its own: measure its first cell
  if (!el.getClientRects().length && el.firstElementChild) el = el.firstElementChild
  const nav = below ? (document.querySelector('.nav')?.getBoundingClientRect().bottom || 0) + 16 : 0
  jumpTo(el.getBoundingClientRect().top + window.scrollY - nav)
}

export function goTo({ mountain, route, camp, hazard, year }) {
  const s = useStore.getState()
  if (mountain !== s.mountainId) {
    s.setMountain(mountain)
    jumpTo(0)
  }
  if (!route && !hazard && !year) return
  whenReady(mountain, () => {
    const st = useStore.getState()
    if (camp || hazard) {
      const routes = route && !st.visibleRoutes.includes(route) ? [...st.visibleRoutes, route] : st.visibleRoutes
      useStore.setState({
        activeRoute: route || st.activeRoute, visibleRoutes: routes,
        selected: camp ? { type: 'camp', id: camp, routeId: route } : { type: 'hazard', id: hazard },
        showCamps: camp ? true : st.showCamps, showHazards: hazard ? true : st.showHazards,
        fly: route ? { route } : st.fly,
      })
      scrollToId('explorer')
    } else if (route) {
      st.chooseRoute(route)
      requestAnimationFrame(() => scrollToId('ascent'))
    } else if (year) scrollToId(`y${year}`, { below: true })
  })
}

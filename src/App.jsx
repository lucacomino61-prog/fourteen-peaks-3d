import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene from './scene/Scene'
import { useStore, MountainCtx, mountainFromUrl } from './store'
import { byId, mountains } from './data'
import Ascent from './ui/Ascent'
import Explorer from './ui/Explorer'
import { Nav, Hero, Figures, History, Footer, RoutesMenu } from './ui/Sections'
import Overview from './ui/Overview'
import Poster from './ui/Poster'
import LoupeRing, { LoupePaper } from './ui/Loupe'
import Loader from './ui/Loader'
import Search from './ui/Search'
import Settings from './ui/Settings'
import { longDate } from './lib/format'
import Correction from './ui/Correction'
import Consent from './ui/Consent'
import Toast from './ui/Toast'
import PrintSheet from './ui/PrintSheet'
import { useTerrain } from './lib/useTerrain'
import { warmNeighbours } from './lib/prefetch'
import { jumpTo } from './lib/clock'
import { applyHead } from './lib/head'
import { captureCampaign } from './lib/utm'
import { initAnalytics, mustAsk, track } from './lib/analytics'

gsap.registerPlugin(ScrollTrigger)
if (import.meta.env.DEV) window.__k2 = useStore
const UPDATED = import.meta.env.VITE_LAST_UPDATED

// the arrival: campaign tags first, then visit counting if the visitor already agreed
captureCampaign()
initAnalytics()
if (mustAsk()) useStore.setState({ consentOpen: 'first' })

/** Back and Forward move between mountains; the head follows the one on screen. */
function useAddress(mountainId) {
  useEffect(() => {
    const onPop = () => {
      const m = mountainFromUrl() || mountains[0]
      if (m.id === useStore.getState().mountainId) return
      useStore.getState().setMountain(m.id, 'none')
      jumpTo(0)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  useEffect(() => { applyHead(byId[mountainId], !mountainFromUrl()) }, [mountainId])
}

/** "/" or Ctrl/⌘ K opens the search, unless the visitor is typing somewhere. */
function useSearchKey() {
  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target.closest?.('input, textarea, select, [contenteditable="true"]')
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if ((e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) || combo) {
        if (document.querySelector('dialog[open]') && !useStore.getState().searchOpen) return
        e.preventDefault()
        useStore.setState({ searchOpen: true, routesOpen: false })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

/** The reading bar: a CSS scroll timeline where supported, else the scroll position written here. */
function useProgressFallback() {
  useEffect(() => {
    if (typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: scroll()')) return
    const bar = document.querySelector('.progress i')
    if (!bar) return
    const paint = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
    }
    paint()
    window.addEventListener('scroll', paint, { passive: true })
    window.addEventListener('resize', paint)
    return () => { window.removeEventListener('scroll', paint); window.removeEventListener('resize', paint) }
  }, [])
}

/**
 * "What's new" (a notification in the settings): the date of the build the visitor last saw is
 * kept on the device (fp-seen); when this build is newer, a note says so once the mountain is up.
 * A first visit only records the date.
 */
function useWhatsNew(ready) {
  useEffect(() => {
    if (!ready || !UPDATED) return
    let seen = null
    try { seen = localStorage.getItem('fp-seen'); localStorage.setItem('fp-seen', UPDATED) } catch { return }
    if (seen && seen < UPDATED && useStore.getState().settings.whatsNew)
      useStore.setState({ toast: { text: `Updated on ${longDate(UPDATED)} since your last visit`, kind: 'news', at: Date.now() } })
  }, [ready])
}

/** The site's own counted events (only with the visitor's agreement: lib/analytics.js). */
function useEvents() {
  useEffect(() => useStore.subscribe((s, prev) => {
    if (s.activeRoute && s.activeRoute !== prev.activeRoute) track('Route chosen', { mountain: s.mountainId, route: s.activeRoute })
    if (s.mode === 'explorer' && prev.mode !== 'explorer') track('Explorer opened', { mountain: s.mountainId })
  }), [])
}

/** The section in the middle of the viewport sets the scene mode. */
function useModes(ready) {
  useEffect(() => {
    if (!ready) return
    const triggers = [
      ['#top', 'hero'],
      ['#ascent', 'ascent'],
      ['#explorer', 'explorer'],
      ['#figures', 'idle'],
      ['#history', 'idle'],
      ['.footer', 'idle'], // a jump straight to the bottom passes the others without entering them
    ].map(([sel, mode]) =>
      ScrollTrigger.create({ trigger: sel, start: 'top 50%', end: 'bottom 50%', onToggle: (self) => self.isActive && useStore.setState({ mode }) }),
    )
    // What floats over the 3D in a section (the hero's controls, the stop card, tabs and altimeter,
    // the explorer's panel) fades out as the section scrolls away, instead of sliding up under the
    // see-through nav: data-leaving while the section's end is on its way out (index.css). The
    // ascent's last stop rests with the section's end on the bottom edge, so its fade starts just
    // past it: any earlier and the summit card was never shown.
    const leaving = [
      ['#top', 'bottom 45%'],
      ['#ascent', 'bottom 98%'],
      ['#explorer', 'bottom 92%'],
    ].map(([sel, start]) =>
      ScrollTrigger.create({
        trigger: sel, start, end: 'bottom top',
        onToggle: (self) => { const el = document.querySelector(sel); if (el) el.dataset.leaving = self.isActive ? '1' : '0' },
      }),
    )
    return () => [...triggers, ...leaving].forEach((t) => t.kill())
  }, [ready])
}

export default function App() {
  const mountainId = useStore((s) => s.mountainId)
  const { terrain, loading } = useTerrain(mountainId)
  const terrainReady = useStore((s) => s.terrainReady)
  const mode = useStore((s) => s.mode)
  const paths = useStore((s) => s.paths)
  useModes(!!terrain && !!paths)
  useAddress(mountainId)
  useSearchKey()
  useProgressFallback()
  useEvents()
  useWhatsNew(terrainReady)
  // once the current mountain is up, fetch its neighbours' first-paint files so the arrows are instant
  useEffect(() => {
    if (!terrainReady) return
    const ric = window.requestIdleCallback
    const warm = () => warmNeighbours(mountainId)
    const h = ric ? ric(warm) : setTimeout(warm, 1500)
    return () => (ric ? window.cancelIdleCallback(h) : clearTimeout(h))
  }, [terrainReady, mountainId])
  // the footer states the size of the tile actually on screen
  const tile = terrain && terrain.id === mountainId ? { km: terrain.geo.sizeX, metresPerPx: terrain.meta.metresPerPx } : null

  return (
    <>
      <a className="skip-link" href="#main">Skip to the content</a>
      {/* how far down the page: a hairline at the top edge */}
      <div className="progress" aria-hidden="true"><i /></div>
      {/* in the explorer the wheel zooms the camera, so smooth scrolling keeps out of the stage */}
      <div className="stage" data-mode={mode} data-loading={loading || !terrainReady ? '1' : '0'} data-lenis-prevent={mode === 'explorer' ? '' : undefined}>
        <Poster />
        <LoupePaper />
        {terrain && <Scene terrain={terrain} />}
        <LoupeRing />
      </div>
      <div className="grain" aria-hidden />
      <Nav />
      <RoutesMenu />
      <Overview />
      <Loader progress={terrain ? 0.62 : 0.14} ready={terrainReady} />
      <main className="page" id="main" tabIndex={-1}>
        <Hero loading={loading || !terrainReady} />
        {terrain && <MountainCtx.Provider value={byId[terrain.id]}><Ascent terrain={terrain} /></MountainCtx.Provider>}
        <Explorer />
        <div className="content">
          <Figures />
          <History />
          <Footer tile={tile} />
        </div>
      </main>
      <Search />
      <Settings />
      <Correction />
      <Consent />
      <Toast />
      <PrintSheet />
    </>
  )
}

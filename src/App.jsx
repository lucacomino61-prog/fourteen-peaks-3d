import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene from './scene/Scene'
import { useStore, MountainCtx } from './store'
import { byId } from './data'
import Ascent from './ui/Ascent'
import Explorer from './ui/Explorer'
import { Nav, Hero, Figures, History, Footer, RoutesMenu } from './ui/Sections'
import Overview from './ui/Overview'
import Poster from './ui/Poster'
import LoupeRing, { LoupePaper } from './ui/Loupe'
import Loader from './ui/Loader'
import { useTerrain } from './lib/useTerrain'
import { warmNeighbours } from './lib/prefetch'

gsap.registerPlugin(ScrollTrigger)
if (import.meta.env.DEV) window.__k2 = useStore

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
    ].map(([sel, mode]) =>
      ScrollTrigger.create({ trigger: sel, start: 'top 50%', end: 'bottom 50%', onToggle: (self) => self.isActive && useStore.setState({ mode }) }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [ready])
}

export default function App() {
  const mountainId = useStore((s) => s.mountainId)
  const { terrain, loading } = useTerrain(mountainId)
  const terrainReady = useStore((s) => s.terrainReady)
  const mode = useStore((s) => s.mode)
  const paths = useStore((s) => s.paths)
  useModes(!!terrain && !!paths)
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
    </>
  )
}

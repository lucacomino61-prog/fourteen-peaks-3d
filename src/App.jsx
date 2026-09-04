import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene, { useTerrain } from './scene/Scene'
import { useStore, MountainCtx } from './store'
import { byId } from './data'
import Ascent from './ui/Ascent'
import Explorer from './ui/Explorer'
import { Nav, Hero, Figures, History, Footer, RoutesMenu } from './ui/Sections'
import Overview from './ui/Overview'
import { warmOthers } from './lib/prefetch'

gsap.registerPlugin(ScrollTrigger)
if (import.meta.env.DEV) window.__k2 = useStore

function useModes(ready) {
  const [current, setCurrent] = useState('top')
  useEffect(() => {
    if (!ready) return
    const set = (mode, id) => () => { useStore.setState({ mode }); setCurrent(id) }
    const triggers = [
      ['#top', 'hero', 'top'],
      ['#ascent', 'ascent', 'ascent'],
      ['#explorer', 'explorer', 'explorer'],
      ['#figures', 'idle', 'history'],
      ['#history', 'idle', 'history'],
    ].map(([sel, mode, id]) =>
      ScrollTrigger.create({ trigger: sel, start: 'top 50%', end: 'bottom 50%', onToggle: (self) => self.isActive && set(mode, id)() }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [ready])
  return current
}

export default function App() {
  const mountainId = useStore((s) => s.mountainId)
  const { terrain, loading } = useTerrain(mountainId)
  const terrainReady = useStore((s) => s.terrainReady)
  const mode = useStore((s) => s.mode)
  const paths = useStore((s) => s.paths)
  const current = useModes(!!terrain && !!paths)
  // once the current mountain is up, warm the others in the background so switching is instant
  const quality = useStore((s) => s.quality)
  useEffect(() => {
    if (!terrainReady) return
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500))
    const h = idle(() => warmOthers(mountainId, quality))
    return () => { if (window.cancelIdleCallback) window.cancelIdleCallback(h) }
  }, [terrainReady, mountainId, quality])

  return (
    <>
      <div className="stage" data-mode={mode} data-loading={loading || !terrainReady ? '1' : '0'}>
        {terrain ? <Scene terrain={terrain} /> : (
          <div className="loading">Loading terrain<b>4 million elevation samples, 31 km of mountains</b></div>
        )}
      </div>
      <div className="grain" aria-hidden />
      <Nav current={current} />
      <RoutesMenu />
      <Overview />
      <main className="page">
        <Hero loading={loading || !terrainReady} />
        {terrain && <MountainCtx.Provider value={byId[terrain.id]}><Ascent terrain={terrain} /></MountainCtx.Provider>}
        <Explorer />
        <div className="content">
          <Figures />
          <History />
          <Footer />
        </div>
      </main>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useStore, useMountain } from '../store'
import { fmt } from '../lib/format'

// The first screen while the terrain streams in: an altimeter that climbs with the download
// towards the summit's height, and a skip. When the mountain is ready the counter tops out and a
// round portal opens onto it (the loupe's circle, at the size of the screen). First load only;
// switching mountains keeps the page and dims the stage instead.
export default function Loader({ progress, ready }) {
  const { peak } = useMountain()
  const motion = useStore((s) => s.motion)
  const [phase, setPhase] = useState('loading') // 'loading' | 'leaving' | 'gone'
  const num = useRef()
  const count = useRef({ v: 0 })

  // the count follows the download; GSAP tweens it, on the one clock
  useEffect(() => {
    if (phase !== 'loading') return
    const target = peak.elevation * (ready ? 1 : progress)
    const tw = gsap.to(count.current, {
      v: target,
      duration: motion === 'on' ? (ready ? 0.7 : 1.2) : 0,
      ease: ready ? 'power2.inOut' : 'power2.out',
      onUpdate: () => { if (num.current) num.current.textContent = fmt(Math.round(count.current.v)) },
      onComplete: () => { if (ready) setPhase('leaving') },
    })
    return () => tw.kill()
  }, [progress, ready, peak.elevation, phase, motion])

  // the portal takes 800 ms (a fade when animations are stopped), then the loader is removed
  useEffect(() => {
    if (phase !== 'leaving') return
    const t = setTimeout(() => setPhase('gone'), motion === 'on' ? 850 : 200)
    return () => clearTimeout(t)
  }, [phase, motion])

  if (phase === 'gone') return null
  return (
    <div className={`loader ${phase === 'leaving' ? 'is-leaving' : ''}`} role="status" aria-live="polite">
      <p className="loader-name" translate="no">{peak.name}</p>
      <p className="loader-count mono" aria-hidden><span ref={num}>0</span><small>m</small></p>
      <p className="loader-note mono">{ready ? 'Terrain ready' : 'Loading the terrain · 4 million elevation samples'}</p>
      <button className="loader-skip" onClick={() => setPhase('leaving')}>Skip <span aria-hidden>→</span></button>
    </div>
  )
}

import { useLayoutEffect, useRef } from 'react'
import { useStore, useMountain } from '../store'

// The peak's name at poster size, set BEHIND the 3D mountain: it sits in the stage under the
// transparent canvas, so the ridge cuts across the letters and the far ridges dissolve over them.
// Shown in the hero only; the page's own h1 carries the same text for assistive technology.
export default function Poster() {
  const { peak } = useMountain()
  const mode = useStore((s) => s.mode)
  const ref = useRef()

  // Fit the name to the line: long names first take the narrow end of the width axis, then the
  // size fills 92% of the viewport, 480 px at most (a 2-letter name would otherwise fill the sky).
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      const avail = window.innerWidth * 0.92
      el.style.fontSize = '100px'
      el.style.fontStretch = '100%'
      if ((avail / el.scrollWidth) * 100 < 220) el.style.fontStretch = '75%'
      const size = Math.min(480, window.innerHeight * 0.5, (avail / el.scrollWidth) * 100)
      el.style.fontSize = `${Math.max(56, size)}px`
    }
    fit()
    document.fonts?.ready.then(fit)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [peak.name])

  return (
    <div className="poster" data-on={mode === 'hero' ? '1' : '0'} aria-hidden>
      <span ref={ref} key={peak.name} translate="no">{peak.name}</span>
    </div>
  )
}

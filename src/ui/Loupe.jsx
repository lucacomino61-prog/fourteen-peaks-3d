import { useEffect, useRef } from 'react'
import { loupe } from '../lib/loupe'

// The loupe on the page. The terrain shader draws the contour map inside it and scene/Terrain.jsx
// moves these in the same frame (lib/loupe.js has the pointer state).

/** The ring and the read-out, above the canvas. */
export default function LoupeRing() {
  const ring = useRef()
  const read = useRef()
  useEffect(() => {
    loupe.ring = ring.current
    loupe.read = read.current
    return () => { loupe.ring = null; loupe.read = null }
  }, [])
  return (
    <div className="loupe" ref={ring} data-on="0" aria-hidden>
      <span className="loupe-read mono" ref={read} />
    </div>
  )
}

/** A disc of map paper under the canvas: where the ring holds sky, it shows blank paper. */
export function LoupePaper() {
  const ref = useRef()
  useEffect(() => {
    loupe.paper = ref.current
    return () => { loupe.paper = null }
  }, [])
  return <div className="loupe-paper" ref={ref} data-on="0" aria-hidden />
}

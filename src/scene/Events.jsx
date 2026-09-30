import { useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useStore, useMountain } from '../store'
import { historyPlaces, placePoint, yearsText } from '../lib/history'

// The explorer's History layer: a flag on each place the history names (lib/history.js), its pole on
// the ground and its years on the flag. Selecting one opens the entry in the detail card
// (ui/Explorer.jsx); keyboard users reach the same entries from the history's "Show on the mountain".

function Flag({ terrain, place, pos }) {
  const wrap = useRef()
  const tick = useRef(0)
  const set = useStore((s) => s.set)
  const selected = useStore((s) => s.selected)
  const isSel = selected?.type === 'history' && selected.id === place.key
  const summit = place.kind === 'summit'

  useFrame(({ camera }, dt) => {
    tick.current += dt
    if (tick.current < 0.14 || !wrap.current) return
    tick.current = 0
    const vis = terrain.lineOfSight(camera.position, pos)
    // as far as the camps keep their names: the terrain dissolves from 11 km (the summit's, 30)
    const far = camera.position.distanceTo(pos) > (summit ? 30 : 11)
    wrap.current.dataset.hidden = !vis || far ? '1' : '0'
  })

  return (
    <Html position={pos} zIndexRange={[18, 0]} style={{ pointerEvents: 'none' }}>
      <button type="button" tabIndex={-1} ref={wrap} className={`ev ${isSel ? 'is-selected' : ''}`}
        onClick={(e) => { e.stopPropagation(); set({ selected: { type: 'history', id: place.key, year: place.events[0].year } }) }}>
        <span className="ev-tag mono">{yearsText(place.events)}</span>
        <span className="ev-pole" aria-hidden="true" />
      </button>
    </Html>
  )
}

export default function Events({ terrain, paths }) {
  const m = useMountain()
  const show = useStore((s) => s.showHistory && s.mode === 'explorer')
  const places = useMemo(() => historyPlaces(m).map((p) => ({ place: p, pos: placePoint(terrain, paths, p) })).filter((x) => x.pos), [m, terrain, paths])
  if (!show) return null
  return places.map(({ place, pos }) => <Flag key={place.key} terrain={terrain} place={place} pos={pos} />)
}

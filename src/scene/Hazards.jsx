import { useMemo, useRef } from 'react'
import { Line, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useStore, useMountain } from '../store'

const SEV = { 3: '#ffb64d', 4: '#ff7a45', 5: '#ff3b3b' }

function ring(terrain, lat, lon, radiusM, n = 56) {
  const pts = []
  const dLat = radiusM / 111195
  const dLon = radiusM / (111195 * Math.cos((lat * Math.PI) / 180))
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    pts.push(terrain.surface(lat + Math.sin(a) * dLat, lon + Math.cos(a) * dLon, 14))
  }
  return pts
}

function Zone({ terrain, h }) {
  const line = useRef()
  const wrap = useRef()
  const set = useStore((s) => s.set)
  const selected = useStore((s) => s.selected)
  const isSel = selected?.id === h.id
  const color = SEV[h.severity] || SEV[3]
  const pts = useMemo(() => ring(terrain, h.lat, h.lon, h.radius), [terrain, h])
  const center = useMemo(() => terrain.surface(h.lat, h.lon, 30), [terrain, h])
  const tick = useRef(0)

  useFrame(({ camera, clock }, dt) => {
    if (line.current) line.current.material.opacity = 0.55 + Math.sin(clock.elapsedTime * 2.4 + h.radius) * 0.25
    tick.current += dt
    if (tick.current > 0.15) {
      tick.current = 0
      if (wrap.current) {
        const vis = terrain.lineOfSight(camera.position, center)
        const dist = camera.position.distanceTo(center)
        wrap.current.dataset.hidden = !vis || dist > 7 ? '1' : '0'
      }
    }
  })

  return (
    <group>
      <Line ref={line} points={pts} color={color} lineWidth={isSel ? 2.4 : 1.4} transparent opacity={0.7} depthWrite={false} />
      <Line points={pts} color={color} lineWidth={6} transparent opacity={0.12} depthWrite={false} />
      <Html position={center} center zIndexRange={[15, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={wrap} className={`hz ${isSel ? 'is-selected' : ''}`} style={{ '--hz': color }}
          onClick={(e) => { e.stopPropagation(); set({ selected: { type: 'hazard', id: h.id } }) }}>
          <span className="hz-icon">!</span>
          <span className="hz-label">{h.name}</span>
        </div>
      </Html>
    </group>
  )
}

export default function Hazards({ terrain }) {
  const { routes, hazards } = useMountain()
  const showHazards = useStore((s) => s.showHazards)
  const mode = useStore((s) => s.mode)
  const visible = useStore((s) => s.visibleRoutes)
  const active = useStore((s) => s.activeRoute)
  if (!showHazards || mode === 'hero') return null

  const wanted = new Set()
  for (const r of routes) {
    if (!visible.includes(r.id)) continue
    if (mode === 'ascent' && r.id !== active) continue
    r.hazards.forEach((id) => wanted.add(id))
  }
  return hazards.filter((h) => !h.band && wanted.has(h.id)).map((h) => <Zone key={h.id} terrain={terrain} h={h} />)
}

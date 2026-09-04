import { useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore, useMountain } from '../store'

function Marker({ terrain, pos, label, alt, color, id, routeId, kind = 'camp', big = false, dim = false }) {
  const ref = useRef()
  const wrap = useRef()
  const selected = useStore((s) => s.selected)
  const set = useStore((s) => s.set)
  const isSel = selected?.id === id
  const tick = useRef(0)

  useFrame(({ camera, clock }, dt) => {
    tick.current += dt
    if (tick.current > 0.12) {
      tick.current = 0
      const vis = terrain.lineOfSight(camera.position, pos)
      const dist = camera.position.distanceTo(pos)
      const far = dist > (big ? 30 : 9)
      if (wrap.current) {
        wrap.current.dataset.hidden = !vis || far ? '1' : '0'
        wrap.current.dataset.near = dist < 2.5 ? '1' : '0'
      }
    }
    if (ref.current) {
      const s = 0.012 + Math.sin(clock.elapsedTime * 2.2) * 0.002
      const dist = camera.position.distanceTo(pos)
      ref.current.scale.setScalar(s * Math.max(0.5, dist * 0.35))
    }
  })

  return (
    <group position={pos}>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div
          ref={wrap}
          className={`mk mk-${kind} ${isSel ? 'is-selected' : ''} ${big ? 'mk-big' : ''} ${dim && !isSel ? 'mk-dim' : ''}`}
          style={{ '--mk': color }}
          onClick={(e) => { e.stopPropagation(); set({ selected: { type: kind, id, routeId } }) }}
        >
          <span className="mk-dot" />
          <span className="mk-label">
            <b>{label}</b>
            <i>{alt.toLocaleString()} m</i>
          </span>
        </div>
      </Html>
    </group>
  )
}

export default function Camps({ terrain }) {
  const { routes, peak } = useMountain()
  const visible = useStore((s) => s.visibleRoutes)
  const active = useStore((s) => s.activeRoute)
  const mode = useStore((s) => s.mode)
  const showCamps = useStore((s) => s.showCamps)

  const summit = useMemo(() => terrain.snapToPeak(peak.lat, peak.lon).add(new THREE.Vector3(0, 0.03, 0)), [terrain, peak])
  const camps = useMemo(() => {
    const out = []
    for (const r of routes)
      r.camps.forEach((c, i) =>
        out.push({ ...c, routeId: r.id, color: r.color, id: `${r.id}:${i}:${c.name}`, pos: terrain.surface(c.lat, c.lon, 12) }))
    return out
  }, [terrain, routes])

  const show = showCamps && mode !== 'hero'
  return (
    <group>
      <Marker terrain={terrain} pos={summit} label={peak.name} alt={peak.elevation} color="#ffffff" id="summit" kind="summit" big />
      {show &&
        camps
          .filter((c) => visible.includes(c.routeId) && (mode !== 'ascent' || c.routeId === active))
          .map((c) => <Marker key={c.id} terrain={terrain} pos={c.pos} label={c.name} alt={c.alt} color={c.color} id={c.id} routeId={c.routeId} dim={mode === 'explorer' && c.routeId !== active} />)}
    </group>
  )
}

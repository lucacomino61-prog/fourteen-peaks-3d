import { Line } from '@react-three/drei'
import { drapePath } from '../lib/paths'
import { useStore, useMountain } from '../store'

export function buildPaths(terrain, routes) {
  const out = {}
  for (const r of routes) out[r.id] = drapePath(terrain, r.waypoints, { stepM: 30, liftM: 22, smooth: 3 })
  return out
}

export default function Routes({ paths }) {
  const { routes } = useMountain()
  const visible = useStore((s) => s.visibleRoutes)
  const active = useStore((s) => s.activeRoute)
  const mode = useStore((s) => s.mode)
  const hovered = useStore((s) => s.hovered)

  return routes.map((r) => {
    const p = paths[r.id]
    if (!p) return null
    const isActive = r.id === active
    const isHover = hovered?.type === 'route' && hovered.id === r.id
    const show = visible.includes(r.id) && (mode !== 'ascent' || isActive)
    const lit = isActive || isHover
    const dim = mode === 'explorer' && !lit
    return (
      <group key={r.id} visible={show}>
        {/* wide soft glow */}
        <Line points={p.points} color={r.color} lineWidth={lit ? 16 : 9} transparent opacity={dim ? 0.1 : 0.22} depthWrite={false} />
        {/* bright core */}
        <Line points={p.points} color={r.color} lineWidth={lit ? 4 : 2.6} transparent opacity={dim ? 0.6 : 1} depthWrite={false} />
        {/* white hot centre on the active route */}
        {lit && <Line points={p.points} color="#ffffff" lineWidth={1.2} transparent opacity={0.85} depthWrite={false} />}
        {/* faint through-terrain ghost so hidden sections still read */}
        <Line points={p.points} color={r.color} lineWidth={lit ? 2 : 1.2} transparent opacity={lit ? 0.28 : 0.12} depthTest={false} depthWrite={false} dashed dashSize={0.06} gapSize={0.05} />
      </group>
    )
  })
}


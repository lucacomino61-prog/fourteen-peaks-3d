import { Line } from '@react-three/drei'
import { useStore, useMountain } from '../store'
import { routeColor } from '../lib/palette'

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
    // routes are told apart by number and by the signal on the active one, not by hue
    const color = routeColor(isActive)
    return (
      <group key={r.id} visible={show}>
        {/* wide soft glow */}
        <Line points={p.points} color={color} lineWidth={lit ? 16 : 9} transparent opacity={dim ? 0.08 : 0.2} depthWrite={false} />
        {/* bright core */}
        <Line points={p.points} color={color} lineWidth={lit ? 4 : 2.4} transparent opacity={dim ? 0.55 : 1} depthWrite={false} />
        {/* white-hot centre on the active or hovered route */}
        {lit && <Line points={p.points} color="#ffffff" lineWidth={1.2} transparent opacity={0.85} depthWrite={false} />}
        {/* faint through-terrain ghost so hidden sections still read */}
        <Line points={p.points} color={color} lineWidth={lit ? 2 : 1.2} transparent opacity={lit ? 0.28 : 0.12} depthTest={false} depthWrite={false} dashed dashSize={0.06} gapSize={0.05} />
      </group>
    )
  })
}

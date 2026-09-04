import * as THREE from 'three'

/** Densify a lat/lon polyline onto the terrain surface. Returns { points: Vector3[], cumulative: number[] (km), length } */
export function drapePath(terrain, waypoints, { stepM = 30, liftM = 20, smooth = 3 } = {}) {
  const raw = []
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [la1, lo1] = waypoints[i], [la2, lo2] = waypoints[i + 1]
    const a = terrain.surface(la1, lo1), b = terrain.surface(la2, lo2)
    const distKm = Math.hypot(a.x - b.x, a.z - b.z)
    const n = Math.max(1, Math.round((distKm * 1000) / stepM))
    for (let k = 0; k < n; k++) {
      const t = k / n
      raw.push(terrain.surface(la1 + (la2 - la1) * t, lo1 + (lo2 - lo1) * t, liftM))
    }
  }
  const [laL, loL] = waypoints[waypoints.length - 1]
  raw.push(terrain.surface(laL, loL, liftM))

  // smooth heights a little so the line doesn't jitter on 30 m texels
  const points = raw.map((p, i) => {
    let y = 0, c = 0
    for (let k = -smooth; k <= smooth; k++) {
      const j = Math.min(Math.max(i + k, 0), raw.length - 1)
      y += raw[j].y; c++
    }
    return new THREE.Vector3(p.x, y / c, p.z)
  })

  const cumulative = [0]
  for (let i = 1; i < points.length; i++) cumulative.push(cumulative[i - 1] + points[i].distanceTo(points[i - 1]))
  return { points, cumulative, length: cumulative[cumulative.length - 1] }
}

/** Point at fraction t (0..1 of arc length) along a draped path */
export function pointAt(path, t, out = new THREE.Vector3()) {
  const target = Math.min(Math.max(t, 0), 1) * path.length
  const c = path.cumulative
  let lo = 0, hi = c.length - 1
  while (lo < hi - 1) { const mid = (lo + hi) >> 1; if (c[mid] <= target) lo = mid; else hi = mid }
  const seg = c[hi] - c[lo] || 1
  const f = (target - c[lo]) / seg
  return out.copy(path.points[lo]).lerp(path.points[hi], f)
}

/** Fraction along path closest to a scene point (xz only) */
export function fractionNear(path, p) {
  let best = 0, bestD = Infinity
  for (let i = 0; i < path.points.length; i++) {
    const q = path.points[i]
    const d = (q.x - p.x) ** 2 + (q.z - p.z) ** 2
    if (d < bestD) { bestD = d; best = i }
  }
  return path.cumulative[best] / path.length
}

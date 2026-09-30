import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointAt } from '../lib/paths'
import { useStore, useMountain } from '../store'

// with animations stopped (the nav switch, or reduced motion) the camera jumps instead of easing
// and the hero no longer turns by itself
const still = () => useStore.getState().motion === 'off'
const _pos = new THREE.Vector3(), _look = new THREE.Vector3(), _r = new THREE.Vector3(), _a = new THREE.Vector3(), _v = new THREE.Vector3()

/**
 * Whether the climb at `to` is in plain view from `from`. Plain line of sight let the crest of a hill
 * in front of the camera graze the point (a route's start sat on the skyline of a blurred slope on
 * phones), so most of the sight line must clear the ground by an angle: about 5° on screen next to
 * the camera, easing to 1.5°. The last eighth, next to the point, is the slope it lies on, which only
 * has to stay under the line.
 */
function inView(terrain, from, to) {
  const d = from.distanceTo(to)
  for (let i = 1; i <= 28; i++) {
    const t = i / 32
    const x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t, z = from.z + (to.z - from.z) * t
    const tan = 0.087 - 0.07 * t // tan 5° → tan 1.5° at t = 0.875
    if (y - terrain.heightAtScene(x, z) / 1000 < d * t * tan) return false
  }
  return terrain.lineOfSight(from, to, 32, 0.03)
}

/** A good camera pose for viewing a whole route */
function routePose(terrain, paths, summit, id, far = 1, portrait = false) {
  // on phones the bottom sheet covers ~45% of the frame: aim lower so the mountain sits in the top half
  const drop = portrait ? 1.1 : 0
  if (id === 'overview' || !paths[id]) {
    return {
      pos: new THREE.Vector3(summit.x - 4.2 * far, summit.y + 1.4 * far, summit.z + 6.4 * far),
      target: new THREE.Vector3(summit.x, summit.y - 1.1 - drop, summit.z),
    }
  }
  const path = paths[id]
  const base = path.points[0]
  // Aim at the middle of the line, but never more than 3.5 km short of the summit, so the summit
  // stays in the frame while the explorer orbits; then stand 8.5 km back (× far), closer when
  // needed to keep the summit inside the 11 km where the terrain dissolves into the sky
  // (Terrain.jsx). The midpoint aim used to lose the summit off the top on 28 of the 70 routes.
  const mid = new THREE.Box3().setFromPoints(path.points).getCenter(new THREE.Vector3())
  const off = Math.hypot(summit.x - mid.x, summit.z - mid.z)
  if (off > 3.5) mid.lerp(summit, 1 - 3.5 / off)
  mid.y = Math.max(mid.y, summit.y - 1.2)
  // look from the side the route faces: direction from summit towards the base, flattened
  _v.set(base.x - summit.x, 0, base.z - summit.z).normalize()
  const near = Math.hypot(summit.x - mid.x, summit.z - mid.z), rise = summit.y - (mid.y + 0.2)
  let dist = 8.5 * far
  while (dist > 4.2 && (near + dist) ** 2 + (0.42 * dist - rise) ** 2 > 10.5 ** 2) dist -= 0.1
  const pos = new THREE.Vector3(mid.x + _v.x * dist, mid.y + dist * 0.42, mid.z + _v.z * dist)
  const ground = terrain.heightAtScene(pos.x, pos.z) / 1000 + 0.3
  if (pos.y < ground) pos.y = ground
  // a smaller drop than the overview's: more would push the summit off the top of a phone
  return { pos, target: new THREE.Vector3(mid.x, mid.y + 0.2 - drop * 0.6, mid.z) }
}

export default function CameraRig({ terrain, paths, controls }) {
  const { camera, size } = useThree()
  const aspect = size.width / Math.max(1, size.height)
  const portrait = aspect < 1
  const far = portrait ? 1.7 : aspect < 1.4 ? 1.25 : 1 // pull back on narrow frames
  const mode = useStore((s) => s.mode)
  const { peak } = useMountain()
  const summit = useMemo(() => terrain.snapToPeak(peak.lat, peak.lon), [terrain, peak])
  const look = useRef(summit.clone())
  const first = useRef(true)
  // a new mountain: snap instead of easing across the map
  useEffect(() => { first.current = true; look.current.copy(summit) }, [summit])
  const flying = useRef(null) // { pos, target, t }
  // hero 360°: user yaw/pitch from dragging, plus a slow auto-rotation that pauses while interacting
  const spin = useRef({ yaw: 0, pitch: 0, auto: 0, lastInput: -10, dragging: false })
  const { gl } = useThree()
  useEffect(() => {
    const el = gl.domElement
    let px = 0, py = 0
    const down = (e) => {
      if (useStore.getState().mode !== 'hero') return
      spin.current.dragging = true; px = e.clientX; py = e.clientY
      el.setPointerCapture?.(e.pointerId)
      el.style.cursor = 'grabbing'
    }
    const move = (e) => {
      if (!spin.current.dragging || useStore.getState().loupeHold) return // a held loupe moves, not the mountain
      const dx = e.clientX - px, dy = e.clientY - py
      px = e.clientX; py = e.clientY
      spin.current.yaw += dx * 0.006
      spin.current.pitch = THREE.MathUtils.clamp(spin.current.pitch + dy * 0.004, -0.6, 1.6)
      spin.current.lastInput = performance.now() / 1000
    }
    const up = (e) => { spin.current.dragging = false; el.style.cursor = ''; el.releasePointerCapture?.(e.pointerId) }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => { el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up) }
  }, [gl])

  // phones: vertical swipes over the hero still scroll the page, horizontal ones turn the mountain
  useEffect(() => { gl.domElement.style.setProperty('touch-action', mode === 'hero' ? 'pan-y' : 'none') }, [gl, mode])

  useEffect(() => {
    const c = controls.current
    if (!c) return
    if (mode === 'explorer') {
      c.target.copy(look.current)
      c.update()
      // arriving from the ascent: settle onto the active route
      const id = useStore.getState().activeRoute
      flying.current = { ...routePose(terrain, paths, summit, id, far, portrait), t: 0 }
      useStore.setState({ flying: true })
    } else {
      flying.current = null
      useStore.setState({ flying: false })
    }
  }, [mode, controls, terrain, paths, summit, far, portrait])

  // fly requests from the UI
  useEffect(() => useStore.subscribe((s, prev) => {
    if (s.fly && s.fly !== prev.fly) {
      flying.current = { ...routePose(terrain, paths, summit, s.fly.route, far, portrait), t: 0 }
      useStore.setState({ fly: null, flying: true })
    }
  }), [terrain, paths, summit, far, portrait])

  useFrame(({ clock }, dt) => {
    const c = controls.current
    if (mode === 'explorer') {
      const f = flying.current
      if (f && c) {
        const d = Math.min(dt, 0.1)
        f.t = still() ? 1 : Math.min(1, f.t + d / 1.6)
        const e = 1 - Math.pow(1 - f.t, 3)
        const k = still() ? 1 : Math.min(1, d * (2.5 + e * 3))
        camera.position.lerp(f.pos, k)
        c.target.lerp(f.target, k)
        c.update()
        if (f.t >= 1 && camera.position.distanceTo(f.pos) < 0.02) { flying.current = null; useStore.setState({ flying: false }) }
      }
      if (c) look.current.copy(c.target)
      return
    }
    const t = clock.elapsedTime
    const progress = useStore.getState().progress

    const noRoute = mode === 'ascent' && !useStore.getState().activeRoute
    if (mode === 'hero' || mode === 'idle' || noRoute) {
      // 360° product view: slow auto-rotation, paused for a few seconds after the user drags
      const sp = spin.current
      const idle = t - sp.lastInput > 3
      if (idle && !sp.dragging && !still()) sp.auto += Math.min(dt, 0.1) * 0.07
      const a = -0.5 + sp.auto + sp.yaw
      const dist = 7.2 * far
      const lift = 0.7 * far + sp.pitch * 2.2
      _pos.set(summit.x + Math.sin(a) * dist, summit.y + lift, summit.z + Math.cos(a) * dist)
      const ground = terrain.heightAtScene(_pos.x, _pos.z) / 1000 + 0.25
      if (_pos.y < ground) _pos.y = ground
      // keep the summit right of centre so the title block owns the left (wide frames only);
      // on portrait the title sits below, so aim lower to lift the mountain into the top half
      const rx = Math.cos(a), rz = -Math.sin(a) // camera-right on the xz plane
      const side = 0 // the hero has no text block: the summit sits in the middle of the frame
      const down = mode === 'hero' && portrait ? 0.7 : 0
      _look.set(summit.x + rx * side, summit.y - 1.0 - down, summit.z + rz * side)
    } else {
      const path = paths[useStore.getState().activeRoute] || Object.values(paths)[0]
      if (!path) return
      const p = THREE.MathUtils.clamp(progress, 0, 1)
      pointAt(path, p, _r)
      // look a little ahead up the climb, at most 300 m: 5% of a long route (Everest's South Col
      // route is 10 km) swung the camp itself to the edge of the frame, under the altimeter
      pointAt(path, Math.min(p + Math.min(0.05, 0.3 / path.length), 1), _a)
      // view from the side of the mountain this route climbs: direction summit → base, swinging as we rise
      const b = path.points[0]
      const baseAng = Math.atan2(b.x - summit.x, b.z - summit.z)
      const ang = baseAng + THREE.MathUtils.lerp(0.28, -0.32, p)
      const end = p > 0.96 ? (p - 0.96) * 25 : 0
      // start further back and higher so the base texture resolves (it smeared at 1.6 km), closing in as we climb
      const q = THREE.MathUtils.smoothstep(p, 0, 0.35)
      const dist = THREE.MathUtils.lerp(2.5, THREE.MathUtils.lerp(1.6, 1.05, p), q) * (1 + end * 1.6) * far
      const lift = THREE.MathUtils.lerp(0.75, THREE.MathUtils.lerp(0.42, 0.2, p), q) * (1 + end * 1.2) * far
      _pos.set(_r.x + Math.sin(ang) * dist, _r.y + lift, _r.z + Math.cos(ang) * dist)
      const ground = terrain.heightAtScene(_pos.x, _pos.z) / 1000 + 0.12
      if (_pos.y < ground) _pos.y = ground
      // a ridge between the camera and the climb (likelier on a phone, which stands further back:
      // K2's base camp showed as a blurred slope with no route): rise until the point is in view,
      // in 50 m steps so the camera's target does not jump as the scroll moves it
      for (let i = 0; i < 40 && !inView(terrain, _pos, _r); i++) _pos.y += 0.05
      // aim slightly below the point ahead so the slope fills the frame; on a phone the stop card
      // covers the lower part of the screen, so aim lower still (about 6°): the climb sits above it
      _look.copy(_a).y -= 0.06 + (portrait ? dist * 0.1 : 0)
      if (end > 0) _look.lerp(summit, end).y -= 0.25 * end
    }

    const k = first.current || still() ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 2.6)
    first.current = false
    camera.position.lerp(_pos, k)
    look.current.lerp(_look, k)
    camera.lookAt(look.current)
  })
  return null
}

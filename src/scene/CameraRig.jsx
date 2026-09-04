import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointAt } from '../lib/paths'
import { useStore, useMountain } from '../store'

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const _pos = new THREE.Vector3(), _look = new THREE.Vector3(), _r = new THREE.Vector3(), _a = new THREE.Vector3(), _v = new THREE.Vector3()

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
  const mid = pointAt(path, 0.5)
  // look from the side the route faces: direction from summit towards the base, flattened
  _v.set(base.x - summit.x, 0, base.z - summit.z).normalize()
  const dist = Math.max(4.2, path.length * 0.85) * far
  const pos = new THREE.Vector3(mid.x + _v.x * dist, mid.y + dist * 0.42, mid.z + _v.z * dist)
  const ground = terrain.heightAtScene(pos.x, pos.z) / 1000 + 0.3
  if (pos.y < ground) pos.y = ground
  return { pos, target: new THREE.Vector3(mid.x, mid.y + 0.2 - drop, mid.z) }
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
      if (!spin.current.dragging) return
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
  useEffect(() => { gl.domElement.style.touchAction = mode === 'hero' ? 'pan-y' : 'none' }, [gl, mode])

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
        f.t = Math.min(1, f.t + d / 1.6)
        const e = 1 - Math.pow(1 - f.t, 3)
        const k = Math.min(1, d * (2.5 + e * 3))
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
      if (idle && !sp.dragging) sp.auto += Math.min(dt, 0.1) * (reduced ? 0.02 : 0.07)
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
      pointAt(path, Math.min(p + 0.05, 1), _a)
      // view from the side of the mountain this route climbs: direction summit → base, swinging as we rise
      const b = path.points[0]
      const baseAng = Math.atan2(b.x - summit.x, b.z - summit.z)
      const ang = baseAng + THREE.MathUtils.lerp(0.28, -0.32, p)
      const end = p > 0.96 ? (p - 0.96) * 25 : 0
      const dist = THREE.MathUtils.lerp(1.6, 1.05, p) * (1 + end * 1.6) * far
      const lift = THREE.MathUtils.lerp(0.42, 0.2, p) * (1 + end * 1.2) * far
      _pos.set(_r.x + Math.sin(ang) * dist, _r.y + lift, _r.z + Math.cos(ang) * dist)
      const ground = terrain.heightAtScene(_pos.x, _pos.z) / 1000 + 0.12
      if (_pos.y < ground) _pos.y = ground
      // aim slightly below the point ahead so the slope fills the frame
      _look.copy(_a).y -= 0.06
      if (end > 0) _look.lerp(summit, end).y -= 0.25 * end
    }

    const k = first.current ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 2.6)
    first.current = false
    camera.position.lerp(_pos, k)
    look.current.lerp(_look, k)
    camera.lookAt(look.current)
  })
  return null
}

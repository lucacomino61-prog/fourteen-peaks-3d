import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Terrain from './Terrain'
import Routes, { buildPaths } from './Routes'
import Camps from './Camps'
import Hazards from './Hazards'
import CameraRig from './CameraRig'
import { loadTerrain } from '../lib/terrain'
import { useStore, MountainCtx } from '../store'
import { byId } from '../data'

export function useTerrain(id) {
  const [state, setState] = useState({ terrain: null, loading: true })
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    loadTerrain(id, (full) => { if (alive) setState({ terrain: full, loading: false }) })
      .then((t) => { if (alive) setState({ terrain: t, loading: false }) })
    return () => { alive = false }
  }, [id])
  return state
}

/** Decide the quality tier once, before the canvas exists, with a throwaway context. */
function probeQuality() {
  const narrow = window.innerWidth < 800
  const weak = (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2
  if (narrow || weak) return 'low'
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    const dbg = gl?.getExtension('WEBGL_debug_renderer_info')
    const r = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ''
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    if (/SwiftShader|Software|llvmpipe|Basic Render/i.test(r)) return 'low'
    if (/Intel.*(HD|UHD|Iris)|Mali|Adreno|Apple GPU/i.test(r) && !/Iris Xe|Arc/i.test(r)) return 'medium'
  } catch {}
  return 'high'
}

export default function Scene({ terrain }) {
  const controls = useRef()
  const [touched, setTouched] = useState(false)
  const mode = useStore((s) => s.mode)
  const flying = useStore((s) => s.flying)
  const terrainReady = useStore((s) => s.terrainReady)
  const set = useStore((s) => s.set)
  const mountain = byId[terrain.id]
  const { routes, peak } = mountain
  const paths = useMemo(() => buildPaths(terrain, routes), [terrain, routes])
  const summit = useMemo(() => terrain.snapToPeak(peak.lat, peak.lon), [terrain, peak])
  useEffect(() => { set({ paths }) }, [paths, set])
  // tier is decided synchronously on first render so the terrain compiles exactly once
  const [tier] = useState(() => { const q = probeQuality(); useStore.setState({ quality: q }); return q })

  return (
    <Canvas
      dpr={[1, tier === 'high' ? 1.75 : 1]}
      gl={{ antialias: true, powerPreference: 'high-performance', stencil: false, alpha: true }}
      camera={{ position: [summit.x + 4, summit.y + 1, summit.z + 6], fov: 40, near: 0.05, far: 120 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 0)
        // allow the browser to restore a lost context instead of leaving a dead canvas
        gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false)
      }}
      style={{ pointerEvents: mode === 'explorer' || mode === 'hero' ? 'auto' : 'none' }}
      onPointerMissed={() => set({ selected: null })}
    >
      <MountainCtx.Provider value={mountain}>
        <Suspense fallback={null}>
          <Terrain key={terrain.id} terrain={terrain} quality={tier} />
          <group visible={terrainReady}>
            <Routes paths={paths} />
            <Camps terrain={terrain} />
            <Hazards terrain={terrain} />
          </group>
        </Suspense>
        <CameraRig terrain={terrain} paths={paths} controls={controls} />
      </MountainCtx.Provider>
      <OrbitControls
        ref={controls}
        enabled={mode === 'explorer'}
        autoRotate={mode === 'explorer' && !touched && !flying}
        autoRotateSpeed={0.35}
        onStart={() => setTouched(true)}
        minDistance={0.6}
        maxDistance={30}
        maxPolarAngle={Math.PI * 0.485}
        enableDamping
        dampingFactor={0.07}
        zoomSpeed={0.8}
        rotateSpeed={0.6}
      />
    </Canvas>
  )
}

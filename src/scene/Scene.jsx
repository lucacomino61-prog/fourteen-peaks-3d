import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import Terrain from './Terrain'
import Routes from './Routes'
import Camps from './Camps'
import Hazards from './Hazards'
import CameraRig from './CameraRig'
import Declutter from './Declutter'
import Resolution from './Resolution'
import { buildPaths } from '../lib/paths'
import { quality, multisample } from '../lib/quality'
import { useStore, MountainCtx } from '../store'
import { byId } from '../data'

/**
 * Keeps the route and hazard lines' two shader programs alive. drei's <Line> disposes its material
 * whenever its points change, which every line does when the full terrain replaces the first-paint
 * one; three deletes a program no material uses, so the next frame compiled both line shaders
 * again on the main thread. These two lines never change and are never drawn, so the programs stay.
 */
function LinePrograms() {
  const points = useMemo(() => [[0, -50, 0], [0, -50, 0.01]], [])
  return (
    <group visible={false}>
      <Line points={points} transparent depthWrite={false} />
      <Line points={points} transparent depthWrite={false} dashed />
    </group>
  )
}

export default function Scene({ terrain }) {
  const controls = useRef()
  const [touched, setTouched] = useState(false)
  const mode = useStore((s) => s.mode)
  const flying = useStore((s) => s.flying)
  const terrainReady = useStore((s) => s.terrainReady)
  const motion = useStore((s) => s.motion)
  const loupeHold = useStore((s) => s.loupeHold)
  const dpr = useStore((s) => s.dpr)
  const set = useStore((s) => s.set)
  const mountain = byId[terrain.id]
  const { routes, peak } = mountain
  const paths = useMemo(() => buildPaths(terrain, routes), [terrain, routes])
  const summit = useMemo(() => terrain.snapToPeak(peak.lat, peak.lon), [terrain, peak])
  useEffect(() => { set({ paths }) }, [paths, set])
  // tier is decided synchronously on first render so the terrain compiles once; only a GPU that
  // can't keep up even at half resolution gets it changed, to the lightest (<Resolution>)
  const [tier, setTier] = useState(() => { const q = quality(); useStore.setState({ quality: q }); return q })
  const struggled = useRef(false)
  const struggle = () => {
    if (tier === 'low') return
    struggled.current = true
    useStore.setState({ quality: 'low' })
    setTier('low')
  }
  // the battery saver (settings) switches to the light tier and back, at once; a GPU that already
  // needed the rescue stays light
  const saver = useStore((s) => s.settings.saver)
  const firstSaver = useRef(saver)
  useEffect(() => {
    if (saver === firstSaver.current) return
    firstSaver.current = null
    const q = struggled.current ? 'low' : quality()
    useStore.setState({ quality: q })
    setTier(q)
  }, [saver])
  // bumped when a lost WebGL context comes back: the terrain remounts and sends its textures again
  // (it frees their CPU copies once they are on the GPU)
  const [glEpoch, setGlEpoch] = useState(0)

  return (
    <Canvas
      // rendered from GSAP's ticker (lib/clock.js), the one animation clock
      frameloop="never"
      dpr={dpr} // steered per screen and per frame time by <Resolution>, through the store
      // multisampling only where the GPU makes it cheap (lib/quality.js); elsewhere the resolution
      // steering (<Resolution>) spends those milliseconds on more pixels
      gl={{ antialias: multisample(), powerPreference: 'high-performance', stencil: false, alpha: true }}
      camera={{ position: [summit.x + 4, summit.y + 1, summit.z + 6], fov: 40, near: 0.05, far: 120 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 0)
        // allow the browser to restore a lost context instead of leaving a dead canvas
        gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false)
        gl.domElement.addEventListener('webglcontextrestored', () => setGlEpoch((n) => n + 1), false)
      }}
      style={{ pointerEvents: mode === 'explorer' || mode === 'hero' ? 'auto' : 'none' }}
      onPointerMissed={() => set({ selected: null })}
    >
      <MountainCtx.Provider value={mountain}>
        <LinePrograms />
        <Suspense fallback={null}>
          <Terrain key={`${terrain.id}:${glEpoch}`} terrain={terrain} quality={tier} />
          <group visible={terrainReady}>
            <Routes paths={paths} />
            <Camps terrain={terrain} />
            <Hazards terrain={terrain} />
          </group>
        </Suspense>
        <CameraRig terrain={terrain} paths={paths} controls={controls} />
        <Declutter />
        <Resolution tier={tier} onStruggle={struggle} />
      </MountainCtx.Provider>
      <OrbitControls
        ref={controls}
        enabled={mode === 'explorer' && !loupeHold}
        autoRotate={mode === 'explorer' && !touched && !flying && motion === 'on'}
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

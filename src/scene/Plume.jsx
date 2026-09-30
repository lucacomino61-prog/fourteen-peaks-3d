import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore, useMountain } from '../store'
import { light } from '../lib/light'

// The summit's snow plume, blown the way the forecast says the wind blows (lib/weather.js): only
// once the visitor has asked for the summit weather, and only when it blows hard enough to lift
// snow. Soft billboards drawn entirely by the GPU (one draw call, no work per frame on the main
// thread beyond a few uniforms): each one rides downwind from the summit, spreading and sinking a
// little into the lee, lit by the scene's sun. Stopped animations freeze it where it is; the
// battery saver leaves it out.

const COUNT = 64
const MIN_KMH = 15

const vert = /* glsl */ `
attribute vec2 corner;
attribute float seed;
uniform float uTime;
uniform float uRate;
uniform vec3 uOrigin;
uniform vec3 uDir;
uniform float uLength;
varying vec2 vCorner;
varying float vFade;
varying float vSeed;
float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
void main() {
  float age = fract(uTime * uRate + seed);
  float d = age * uLength;
  vec3 side = normalize(cross(uDir, vec3(0.0, 1.0, 0.0)));
  float spread = (hash(seed * 7.1) - 0.5) * (0.04 + 0.26 * age) * uLength;
  float wave = sin(uTime * 0.9 + seed * 31.0) * 0.03 * age * uLength;
  vec3 c = uOrigin + uDir * d + side * (spread + wave);
  c.y += (hash(seed * 3.7) - 0.4) * 0.06 * age * uLength - 0.1 * pow(age, 1.6) * uLength;
  float size = (0.04 + 0.16 * age) * uLength * (0.7 + 0.6 * hash(seed * 5.3));
  // a billboard facing the camera, drawn out along the wind as it crosses the screen: a streak
  vec4 mv = modelViewMatrix * vec4(c, 1.0);
  vec2 along = (viewMatrix * vec4(uDir, 0.0)).xy;
  along = length(along) > 0.05 ? normalize(along) : vec2(1.0, 0.0);
  vec2 across = vec2(-along.y, along.x);
  mv.xy += along * corner.x * size * 2.4 + across * corner.y * size * 0.7;
  gl_Position = projectionMatrix * mv;
  vCorner = corner;
  vSeed = seed;
  vFade = smoothstep(0.02, 0.22, age) * (1.0 - smoothstep(0.5, 1.0, age));
}
`

const frag = /* glsl */ `
precision highp float;
uniform float uStrength;
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uNight;
varying vec2 vCorner;
varying float vFade;
varying float vSeed;
float h21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
void main() {
  float r = length(vCorner);
  if (r > 1.0) discard;
  float soft = pow(1.0 - r * r, 2.0);
  // streaks: noise stretched along the wind (x), finer across it (y)
  vec2 q = vec2(vCorner.x * 0.9, vCorner.y * 3.2) + vec2(vSeed * 17.0 - uTime * 0.25, vSeed * 5.0);
  float wisps = 0.5 * vn(q * 2.0) + 0.3 * vn(q * 4.7) + 0.2 * vn(q * 10.3);
  float a = soft * smoothstep(0.3, 0.85, wisps) * vFade * uStrength * 0.3;
  // blown snow: white where the sun reaches it, with only a touch of its colour, bluish in its
  // own shade; dim and cold at night
  float lit = clamp(0.5 + 0.5 * uSunDir.y + 0.3 * (1.0 - r), 0.0, 1.0);
  vec3 sun = mix(vec3(1.0), min(uSunColor / 2.4, vec3(1.0)), 0.3);
  vec3 col = mix(vec3(0.66, 0.73, 0.86), sun, lit);
  col = mix(col, vec3(0.35, 0.42, 0.6), uNight);
  gl_FragColor = vec4(col, a * (1.0 - 0.6 * uNight));
}
`

export default function Plume({ terrain }) {
  const { peak, id } = useMountain()
  const weather = useStore((s) => s.weather)
  const mode = useStore((s) => s.mode)
  const saver = useStore((s) => s.settings.saver)
  const w = weather?.id === id && weather.status === 'ready' ? weather.now : null
  const show = !!w && w.wind >= MIN_KMH && !saver && (mode === 'hero' || mode === 'explorer')
  const summit = useMemo(() => terrain.snapToPeak(peak.lat, peak.lon), [terrain, peak])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const corner = new Float32Array(COUNT * 8), seed = new Float32Array(COUNT * 4), pos = new Float32Array(COUNT * 12)
    const index = new Uint16Array(COUNT * 6)
    for (let i = 0; i < COUNT; i++) {
      corner.set([-1, -1, 1, -1, 1, 1, -1, 1], i * 8)
      const s = (i + 0.5) / COUNT
      seed.set([s, s, s, s], i * 4)
      index.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6)
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)) // unused (placed by the shader)
    g.setAttribute('corner', new THREE.BufferAttribute(corner, 2))
    g.setAttribute('seed', new THREE.BufferAttribute(seed, 1))
    g.setIndex(new THREE.BufferAttribute(index, 1))
    return g
  }, [])

  // the material is made once (args); the frame loop writes its uniforms through the ref
  const params = useMemo(() => ({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, depthTest: true,
    uniforms: {
      uTime: { value: 0 }, uRate: { value: 0.1 }, uOrigin: { value: new THREE.Vector3() }, uDir: { value: new THREE.Vector3(1, 0, 0) },
      uLength: { value: 1 }, uStrength: { value: 0 }, uSunDir: { value: new THREE.Vector3() }, uSunColor: { value: new THREE.Color() }, uNight: { value: 0 },
    },
  }), [])

  const mesh = useRef()
  const mat = useRef()
  const fade = useRef(0)
  const time = useRef(0) // the plume's own time: it stands still with the animations
  useFrame((_, dt) => {
    const still = useStore.getState().motion === 'off'
    fade.current += ((show ? 1 : 0) - fade.current) * (still ? 1 : Math.min(1, dt * 1.5))
    if (mesh.current) mesh.current.visible = fade.current > 0.01
    const u = mat.current?.uniforms
    if (!w || !u || fade.current <= 0.01) return
    if (!still) time.current += Math.min(dt, 0.1)
    u.uTime.value = time.current
    // downwind: the forecast gives where the wind comes from (clockwise from north; north is -z)
    const to = ((w.dir + 180) * Math.PI) / 180
    u.uDir.value.set(Math.sin(to), 0, -Math.cos(to))
    u.uLength.value = Math.min(2.6, Math.max(0.5, 0.3 + w.wind * 0.022))
    u.uRate.value = (0.06 * w.wind) / 60 / u.uLength.value * 2.2
    u.uStrength.value = THREE.MathUtils.smoothstep(w.wind, MIN_KMH, 45) * fade.current
    u.uOrigin.value.set(summit.x, summit.y - 0.02, summit.z).addScaledVector(u.uDir.value, 0.03)
    u.uSunDir.value.copy(light.dir)
    u.uSunColor.value.copy(light.color)
    u.uNight.value = light.night
  })

  if (!w) return null
  return (
    <mesh ref={mesh} geometry={geometry} frustumCulled={false} renderOrder={5} visible={false}>
      <shaderMaterial ref={mat} args={[params]} />
    </mesh>
  )
}

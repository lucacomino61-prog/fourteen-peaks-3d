import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useLoader, useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../store'

const common = /* glsl */ `
uniform sampler2D uHeight;
uniform vec2  uTexel;
uniform vec2  uSpacing;
uniform vec4  uPatchRect;   // base-uv rect covered by the dense inner patch
float H(vec2 uv) { return texture2D(uHeight, uv).r * 0.001; }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x), mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
}
// inside-patch weight with a soft rim
float patchWeight(vec2 uv) {
  vec2 d = (uv - uPatchRect.xy) / (uPatchRect.zw - uPatchRect.xy);
  vec2 m = smoothstep(0.0, 0.04, d) * smoothstep(0.0, 0.04, 1.0 - d);
  return clamp(m.x * m.y, 0.0, 1.0);
}
// micro-relief on steep ground: the DEM is 30 m, rock is not smooth at 8 m
float microRelief(vec2 uv) {
  float hl = H(uv - vec2(uTexel.x, 0.0)), hr = H(uv + vec2(uTexel.x, 0.0));
  float hs = H(uv - vec2(0.0, uTexel.y)), hn = H(uv + vec2(0.0, uTexel.y));
  float slope = length(vec2(hr - hl, hn - hs)) / (2.0 * uSpacing.x);
  float rock = smoothstep(0.5, 1.2, slope);
  float n = vnoise(uv * 2600.0) * 0.6 + vnoise(uv * 7000.0) * 0.4 - 0.5;
  return n * 0.005 * rock;
}
`

const vert = /* glsl */ `
${common}
varying vec2 vUv;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vec3 p = position;
  p.y = H(uv) + microRelief(uv);
#ifndef PATCH
  // sink the coarse mesh under the dense patch so the patch always wins
  p.y -= 0.035 * patchWeight(uv);
#endif
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const frag = /* glsl */ `
precision highp float;
${common}
uniform sampler2D uAlbedo;
uniform sampler2D uDetail;
uniform vec4  uDetailRect;
uniform float uDetailOn;
uniform sampler2D uDetail2;
uniform vec4  uDetail2Rect;
uniform float uDetail2On;
uniform vec2  uSize;
uniform vec3  uSunDir;
uniform vec3  uSunColor;
uniform vec3  uSkyColor;
uniform vec3  uGroundColor;
uniform vec3  uFogColor;
uniform float uFogDensity;
uniform float uFogHeight;
uniform float uFogFalloff;
uniform vec3  uCamPos;
uniform float uExposure;
uniform float uTime;
uniform float uBandAlt;
uniform float uBandStrength;
varying vec2 vUv;
varying vec3 vWorldPos;

float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

// layered imagery: base → z16 → z17, tone-matched so captures don't seam
vec3 sampleAlbedo(vec2 uv, float dist, out float bump) {
  vec3 col = texture2D(uAlbedo, uv).rgb;
  bump = 0.0;
#ifdef HAS_DETAIL
  {
    vec2 duv = (uv - uDetailRect.xy) / (uDetailRect.zw - uDetailRect.xy);
    vec2 m = smoothstep(0.0, 0.1, duv) * smoothstep(0.0, 0.1, 1.0 - duv);
    float w = clamp(m.x * m.y, 0.0, 1.0) * uDetailOn;
    if (w > 0.001) {
      vec3 det = texture2D(uDetail, duv).rgb;
      det *= mix(1.0, lum(col) / max(lum(det), 0.02), 0.35);
      col = mix(col, det, w);
    }
  }
#endif
#ifdef HAS_DETAIL2
  {
    vec2 duv = (uv - uDetail2Rect.xy) / (uDetail2Rect.zw - uDetail2Rect.xy);
    vec2 m = smoothstep(0.0, 0.12, duv) * smoothstep(0.0, 0.12, 1.0 - duv);
    float w = clamp(m.x * m.y, 0.0, 1.0) * uDetail2On;
    if (w > 0.001) {
      vec3 det = texture2D(uDetail2, duv).rgb;
      det *= mix(1.0, lum(col) / max(lum(det), 0.02), 0.35);
      col = mix(col, det, w);
      // close-range bump from the finest imagery: bright snow up, dark rock down
      float near = 1.0 - smoothstep(0.6, 4.0, dist);
      if (near > 0.001) {
        vec2 t = vec2(1.0 / 4096.0);
        float l0 = lum(texture2D(uDetail2, duv - vec2(t.x, 0.0)).rgb), l1 = lum(texture2D(uDetail2, duv + vec2(t.x, 0.0)).rgb);
        float l2 = lum(texture2D(uDetail2, duv - vec2(0.0, t.y)).rgb), l3 = lum(texture2D(uDetail2, duv + vec2(0.0, t.y)).rgb);
        bump = ((l1 - l0) + (l3 - l2)) * 0.5 * near * w;
      }
    }
  }
#endif
  float near = 1.0 - smoothstep(0.8, 5.0, dist);
  if (near > 0.001) {
    float g = vnoise(uv * 5000.0) * 0.6 + vnoise(uv * 21000.0) * 0.4;
    col *= 1.0 + (g - 0.5) * 0.2 * near;
  }
  return col;
}

vec3 getNormal(float bump, float dist) {
  float hl = H(vUv - vec2(uTexel.x, 0.0)), hr = H(vUv + vec2(uTexel.x, 0.0));
  float hs = H(vUv - vec2(0.0, uTexel.y)), hn = H(vUv + vec2(0.0, uTexel.y));
  float dhdx = (hr - hl) / (2.0 * uSpacing.x);
  float dhdn = (hn - hs) / (2.0 * uSpacing.y);
  // micro-relief gradient from the same noise the vertex shader displaces with (ALU only, no fetches)
  float near = 1.0 - smoothstep(2.0, 9.0, dist);
  if (near > 0.001) {
    float slope = length(vec2(dhdx, dhdn));
    float rock = smoothstep(0.5, 1.2, slope) * near;
    vec2 e = vec2(0.00012, 0.0);
    float nl = vnoise((vUv - e.xy) * 2600.0) * 0.6 + vnoise((vUv - e.xy) * 7000.0) * 0.4;
    float nr = vnoise((vUv + e.xy) * 2600.0) * 0.6 + vnoise((vUv + e.xy) * 7000.0) * 0.4;
    float ns = vnoise((vUv - e.yx) * 2600.0) * 0.6 + vnoise((vUv - e.yx) * 7000.0) * 0.4;
    float nn = vnoise((vUv + e.yx) * 2600.0) * 0.6 + vnoise((vUv + e.yx) * 7000.0) * 0.4;
    float amp = 0.005 * rock / (2.0 * e.x * uSize.x);
    dhdx += (nr - nl) * amp;
    dhdn += (nn - ns) * amp;
  }
  dhdx -= bump * 6.0;
  dhdn += bump * 6.0;
  return normalize(vec3(-dhdx, 1.0, dhdn));
}

// Sun shadow and ambient occlusion are baked per mountain (scripts/bake-light.mjs)
uniform sampler2D uLight;

void main() {
  float camDist = distance(vWorldPos, uCamPos);
  float bump;
  vec3 albedo = sampleAlbedo(vUv, camDist, bump);
  albedo = pow(albedo, vec3(2.2));

  vec3 n = getNormal(bump, camDist);
  float ndl = max(dot(n, uSunDir), 0.0);
  vec2 light = texture2D(uLight, vUv).rg;
  float shadow = light.r;
  float ao = light.g;

  float hemi = n.y * 0.5 + 0.5;
  vec3 ambient = mix(uGroundColor, uSkyColor, hemi) * (0.35 + 0.65 * ao);
  float snowiness = smoothstep(0.55, 0.85, dot(albedo, vec3(0.333)));
  ambient *= 1.0 + snowiness * 0.35;

  vec3 col = albedo * (uSunColor * ndl * shadow + ambient);

  vec3 v = normalize(uCamPos - vWorldPos);
  vec3 hv = normalize(uSunDir + v);
  float spec = pow(max(dot(n, hv), 0.0), 24.0) * snowiness * shadow * 0.25;
  col += uSunColor * spec;

  col = mix(col, col * vec3(0.78, 0.86, 1.15), (1.0 - ndl * shadow) * 0.6);

  float valley = exp(-max(vWorldPos.y - uFogHeight, 0.0) * uFogFalloff);
  float fog = 1.0 - exp(-camDist * uFogDensity * (0.3 + 0.7 * valley));
  col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));
  float horizon = smoothstep(11.0, 19.0, camDist);

  if (uBandStrength > 0.001) {
    float hh = texture2D(uHeight, vUv).r * 0.001;
    float band = smoothstep(uBandAlt - 0.02, uBandAlt + 0.02, hh);
    float edge = 1.0 - smoothstep(0.0, 0.014, abs(hh - uBandAlt));
    vec3 tint = col * vec3(1.35, 0.42, 0.38) + vec3(0.10, 0.0, 0.0);
    col = mix(col, tint, band * uBandStrength * 0.8);
    col += vec3(0.9, 0.15, 0.1) * edge * uBandStrength * (0.6 + 0.4 * sin(uTime * 2.0));
  }

  col = vec3(1.0) - exp(-col * uExposure);
  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col, 1.0 - horizon);
}
`

export const SUN_DIR = new THREE.Vector3(-0.62, 0.26, 0.6).normalize()

// texture sets per tier (WebP). First paint always uses the 1K albedo, then the rest streams in.
const TIERS = {
  high: { base: 1024, patch: 1024, albedo: 'albedo.webp', detail: 'detail16.webp', detail2: 'detail17.webp' },
  medium: { base: 512, patch: 768, albedo: 'albedo-2k.webp', detail: 'detail16-2k.webp', detail2: 'detail17.webp' },
  low: { base: 320, patch: 384, albedo: 'albedo-2k.webp', detail: null, detail2: null },
}

function prepTexture(t) {
  t.colorSpace = THREE.NoColorSpace
  t.anisotropy = 8
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.needsUpdate = true
  return t
}

function rectGeometry(geo, rect, seg) {
  // plane covering a base-uv rect, uvs remapped to base uv so the same heightmap/albedo work
  const a = geo.uvToScene(rect.u0, rect.v0), b = geo.uvToScene(rect.u1, rect.v1)
  const w = Math.abs(b.x - a.x), h = Math.abs(b.z - a.z)
  const g = new THREE.PlaneGeometry(w, h, seg, seg)
  g.rotateX(-Math.PI / 2)
  g.translate((a.x + b.x) / 2, 0, (a.z + b.z) / 2)
  const uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, rect.u0 + uv.getX(i) * (rect.u1 - rect.u0), rect.v0 + uv.getY(i) * (rect.v1 - rect.v0))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3((a.x + b.x) / 2, 7, (a.z + b.z) / 2), Math.hypot(w, h))
  return g
}

const HIDDEN_LAYER = 31

/** ms since navigation for each loading stage of a mountain (read with ?debug=1 or window.__k2perf) */
export function perfSummary(id) {
  const out = {}
  for (const m of performance.getEntriesByType('mark')) if (m.name.endsWith(':' + id)) out[m.name.replace(':' + id, '')] = Math.round(m.startTime)
  return out
}
if (typeof window !== 'undefined') window.__k2perf = perfSummary

export default function Terrain({ terrain, quality = 'high' }) {
  const tier = TIERS[quality] || TIERS.high
  const { gl, camera } = useThree()
  const hasDetail = !!terrain.detail && !!tier.detail
  const hasDetail2 = !!terrain.detail2 && !!tier.detail2
  // first paint: the 1K albedo (≈ 300 KB), loaded through suspense
  const first = useLoader(THREE.TextureLoader, terrain.base + 'albedo-1k.webp')
  const { geo, heightTexture } = terrain
  const patchRect = terrain.detail?.uv || { u0: 0.25, v0: 0.45, u1: 0.55, v1: 0.75 }
  const group = useRef()
  const [compiled, setCompiled] = useState(false)

  const baseGeometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(geo.sizeX, geo.sizeZ, tier.base, tier.base)
    g.rotateX(-Math.PI / 2)
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 6, 0), Math.hypot(geo.sizeX, geo.sizeZ))
    return g
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terrain.id, tier])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const patchGeometry = useMemo(() => rectGeometry(geo, patchRect, tier.patch), [terrain.id, tier])

  const uniforms = useMemo(() => {
    prepTexture(first)
    const d = terrain.detail?.uv, d2 = terrain.detail2?.uv
    const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1)
    white.needsUpdate = true
    return {
      uLight: { value: white },
      uHeight: { value: heightTexture },
      uAlbedo: { value: first },
      uDetail: { value: first },
      uDetailRect: { value: d ? new THREE.Vector4(d.u0, d.v0, d.u1, d.v1) : new THREE.Vector4(0, 0, 1, 1) },
      uDetailOn: { value: 0 },
      uDetail2: { value: first },
      uDetail2Rect: { value: d2 ? new THREE.Vector4(d2.u0, d2.v0, d2.u1, d2.v1) : new THREE.Vector4(0, 0, 1, 1) },
      uDetail2On: { value: 0 },
      uPatchRect: { value: new THREE.Vector4(patchRect.u0, patchRect.v0, patchRect.u1, patchRect.v1) },
      uTexel: { value: new THREE.Vector2(1 / geo.W, 1 / geo.H) },
      uSpacing: { value: new THREE.Vector2(geo.sizeX / geo.W, geo.sizeZ / geo.H) },
      uSize: { value: new THREE.Vector2(geo.sizeX, geo.sizeZ) },
      uSunDir: { value: SUN_DIR.clone() },
      uSunColor: { value: new THREE.Color('#ffc99a').multiplyScalar(2.4) },
      uSkyColor: { value: new THREE.Color('#4a63a0').multiplyScalar(0.5) },
      uGroundColor: { value: new THREE.Color('#0a0d18').multiplyScalar(0.4) },
      uFogColor: { value: new THREE.Color('#0f1626') },
      uFogDensity: { value: 0.07 },
      uFogHeight: { value: 5.6 },
      uFogFalloff: { value: 1.1 },
      uCamPos: { value: new THREE.Vector3() },
      uExposure: { value: 0.68 },
      uTime: { value: 0 },
      uBandAlt: { value: 8.0 },
      uBandStrength: { value: 0 },
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, terrain.id])

  useEffect(() => {
    uniforms.uHeight.value = heightTexture
    uniforms.uTexel.value.set(1 / geo.W, 1 / geo.H)
    uniforms.uSpacing.value.set(geo.sizeX / geo.W, geo.sizeZ / geo.H)
  }, [uniforms, heightTexture, geo])

  const materials = useMemo(() => {
    const defines = {}
    if (hasDetail) defines.HAS_DETAIL = 1
    if (hasDetail2) defines.HAS_DETAIL2 = 1
    const mk = (extra) => new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, uniforms, transparent: true, depthWrite: true,
      defines: { ...defines, ...extra },
    })
    return { base: mk({}), patch: mk({ PATCH: 1 }) }
  }, [uniforms, tier, hasDetail, hasDetail2])

  // Compile off the main thread where the driver allows (KHR_parallel_shader_compile), with the
  // meshes parked on a layer the camera does not draw, so the page stays responsive meanwhile.
  useEffect(() => {
    let alive = true
    setCompiled(false)
    const g = group.current
    if (!g) return
    g.traverse((o) => o.layers.set(HIDDEN_LAYER))
    performance.mark(`terrain:compile-start:${terrain.id}`)
    const done = () => { if (!alive) return; g.traverse((o) => o.layers.set(0)); setCompiled(true); performance.mark(`terrain:ready:${terrain.id}`); useStore.setState({ terrainReady: true }); if (location.search.includes('debug')) console.table(perfSummary(terrain.id)) }
    useStore.setState({ terrainReady: false })
    if (gl.compileAsync) gl.compileAsync(g, camera).then(done, done)
    else done()
    return () => { alive = false }
  }, [materials, gl, camera])

  // stream the full-resolution textures in after first paint: albedo → detail → summit detail
  useEffect(() => {
    let alive = true
    const loader = new THREE.TextureLoader()
    const owned = []
    const load = async (file) => {
      let t
      try { t = await loader.loadAsync(terrain.base + file) } catch { return null } // missing layer: keep going
      if (!alive) { t.dispose(); return null }
      owned.push(t)
      return prepTexture(t)
    }
    ;(async () => {
      const l = await load('light.webp')
      if (l) { uniforms.uLight.value = l; performance.mark(`tex:light:${terrain.id}`) }
      const a = await load(tier.albedo)
      if (a) { uniforms.uAlbedo.value = a; performance.mark(`tex:albedo:${terrain.id}`) }
      if (hasDetail) { const d = await load(tier.detail); if (d) { uniforms.uDetail.value = d; uniforms.uDetailOn.value = 1 } }
      if (hasDetail2) { const d = await load(tier.detail2); if (d) { uniforms.uDetail2.value = d; uniforms.uDetail2On.value = 1 } }
    })()
    return () => { alive = false; owned.forEach((t) => t.dispose()) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terrain.id, tier, uniforms, hasDetail, hasDetail2])

  useEffect(() => () => { materials.base.dispose(); materials.patch.dispose(); baseGeometry.dispose(); patchGeometry.dispose() }, [materials, baseGeometry, patchGeometry])

  useFrame(({ camera, clock }, dt) => {
    uniforms.uCamPos.value.copy(camera.position)
    uniforms.uTime.value = clock.elapsedTime
    const want = useStore.getState().showDeathZone ? 1 : 0
    uniforms.uBandStrength.value += (want - uniforms.uBandStrength.value) * Math.min(1, dt * 4)
  })

  return (
    <group ref={group} visible>
      <mesh geometry={baseGeometry} material={materials.base} frustumCulled={false} />
      <mesh geometry={patchGeometry} material={materials.patch} frustumCulled={false} />
    </group>
  )
}

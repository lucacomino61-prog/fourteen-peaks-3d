import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useLoader, useFrame, useThree } from '@react-three/fiber'
import { useStore, useMountain } from '../store'
import { heightCalibration, modelAltitude, realAltitude } from '../lib/calibrate'
import { loupe, attachLoupe } from '../lib/loupe'
import { fmt } from '../lib/format'
import { NIGHT, SNOW, SIGNAL } from '../lib/palette'

// the site's two colours and its signal, as display values for the contour map
const srgb = (hex) => { const c = parseInt(hex.slice(1), 16); return new THREE.Vector3(((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255) }
const PAPER = srgb(SNOW), INK = srgb(NIGHT), SIGNAL_RGB = srgb(SIGNAL)
const LOUPE_R = 104, LOUPE_R_TOUCH = 88 // CSS px

const common = /* glsl */ `
uniform sampler2D uHeight;
uniform vec2  uTexel;
uniform vec2  uSpacing;
uniform vec4  uPatchRect;   // base-uv rect covered by the dense inner patch
// Heights are a 32-bit float texture. A GPU without OES_texture_float_linear cannot filter it
// (it would read as zero), so there it is sampled nearest and blended here instead.
float H(vec2 uv) {
#ifdef MANUAL_BILINEAR
  vec2 st = uv / uTexel - 0.5;
  vec2 f = fract(st);
  vec2 p = (floor(st) + 0.5) * uTexel;
  float a = texture2D(uHeight, p).r, b = texture2D(uHeight, p + vec2(uTexel.x, 0.0)).r;
  float c = texture2D(uHeight, p + vec2(0.0, uTexel.y)).r, d = texture2D(uHeight, p + uTexel).r;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y) * 0.001;
#else
  return texture2D(uHeight, uv).r * 0.001;
#endif
}
// sin-free hash: the sin() version loses precision on integrated GPUs at these arguments
float hash21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
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
  // the height alone: micro-relief finer than the vertex spacing striped the snow (moiré);
  // it lives in the fragment normals instead (getNormal), faded with distance
  p.y = H(uv);
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
uniform vec3  uLoupe;    // contour loupe: centre in drawing-buffer px (origin bottom-left), radius px; 0 = none
uniform float uMapOn;    // 1 while the loupe or the map layer shows (keeps fwidth in uniform control flow)
uniform float uMapAll;   // 0..1: the whole terrain drawn as the contour map (the explorer's layer)
uniform vec3  uCal;      // height calibration (lib/calibrate.js): gap km, ramp base km, 1 / ramp km
uniform vec3  uPaper;    // snow, display (sRGB) values
uniform vec3  uInk;      // night
uniform vec3  uSignal;   // signal orange
varying vec2 vUv;
varying vec3 vWorldPos;

float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

// corrected altitude (km) for a model altitude: the DEM rounds off the summits
float realH(float h) { return h + uCal.x * clamp((h - uCal.y) * uCal.z, 0.0, 1.0); }

// The contour map, in two colours: snow paper shaded by the relief, ink contours every 100 m and
// index contours every 500 m (each fading out where they would crowd into a fill), and the
// 8,000 m line in the signal colour.
vec3 contourMap(vec3 n) {
  float m = realH(H(vUv)) * 1000.0;
  float c = m / 100.0, w = fwidth(c);
  float minor = (1.0 - smoothstep(0.5, 1.5, abs(fract(c + 0.5) - 0.5) / max(w, 1e-5))) * (1.0 - smoothstep(0.18, 0.4, w));
  float ci = m / 500.0, wi = fwidth(ci);
  float index = (1.0 - smoothstep(0.9, 1.9, abs(fract(ci + 0.5) - 0.5) / max(wi, 1e-5))) * (1.0 - smoothstep(0.2, 0.45, wi));
  float eight = 1.0 - smoothstep(1.0, 2.2, abs(m - 8000.0) / max(fwidth(m), 1e-4));
  float shade = clamp(dot(n, uSunDir), 0.0, 1.0);
  vec3 paper = mix(uInk, uPaper, 0.8 + 0.2 * shade);
  return mix(mix(paper, uInk, max(minor * 0.5, index * 0.9)), uSignal, eight);
}

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
    float hh = H(vUv);
    float band = smoothstep(uBandAlt - 0.02, uBandAlt + 0.02, hh);
    float edge = 1.0 - smoothstep(0.0, 0.014, abs(hh - uBandAlt));
    vec3 tint = col * vec3(1.35, 0.55, 0.36) + vec3(0.10, 0.02, 0.0);
    col = mix(col, tint, band * uBandStrength * 0.8);
    col += vec3(1.0, 0.28, 0.08) * edge * uBandStrength * (0.6 + 0.4 * sin(uTime * 2.0));
  }

  col = vec3(1.0) - exp(-col * uExposure);
  col = pow(col, vec3(1.0 / 2.2));

  if (uMapOn > 0.5) {
    vec3 mapCol = contourMap(n);
    float lm = uMapAll;
    if (uLoupe.z > 0.0) lm = max(lm, 1.0 - smoothstep(uLoupe.z - 1.0, uLoupe.z + 0.5, distance(gl_FragCoord.xy, uLoupe.xy)));
    col = mix(col, mapCol, lm);
  }
  gl_FragColor = vec4(col, 1.0 - horizon);
}
`

const SUN_DIR = new THREE.Vector3(-0.62, 0.26, 0.6).normalize()

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

/** Nearest sampling for a float heightmap on GPUs that cannot filter it; the shader blends instead. */
function nearestHeights(tex) {
  if (tex.magFilter === THREE.NearestFilter) return
  tex.magFilter = tex.minFilter = THREE.NearestFilter
  tex.needsUpdate = true
}

const HIDDEN_LAYER = 31

/** ms since navigation for each loading stage of a mountain (read with ?debug=1 or window.__k2perf) */
function perfSummary(id) {
  const out = {}
  for (const m of performance.getEntriesByType('mark')) if (m.name.endsWith(':' + id)) out[m.name.replace(':' + id, '')] = Math.round(m.startTime)
  return out
}
if (typeof window !== 'undefined') window.__k2perf = perfSummary

export default function Terrain({ terrain, quality = 'high' }) {
  const tier = TIERS[quality] || TIERS.high
  const { gl, camera } = useThree()
  const { peak } = useMountain()
  const hasDetail = !!terrain.detail && !!tier.detail
  const hasDetail2 = !!terrain.detail2 && !!tier.detail2
  const floatLinear = useMemo(() => gl.extensions.has('OES_texture_float_linear'), [gl])
  // the model's summit sits below the surveyed one: the 8,000 m line moves down with it, and the
  // loupe's contours and read-out are corrected by the same ramp
  const cal = useMemo(() => heightCalibration(terrain, peak), [terrain, peak])
  const bandAlt = modelAltitude(8000, cal)
  // first paint: the 1K albedo (≈ 300 KB), loaded through suspense
  const first = useLoader(THREE.TextureLoader, terrain.base + 'albedo-1k.webp')
  const { geo, heightTexture } = terrain
  const patchRect = terrain.detail?.uv || { u0: 0.25, v0: 0.45, u1: 0.55, v1: 0.75 }
  const group = useRef()

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
      uLoupe: { value: new THREE.Vector3() },
      uMapOn: { value: 0 },
      uMapAll: { value: 0 },
      uCal: { value: new THREE.Vector3(0, 0, 1) },
      uPaper: { value: PAPER },
      uInk: { value: INK },
      uSignal: { value: SIGNAL_RGB },
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, terrain.id])

  // before the first frame with this heightmap (the 512² one, then the full one)
  useLayoutEffect(() => {
    if (!floatLinear) nearestHeights(heightTexture)
    uniforms.uHeight.value = heightTexture
    uniforms.uTexel.value.set(1 / geo.W, 1 / geo.H)
    uniforms.uSpacing.value.set(geo.sizeX / geo.W, geo.sizeZ / geo.H)
    uniforms.uBandAlt.value = bandAlt / 1000
    uniforms.uCal.value.set(cal.gapM / 1000, cal.baseM / 1000, 1000 / cal.rampM)
  }, [uniforms, heightTexture, geo, floatLinear, bandAlt, cal])

  // the contour loupe follows the pointer over the canvas (lib/loupe.js)
  useEffect(() => attachLoupe(gl.domElement), [gl])

  const materials = useMemo(() => {
    const defines = {}
    if (hasDetail) defines.HAS_DETAIL = 1
    if (hasDetail2) defines.HAS_DETAIL2 = 1
    if (!floatLinear) defines.MANUAL_BILINEAR = 1
    const mk = (extra) => new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, uniforms, transparent: true, depthWrite: true,
      defines: { ...defines, ...extra },
    })
    return { base: mk({}), patch: mk({ PATCH: 1 }) }
  }, [uniforms, hasDetail, hasDetail2, floatLinear])

  // Compile off the main thread where the driver allows (KHR_parallel_shader_compile), with the
  // meshes parked on a layer the camera does not draw, so the page stays responsive meanwhile.
  useEffect(() => {
    let alive = true
    const g = group.current
    if (!g) return
    g.traverse((o) => o.layers.set(HIDDEN_LAYER))
    performance.mark(`terrain:compile-start:${terrain.id}`)
    const done = () => { if (!alive) return; g.traverse((o) => o.layers.set(0)); performance.mark(`terrain:ready:${terrain.id}`); useStore.setState({ terrainReady: true }); if (location.search.includes('debug')) console.table(perfSummary(terrain.id)) }
    useStore.setState({ terrainReady: false })
    if (gl.compileAsync) gl.compileAsync(g, camera).then(done, done)
    else done()
    return () => { alive = false }
  }, [materials, gl, camera, terrain.id])

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

  const ndc = useMemo(() => new THREE.Vector2(), [])
  const ray = useMemo(() => new THREE.Raycaster(), [])
  useFrame(({ camera, clock, size }, dt) => {
    const s = useStore.getState()
    const still = s.motion === 'off'
    uniforms.uCamPos.value.copy(camera.position)
    if (!still) uniforms.uTime.value = clock.elapsedTime // the Death Zone edge stops pulsing
    const ease = still ? 1 : Math.min(1, dt * 4)
    uniforms.uBandStrength.value += ((s.showDeathZone ? 1 : 0) - uniforms.uBandStrength.value) * ease
    uniforms.uMapAll.value += ((s.mode === 'explorer' && s.showContours ? 1 : 0) - uniforms.uMapAll.value) * (still ? 1 : Math.min(1, dt * 6))

    // the loupe: cast from the camera through the pointer; nothing under it, no loupe
    let r = 0, hit = null
    if (loupe.active && (s.mode === 'hero' || s.mode === 'explorer')) {
      ndc.set((loupe.x / size.width) * 2 - 1, 1 - (loupe.y / size.height) * 2)
      ray.setFromCamera(ndc, camera)
      hit = terrain.hitTest(ray.ray.origin, ray.ray.direction)
      if (hit) r = loupe.touch ? LOUPE_R_TOUCH : LOUPE_R
    }
    const dpr = gl.getPixelRatio()
    uniforms.uLoupe.value.set(loupe.x * dpr, (size.height - loupe.y) * dpr, r * dpr)
    uniforms.uMapOn.value = r > 0 || uniforms.uMapAll.value > 0.001 ? 1 : 0

    // the ring, the paper disc under the canvas (sky inside the ring reads as blank map paper)
    // and the read-out, all moved in the same frame as the map
    for (const el of [loupe.ring, loupe.paper]) {
      if (!el) continue
      if (r > 0) {
        el.style.setProperty('--r', `${r}px`)
        el.style.transform = `translate3d(${loupe.x}px, ${loupe.y}px, 0)`
        if (el.dataset.on !== '1') el.dataset.on = '1'
      } else if (el.dataset.on !== '0') el.dataset.on = '0'
    }
    if (r > 0 && loupe.read) {
      const alt = Math.round(realAltitude(hit.y * 1000, cal) / 10) * 10
      const { lat, lon } = terrain.geo.toLatLon(hit.x, hit.z)
      const text = `≈ ${fmt(alt)} m · ${lat.toFixed(3)}° N ${lon.toFixed(3)}° E`
      if (loupe.read.textContent !== text) loupe.read.textContent = text
    }
  })

  return (
    <group ref={group} visible>
      <mesh geometry={baseGeometry} material={materials.base} frustumCulled={false} />
      <mesh geometry={patchGeometry} material={materials.patch} frustumCulled={false} />
    </group>
  )
}

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useLoader, useFrame, useThree } from '@react-three/fiber'
import { useStore, useMountain } from '../store'
import { heightCalibration, modelAltitude, realAltitude } from '../lib/calibrate'
import { loupe, attachLoupe } from '../lib/loupe'
import { alt as altitude } from '../lib/units'
import { NIGHT, SNOW, SIGNAL } from '../lib/palette'
import { onTerrainEvicted } from '../lib/terrain'
import { loadPixels } from '../lib/pixels'
import { markBusy } from '../lib/busy'
import { light, DEFAULT_SUN_DIR, DEFAULT_SUN_COLOR } from '../lib/light'
import { sunAt, sunVector, sunLight, momentAt, nowAt } from '../lib/sun'
import { createSunShadow } from './sunShadow'

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
// the gradient of vnoise at p, worked out rather than sampled: one noise evaluation instead of four
vec2 vnoiseGrad(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f), du = 6.0 * f * (1.0 - f);
  float a = hash21(i), b = hash21(i + vec2(1, 0)), c = hash21(i + vec2(0, 1)), d = hash21(i + vec2(1, 1));
  float k = a - b - c + d;
  return du * vec2(b - a + k * u.y, c - a + k * u.x);
}
// inside-patch weight with a soft rim
float patchWeight(vec2 uv) {
  vec2 d = (uv - uPatchRect.xy) / (uPatchRect.zw - uPatchRect.xy);
  vec2 m = smoothstep(0.0, 0.04, d) * smoothstep(0.0, 0.04, 1.0 - d);
  return clamp(m.x * m.y, 0.0, 1.0);
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
  // grain in the imagery close up (6 m and 1.5 m), each octave gone before it is under a pixel
  float near1 = 1.0 - smoothstep(1.5, 4.0, dist), near2 = 1.0 - smoothstep(0.3, 1.2, dist);
  if (near1 > 0.001) {
    float g = (vnoise(uv * 5000.0) - 0.5) * 0.6 * near1;
    if (near2 > 0.001) g += (vnoise(uv * 21000.0) - 0.5) * 0.4 * near2;
    col *= 1.0 + g * 0.2;
  }
  return col;
}

vec3 getNormal(float bump, float dist) {
  float hl = H(vUv - vec2(uTexel.x, 0.0)), hr = H(vUv + vec2(uTexel.x, 0.0));
  float hs = H(vUv - vec2(0.0, uTexel.y)), hn = H(vUv + vec2(0.0, uTexel.y));
  float dhdx = (hr - hl) / (2.0 * uSpacing.x);
  float dhdn = (hn - hs) / (2.0 * uSpacing.y);
  // Micro-relief on steep rock (the DEM is 30 m; rock is not smooth at 5 m): 5 m of noise, as a
  // slope. Each octave fades out before its bumps get smaller than a pixel, where they would only
  // shimmer, and flat snow skips it. (It used to be eight noise evaluations for a finite difference
  // out to 9 km, a quarter of the hero's frame on an integrated GPU.)
  float near1 = 1.0 - smoothstep(3.0, 7.0, dist), near2 = 1.0 - smoothstep(1.0, 3.0, dist);
  if (near1 > 0.001) {
    float rock = smoothstep(0.5, 1.2, length(vec2(dhdx, dhdn)));
    if (rock > 0.001) {
      vec2 g = vnoiseGrad(vUv * 2600.0) * (2600.0 * 0.28 * near1);
      if (near2 > 0.001) g += vnoiseGrad(vUv * 7000.0) * (7000.0 * 0.065 * near2);
      g *= 0.005 * rock / uSize;
      dhdx += g.x;
      dhdn += g.y;
    }
  }
  dhdx -= bump * 6.0;
  dhdn += bump * 6.0;
  return normalize(vec3(-dhdx, 1.0, dhdn));
}

// Sun shadow and ambient occlusion are baked per mountain (scripts/bake-light.mjs), for the usual
// fixed sun; for any other hour the shadows come from the GPU pass (scene/sunShadow.js), blended
// in by uUseRT. uNightColor is the night's cool fill (moon and sky glow), zero by day.
uniform sampler2D uLight;
uniform sampler2D uShadowMap;
uniform float uUseRT;
uniform vec3  uNightColor;

void main() {
  float camDist = distance(vWorldPos, uCamPos);
  float bump;
  vec3 albedo = sampleAlbedo(vUv, camDist, bump);
  albedo = pow(albedo, vec3(2.2));

  vec3 n = getNormal(bump, camDist);
  float ndl = max(dot(n, uSunDir), 0.0);
  vec2 light = texture2D(uLight, vUv).rg;
  float shadow = uUseRT > 0.001 ? mix(light.r, texture2D(uShadowMap, vUv).r, uUseRT) : light.r;
  float ao = light.g;

  float hemi = n.y * 0.5 + 0.5;
  vec3 ambient = mix(uGroundColor, uSkyColor, hemi) * (0.35 + 0.65 * ao);
  float snowiness = smoothstep(0.55, 0.85, dot(albedo, vec3(0.333)));
  ambient *= 1.0 + snowiness * 0.35;

  vec3 col = albedo * (uSunColor * ndl * shadow + ambient);
  // the night's fill: no shadows, from high in the south-east
  col += albedo * uNightColor * (0.35 + 0.65 * max(dot(n, vec3(0.34, 0.83, 0.44)), 0.0)) * (0.5 + 0.5 * ao);

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

// the ambient from above under the usual light, and the night's cool fill at full night
const DEFAULT_SKY = new THREE.Color('#4a63a0').multiplyScalar(0.5)
const NIGHT_FILL = new THREE.Color('#7890c8').multiplyScalar(0.16)

// texture sets per tier (WebP). First paint always uses the 1K albedo, then the rest streams in.
// The summit patch has one vertex per texel of the 2048² heightmap (512 across its 7.9 km, 15.5 m
// apart; the DEM itself is 30 m): its old 768 and 1024 only interpolated between texels, and in the
// wide views those triangles were one or two pixels big, which is what a GPU draws slowest (on an
// integrated GPU a coarser mesh alone halved the hero's frame). The shading is per pixel from the
// heightmap either way, so it looks the same.
const TIERS = {
  high: { base: 1024, patch: 512, albedo: 'albedo.webp', detail: 'detail16.webp', detail2: 'detail17.webp' },
  // integrated GPUs: uploading a 4K texture stalled the page for ~0.7 s, so the summit layer is 2K here
  medium: { base: 512, patch: 512, albedo: 'albedo-2k.webp', detail: 'detail16-2k.webp', detail2: 'detail17-2k.webp' },
  low: { base: 320, patch: 384, albedo: 'albedo-2k.webp', detail: null, detail2: null },
}

// how much of a big texture goes to the GPU per frame (makeUploader)
const BAND_BYTES = { high: 4 << 20, medium: 2 << 20, low: 1 << 20 }

function prepTexture(t) {
  t.colorSpace = THREE.NoColorSpace
  t.anisotropy = 8
  t.magFilter = THREE.LinearFilter // a DataTexture's default is nearest
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.generateMipmaps = true
  t.needsUpdate = true
  return t
}

/**
 * A flat grid over a base-uv rect (the whole tile by default), written straight into typed arrays:
 * PlaneGeometry pushes every value through JS arrays and adds normals this shader never reads,
 * which cost about a quarter of a second for the 768² summit patch. Vertices, uvs and winding are
 * those of a PlaneGeometry laid flat (rotateX(-π/2)); the vertex shader lifts them to the heights.
 */
function gridGeometry(geo, rect, seg, centreY) {
  const n = seg + 1
  const pos = new Float32Array(n * n * 3), uv = new Float32Array(n * n * 2)
  const du = (rect.u1 - rect.u0) / seg, dv = (rect.v1 - rect.v0) / seg
  for (let iy = 0, k = 0; iy < n; iy++) {
    const v = rect.v1 - iy * dv, z = (0.5 - v) * geo.sizeZ // north row first
    for (let ix = 0; ix < n; ix++, k++) {
      const u = rect.u0 + ix * du
      pos[k * 3] = (u - 0.5) * geo.sizeX
      pos[k * 3 + 2] = z
      uv[k * 2] = u
      uv[k * 2 + 1] = v
    }
  }
  const index = new Uint32Array(seg * seg * 6)
  for (let iy = 0, k = 0; iy < seg; iy++)
    for (let ix = 0; ix < seg; ix++) {
      const a = iy * n + ix, b = a + n
      index[k++] = a; index[k++] = b; index[k++] = a + 1
      index[k++] = b; index[k++] = b + 1; index[k++] = a + 1
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.setIndex(new THREE.BufferAttribute(index, 1))
  const c = geo.uvToScene((rect.u0 + rect.u1) / 2, (rect.v0 + rect.v1) / 2)
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(c.x, centreY, c.z), Math.hypot((rect.u1 - rect.u0) * geo.sizeX, (rect.v1 - rect.v0) * geo.sizeZ))
  return g
}
const WHOLE = { u0: 0, v0: 0, u1: 1, v1: 1 }

/**
 * A terrain texture. Decoded in a worker into raw rows (lib/pixels.js), it comes back as a
 * DataTexture that can go to the GPU a band per frame; where workers can't decode, an ImageBitmap
 * (decoded off the main thread, already flipped) or the TextureLoader. Null for a missing file.
 */
async function loadTexture(url) {
  const px = await loadPixels(url)
  if (px?.missing) return null
  if (px) return new THREE.DataTexture(px.data, px.w, px.h, THREE.RGBAFormat, THREE.UnsignedByteType)
  if (typeof createImageBitmap === 'function') {
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      const bitmap = await createImageBitmap(await res.blob(), { imageOrientation: 'flipY', premultiplyAlpha: 'none', colorSpaceConversion: 'none' })
      const t = new THREE.Texture(bitmap)
      t.flipY = false // flipped by the decode
      return t
    } catch { /* fall back below */ }
  }
  return new THREE.TextureLoader().loadAsync(url).catch(() => null)
}
function freeTexture(t) {
  t.dispose()
  if (t.image && typeof t.image.close === 'function') t.image.close() // an ImageBitmap's memory
}

/** The first-paint albedo through useLoader (suspense), decoded the same way. */
class FirstPaintLoader {
  load(url, onLoad, _onProgress, onError) {
    loadTexture(url).then((t) => (t ? onLoad(prepTexture(t)) : onError(new Error('missing'))), onError)
  }
}

// first-paint albedos stay in useLoader's cache: free them when lib/terrain.js lets that mountain go
const firstTextures = new Map()
onTerrainEvicted((id) => {
  const url = `/terrain/${id}/albedo-1k.webp`
  firstTextures.get(url)?.dispose()
  firstTextures.delete(url)
  useLoader.clear(FirstPaintLoader, url)
})

/**
 * Big textures go to the GPU a band of rows per frame (copyTextureToTexture from the CPU rows)
 * instead of in one call: on an integrated GPU one call froze the page for 50–290 ms per 2K
 * texture and about 100 ms for the 16 MB heightmap, longer on a phone. Storage and mip levels are
 * allocated up front, the mipmaps are built once after the last band, and one band goes per frame
 * across the whole queue, oldest texture first. Each band is handed over as its own slice of the
 * rows, not as an offset into the whole image (UNPACK_SKIP_ROWS), which a browser may copy whole.
 */
function makeUploader(gl, bandBytes) {
  const queue = []
  const at = new THREE.Vector2()
  return {
    /** { done, cancel }: done resolves with the texture once it is all on the GPU (null if
     *  cancelled); a texture cut short uploads whole the next time it's drawn. */
    add(tex) {
      const { width, height, data } = tex.image
      const job = { tex, data, width, height, src: new THREE.DataTexture(null, width, 1, tex.format, tex.type), row: 0, mips: tex.generateMipmaps }
      job.rows = Math.max(1, Math.floor(bandBytes / (data.byteLength / height)))
      const done = new Promise((resolve) => { job.resolve = resolve })
      tex.source.dataReady = false
      gl.initTexture(tex) // storage and mip levels now, pixels by the band
      queue.push(job)
      const cancel = () => {
        const i = queue.indexOf(job)
        if (i < 0) return
        queue.splice(i, 1)
        job.src = null
        job.data = null
        tex.generateMipmaps = job.mips
        tex.source.dataReady = true
        tex.needsUpdate = true
        job.resolve(null)
      }
      return { done, cancel }
    },
    /** Sends one band; call once per frame. */
    step() {
      const job = queue[0]
      if (!job) return
      markBusy()
      const { tex, src, data, width, height } = job
      const n = Math.min(job.rows, height - job.row)
      const last = job.row + n >= height
      const perRow = data.length / height
      tex.generateMipmaps = last && job.mips // built once, after the last band
      src.image = { data: data.subarray(job.row * perRow, (job.row + n) * perRow), width, height: n }
      gl.copyTextureToTexture(src, tex, null, at.set(0, job.row))
      job.row += n
      if (!last) return
      queue.shift()
      // cancel() keeps the job: let go of the rows, the texture may drop them too
      job.src = null
      job.data = null
      tex.generateMipmaps = job.mips
      tex.source.dataReady = true
      job.resolve(tex)
    },
  }
}

/** Nearest sampling for a float heightmap on GPUs that cannot filter it; the shader blends instead. */
function nearestHeights(tex) {
  if (tex.magFilter === THREE.NearestFilter) return
  tex.magFilter = tex.minFilter = THREE.NearestFilter
  tex.needsUpdate = true
}

const HIDDEN_LAYER = 31

// heightmaps queued for a whole upload or already on the GPU: the full one (16 MB) streams in by
// the band while the 512² one stays on screen, and is swapped in once it is all there
const heightsOnGpu = new WeakSet()

/**
 * renderer.compileAsync for a scene whose materials can be disposed while it waits (drei's lines
 * rebuild theirs when the full terrain arrives, and three's version then throws and never
 * resolves): resolves once every program still in use has linked, polling without blocking where
 * KHR_parallel_shader_compile allows.
 */
function compileScene(gl, scene, camera) {
  markBusy(1500)
  let pending
  try { pending = gl.compile(scene, camera) } catch { return Promise.resolve() }
  const all = [...pending]
  const giveUp = performance.now() + 10000 // a lost context never reports ready: draw anyway
  return new Promise((resolve) => {
    const check = () => {
      for (const m of pending) {
        const program = gl.properties.get(m).currentProgram
        if (!program || program.isReady()) pending.delete(m)
      }
      if (pending.size && performance.now() < giveUp) {
        setTimeout(check, 10)
        return
      }
      // read each program's uniforms and attributes now (synchronous GL queries) rather than in
      // the first frame that draws it, the frame that reveals the mountain
      for (const m of all) {
        const program = gl.properties.get(m).currentProgram
        try { program?.getUniforms(); program?.getAttributes() } catch { /* drawn and reported by three */ }
      }
      resolve()
    }
    if (gl.extensions.has('KHR_parallel_shader_compile')) check()
    else setTimeout(check, 10)
  })
}

/** ms since navigation for each loading stage of a mountain (read with ?debug=1 or window.__k2perf) */
function perfSummary(id) {
  const out = {}
  for (const m of performance.getEntriesByType('mark')) if (m.name.endsWith(':' + id)) out[m.name.replace(':' + id, '')] = Math.round(m.startTime)
  return out
}
if (typeof window !== 'undefined') window.__k2perf = perfSummary

export default function Terrain({ terrain, quality = 'high' }) {
  const tier = TIERS[quality] || TIERS.high
  const { gl, camera, scene } = useThree()
  const mountain = useMountain()
  const { peak } = mountain
  const hasDetail = !!terrain.detail && !!tier.detail
  const hasDetail2 = !!terrain.detail2 && !!tier.detail2
  const floatLinear = useMemo(() => gl.extensions.has('OES_texture_float_linear'), [gl])
  // the model's summit sits below the surveyed one: the 8,000 m line moves down with it, and the
  // loupe's contours and read-out are corrected by the same ramp
  const cal = useMemo(() => heightCalibration(terrain, peak), [terrain, peak])
  const bandAlt = modelAltitude(8000, cal)
  // first paint: the 1K albedo (≈ 300 KB), loaded through suspense
  const first = useLoader(FirstPaintLoader, terrain.base + 'albedo-1k.webp')
  useEffect(() => { firstTextures.set(terrain.base + 'albedo-1k.webp', first) }, [first, terrain.base])
  const { geo, heightTexture } = terrain
  const patchRect = terrain.detail?.uv || { u0: 0.25, v0: 0.45, u1: 0.55, v1: 0.75 }
  const group = useRef()
  const uploader = useMemo(() => makeUploader(gl, BAND_BYTES[quality] || BAND_BYTES.high), [gl, quality])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const baseGeometry = useMemo(() => gridGeometry(geo, WHOLE, tier.base, 6), [terrain.id, tier])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const patchGeometry = useMemo(() => gridGeometry(geo, patchRect, tier.patch, 7), [terrain.id, tier])

  const uniforms = useMemo(() => {
    prepTexture(first)
    const d = terrain.detail?.uv, d2 = terrain.detail2?.uv
    const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1)
    white.needsUpdate = true
    return {
      uLight: { value: white },
      uShadowMap: { value: white },
      uUseRT: { value: 0 },
      uNightColor: { value: new THREE.Color(0, 0, 0) },
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
      uSunDir: { value: DEFAULT_SUN_DIR.clone() },
      uSunColor: { value: DEFAULT_SUN_COLOR.clone() },
      uSkyColor: { value: DEFAULT_SKY.clone() },
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

  // The distance haze fades towards the theme's sky (settings): night blue, or a day haze a shade
  // darker than the pale sky, so far ridges still stand against it (given in the shader's linear
  // units, so that it comes out of the tone curve as #cfd6de), and thinner, since a bright haze
  // takes more contrast from the snow than a dark one.
  const theme = useStore((s) => s.theme)
  useEffect(() => {
    if (theme === 'day') { uniforms.uFogColor.value.setRGB(1.47, 1.67, 1.97); uniforms.uFogDensity.value = 0.045 }
    else { uniforms.uFogColor.value.set('#0f1626'); uniforms.uFogDensity.value = 0.07 }
  }, [uniforms, theme])

  // Before the first frame with this heightmap. A heightmap not yet on the GPU goes up by the band:
  // on the first mount while the terrain is hidden for its compile (the reveal waits for both),
  // and when the full one replaces the 512² one, which stays on screen until it's all there.
  const heightReady = useRef(null)
  useLayoutEffect(() => {
    if (!floatLinear) nearestHeights(heightTexture)
    const show = () => {
      uniforms.uHeight.value = heightTexture
      uniforms.uTexel.value.set(1 / geo.W, 1 / geo.H)
      uniforms.uSpacing.value.set(geo.sizeX / geo.W, geo.sizeZ / geo.H)
      uniforms.uBandAlt.value = bandAlt / 1000
      uniforms.uCal.value.set(cal.gapM / 1000, cal.baseM / 1000, 1000 / cal.rampM)
      heightsOnGpu.add(heightTexture)
    }
    if (heightsOnGpu.has(heightTexture)) {
      show()
      return
    }
    let live = true
    const up = uploader.add(heightTexture)
    const current = uniforms.uHeight.value
    if (current !== heightTexture && heightsOnGpu.has(current)) up.done.then((t) => { if (live && t) show() })
    else {
      show()
      heightReady.current = up.done
    }
    // another mountain or a newer terrain first: this one uploads whole when it's next drawn
    return () => { live = false; up.cancel() }
  }, [uniforms, heightTexture, geo, floatLinear, bandAlt, cal, uploader])

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

  // Compile off the main thread where the driver allows (KHR_parallel_shader_compile). This runs in
  // the commit, before any frame: the terrain waits on a layer the camera does not draw and the
  // routes and markers wait for terrainReady, so no frame draws a program that is still compiling
  // (on an integrated GPU the terrain's took 0.65 s, all of it a frozen page). The whole scene is
  // compiled, so the route lines and markers are ready when they appear too.
  useLayoutEffect(() => {
    let alive = true
    const g = group.current
    if (!g) return
    g.traverse((o) => o.layers.set(HIDDEN_LAYER))
    performance.mark(`terrain:compile-start:${terrain.id}`)
    const done = () => { if (!alive) return; g.traverse((o) => o.layers.set(0)); performance.mark(`terrain:ready:${terrain.id}`); useStore.setState({ terrainReady: true, readyId: terrain.id }); if (location.search.includes('debug')) console.table(perfSummary(terrain.id)) }
    useStore.setState({ terrainReady: false })
    Promise.all([compileScene(gl, scene, camera), heightReady.current]).then(done, done)
    return () => { alive = false }
  }, [materials, gl, camera, scene, terrain.id])

  // stream the full-resolution textures in after first paint: light → albedo → detail → summit
  // detail. Each is decoded while the one before it goes up to the GPU by the band.
  useEffect(() => {
    let alive = true
    const owned = [], uploads = []
    const layers = [
      { file: 'light.webp', key: 'uLight', mark: 'light' },
      { file: tier.albedo, key: 'uAlbedo', mark: 'albedo' },
      hasDetail && { file: tier.detail, key: 'uDetail', on: 'uDetailOn', mark: 'detail' },
      hasDetail2 && { file: tier.detail2, key: 'uDetail2', on: 'uDetail2On', mark: 'detail2' },
    ].filter(Boolean)
    const fetchLayer = (i) => (i < layers.length ? loadTexture(terrain.base + layers[i].file) : Promise.resolve(null))
    const drop = (p) => p.then((t) => t && freeTexture(t))
    ;(async () => {
      let next = fetchLayer(0)
      for (let i = 0; i < layers.length; i++) {
        const t = await next // missing layer: null, keep going
        next = fetchLayer(i + 1)
        if (!alive) { if (t) freeTexture(t); drop(next); return }
        if (!t) continue
        owned.push(prepTexture(t))
        if (t.isDataTexture) {
          const up = uploader.add(t)
          uploads.push(up)
          if (!(await up.done) || !alive) { drop(next); return }
          t.image.data = null // on the GPU now (a restored context remounts the terrain: Scene.jsx)
        }
        const { key, on, mark } = layers[i]
        uniforms[key].value = t
        if (on) uniforms[on].value = 1
        performance.mark(`tex:${mark}:${terrain.id}`)
      }
    })()
    return () => { alive = false; uploads.forEach((u) => u.cancel()); owned.forEach(freeTexture) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terrain.id, tier, uniforms, hasDetail, hasDetail2, uploader])

  useEffect(() => () => { materials.base.dispose(); materials.patch.dispose() }, [materials])
  // the grids leave with the mountain: their GPU buffers, and their CPU copies too (up to 37 MB),
  // since React can hold on to an unmounted tree until the next switch
  useEffect(() => () => {
    for (const g of [baseGeometry, patchGeometry]) {
      g.dispose()
      for (const a of [g.index, ...Object.values(g.attributes)]) if (a) a.array = null
    }
  }, [baseGeometry, patchGeometry])

  const ndc = useMemo(() => new THREE.Vector2(), [])
  const ray = useMemo(() => new THREE.Raycaster(), [])

  // ---- the light: the usual late sun, or any hour (the explorer's Light, a climb's summit night) ----
  // The target comes from the store; the sun eases towards it, so a jump from dawn to dusk sweeps
  // across the sky in about half a second (at once with animations stopped). Other hours than the
  // usual one get their shadows from the GPU pass, made the first time it is needed.
  const pass = useRef(null)
  useEffect(() => () => { pass.current?.dispose(); pass.current = null }, [gl])
  const sun = useMemo(() => ({
    dir: DEFAULT_SUN_DIR.clone(), color: DEFAULT_SUN_COLOR.clone(), sky: DEFAULT_SKY.clone(), night: 0, rt: 0,
    wantDir: new THREE.Vector3(), wantColor: new THREE.Color(), wantSky: new THREE.Color(), hour: { color: new THREE.Color(), sky: new THREE.Color(), night: 0 }, hourDir: new THREE.Vector3(),
    shadowDir: new THREE.Vector3(), shadowOf: null, shadowQuick: false, movedAt: 0, size: new THREE.Vector2(),
  }), [])
  const lightTarget = (s) => {
    if (s.mode === 'ascent' && s.climbLight) return s.climbLight
    if (s.sun.mode === 'now') { const n = nowAt(mountain); return { ymd: n.ymd, minutes: n.minutes, blend: 1 } }
    if (s.sun.mode === 'time') return { ymd: nowAt(mountain).ymd, minutes: s.sun.minutes, blend: 1 }
    return null
  }
  const updateLight = (s, dt, still) => {
    const L = sun
    const target = lightTarget(s)
    let b = 0
    if (target) {
      const { az, el } = sunAt(momentAt(mountain, target.ymd, target.minutes), peak.lat, peak.lon)
      sunVector(az, el, L.hourDir)
      sunLight(el, L.hour)
      b = target.blend
    }
    L.wantDir.copy(DEFAULT_SUN_DIR).lerp(L.hourDir, b).normalize()
    L.wantColor.copy(DEFAULT_SUN_COLOR).lerp(L.hour.color, b)
    L.wantSky.copy(DEFAULT_SKY).lerp(L.hour.sky, b)
    const k = still ? 1 : 1 - Math.exp(-Math.min(dt, 0.1) * 5)
    const moving = L.dir.angleTo(L.wantDir) > 0.0015
    L.dir.lerp(L.wantDir, k).normalize()
    L.color.lerp(L.wantColor, k)
    L.sky.lerp(L.wantSky, k)
    L.night += (L.hour.night * b - L.night) * k
    L.rt += (b - L.rt) * k
    if (!target && L.rt < 0.002) L.rt = 0
    // the shadows for this sun: again only when it has moved, quickly while it moves, in full once
    // it rests (a quarter of a second)
    const now = performance.now()
    if (moving) L.movedAt = now
    // (not while the heightmap is still going up to the GPU: its rows would read as zero)
    if (L.rt > 0.001 && L.dir.y > 0.003 && s.terrainReady) {
      if (!pass.current) pass.current = createSunShadow(gl, { manualBilinear: !floatLinear, size: quality === 'low' ? 512 : 1024 })
      const settled = now - L.movedAt > 250
      const height = uniforms.uHeight.value
      if (L.shadowDir.angleTo(L.dir) > 0.0015 || L.shadowOf !== height || (settled && L.shadowQuick)) {
        L.size.set(geo.sizeX, geo.sizeZ)
        uniforms.uShadowMap.value = pass.current.render(height, uniforms.uTexel.value, L.size, L.dir, !settled)
        L.shadowDir.copy(L.dir)
        L.shadowOf = height
        L.shadowQuick = !settled
      }
    }
    uniforms.uSunDir.value.copy(L.dir)
    uniforms.uSunColor.value.copy(L.color)
    uniforms.uSkyColor.value.copy(L.sky)
    uniforms.uNightColor.value.copy(NIGHT_FILL).multiplyScalar(L.night)
    uniforms.uUseRT.value = L.rt
    // shared with what else the sun lights (the plume)
    light.dir.copy(L.dir)
    light.color.copy(L.color)
    light.night = L.night
  }

  useFrame(({ camera, clock, size }, dt) => {
    uploader.step() // the next band of whichever texture is on its way to the GPU
    const s = useStore.getState()
    const still = s.motion === 'off'
    updateLight(s, dt, still)
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
      const text = `≈ ${altitude(alt)} · ${lat.toFixed(3)}° N ${lon.toFixed(3)}° E`
      if (loupe.read.textContent !== text) loupe.read.textContent = text
    }
  })

  return (
    <group ref={group} visible>
      {/* the patch first, then the coarse grid sunk under it: what the patch covers fails the depth
          test instead of being shaded twice, and the route lines and rings always come after */}
      <mesh geometry={baseGeometry} material={materials.base} frustumCulled={false} renderOrder={-1} />
      <mesh geometry={patchGeometry} material={materials.patch} frustumCulled={false} renderOrder={-2} />
    </group>
  )
}

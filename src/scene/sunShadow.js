// Shadows for a sun anywhere in the sky, worked out on the GPU. The site's usual light has its
// shadows baked (scripts/bake-light.mjs, one fixed sun); for any other hour, this pass marches
// from every texel of the heightmap towards the sun and writes how much of it is in shadow, with
// the bake's soft edge, into a texture the terrain samples instead. It runs once when the sun
// moves, never every frame, and at a quarter of the texels while the sun is on the move (a drag of
// the Light slider, the scroll through a summit night), then once more in full when it stops.
import * as THREE from 'three'

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

const frag = /* glsl */ `
precision highp float;
uniform sampler2D uHeight;
uniform vec2 uTexel;
uniform vec2 uSize;   // tile size, km (x east, y north)
uniform vec3 uSun;    // towards the sun, scene axes
varying vec2 vUv;
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
void main() {
  float level = length(uSun.xz); // (not "flat": a reserved word in GLSL ES 3.00)
  if (uSun.y <= 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  // one km towards the sun, in uv (v grows northwards; the scene's north is -z)
  vec2 du = vec2(uSun.x, -uSun.z) / max(level, 1e-4) / uSize;
  float rise = uSun.y / max(level, 1e-4); // km up per km along
  float h0 = H(vUv);
  float s = 1.0;
  for (int i = 1; i <= 56; i++) {
    float t = float(i) * 0.07 * (1.0 + float(i) * 0.09); // as the bake: fine near, coarse far
    vec2 uv = vUv + du * t;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) break;
    float d = H(uv) - (h0 + rise * t + 0.004);
    if (d > 0.0) { s = min(s, max(0.0, 1.0 - d * 12.0)); if (s <= 0.02) break; }
  }
  gl_FragColor = vec4(s, s, s, 1.0);
}
`

export function createSunShadow(gl, { manualBilinear = false, size = 1024 } = {}) {
  const make = (n) => {
    const rt = new THREE.WebGLRenderTarget(n, n, { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false })
    rt.texture.minFilter = rt.texture.magFilter = THREE.LinearFilter
    rt.texture.generateMipmaps = false
    return rt
  }
  const full = make(size), quick = make(size / 2)
  const material = new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, depthTest: false, depthWrite: false,
    defines: manualBilinear ? { MANUAL_BILINEAR: 1 } : {},
    uniforms: { uHeight: { value: null }, uTexel: { value: new THREE.Vector2() }, uSize: { value: new THREE.Vector2() }, uSun: { value: new THREE.Vector3() } },
  })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  quad.frustumCulled = false
  const scene = new THREE.Scene()
  scene.add(quad)
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  let current = full

  return {
    /** the texture that holds the latest shadows */
    get texture() { return current.texture },
    /**
     * Work the shadows out for a sun direction; `quickly` while it is still moving. `texel` is the
     * heightmap's texel size in uv, `size` the tile's in km (x east, y north).
     */
    render(heightTexture, texel, size, sun, quickly) {
      const u = material.uniforms
      u.uHeight.value = heightTexture
      u.uTexel.value.copy(texel)
      u.uSize.value.copy(size)
      u.uSun.value.copy(sun)
      current = quickly ? quick : full
      const before = gl.getRenderTarget()
      gl.setRenderTarget(current)
      gl.render(scene, camera)
      gl.setRenderTarget(before)
      return current.texture
    },
    dispose() { full.dispose(); quick.dispose(); material.dispose(); quad.geometry.dispose() },
  }
}

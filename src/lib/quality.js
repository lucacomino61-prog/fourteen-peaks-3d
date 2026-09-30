// The quality tier and multisampling, decided once per visit before anything is loaded: the scene
// picks its mesh density, textures and antialiasing from them (scene/Scene.jsx, scene/Terrain.jsx),
// and the loader its heightmap (lib/terrain.js).
let decided = null

function decide() {
  if (decided) return decided
  let renderer = ''
  try {
    // a throwaway context, only to read which GPU this is
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    const dbg = gl?.getExtension('WEBGL_debug_renderer_info')
    renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ''
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {}
  // Multisampling where it is cheap: phones and tablets, whose GPUs resolve it on chip (and whose
  // canvas is drawn below the screen's density, so edges show), and desktop graphics cards with
  // memory of their own. Not on integrated desktop GPUs: on one (Intel HD 4600) 4× MSAA doubled the
  // frame, and the resolution steering does better with those milliseconds.
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  const discrete = /NVIDIA|GeForce|Quadro|Radeon (RX|Pro|R9)/i.test(renderer)
  decided = { tier: tierFor(renderer), msaa: touch || discrete }
  return decided
}

function tierFor(renderer) {
  // ?quality=low|medium|high forces a tier (to tell a GPU that is too slow from anything else)
  const forced = new URLSearchParams(location.search).get('quality')
  if (forced === 'low' || forced === 'medium' || forced === 'high') return forced
  const narrow = window.innerWidth < 800
  const weak = (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2
  if (narrow || weak) return 'low'
  if (/SwiftShader|Software|llvmpipe|Basic Render/i.test(renderer)) return 'low'
  if (/Intel.*(HD|UHD|Iris)|Mali|Adreno|Apple GPU/i.test(renderer) && !/Iris Xe|Arc/i.test(renderer)) return 'medium'
  return 'high'
}

/** 'high' | 'medium' | 'low' */
export const quality = () => decide().tier
/** Whether the 3D canvas asks for 4× multisampling. */
export const multisample = () => decide().msaa

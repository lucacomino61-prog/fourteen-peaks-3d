import { inflateSync } from 'fflate'

/**
 * height.q16 → Float32 metres, rows flipped so row 0 = south (v = 0, as the textures expect).
 * The file is deflated uint16 quarter-metres, zig-zag coded as deltas along each row.
 * Shared by the decoder worker (lib/heightWorker.js) and the main-thread fallback.
 */
export function decodeQ16(bytes, W, H, scale = 0.25) {
  const z = inflateSync(bytes)
  const out = new Float32Array(W * H)
  for (let y = 0; y < H; y++) {
    let prev = 0
    const src = y * W * 2, dst = (H - 1 - y) * W
    for (let x = 0; x < W; x++) {
      const u = z[src + x * 2] | (z[src + x * 2 + 1] << 8)
      prev = (prev + ((u >>> 1) ^ -(u & 1))) & 0xffff // un-zig-zag, accumulate
      out[dst + x] = prev * scale
    }
  }
  return out
}

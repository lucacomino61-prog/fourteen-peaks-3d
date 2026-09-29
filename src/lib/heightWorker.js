// Decodes heightmaps off the main thread: inflating and un-delta-ing 4 million samples took
// 100–200 ms of main thread on phones, during the first seconds when people start to touch.
import { decodeQ16 } from './q16'

self.onmessage = ({ data: { id, bytes, W, H, scale } }) => {
  try {
    const out = decodeQ16(new Uint8Array(bytes), W, H, scale)
    self.postMessage({ id, buf: out.buffer }, [out.buffer])
  } catch (e) {
    self.postMessage({ id, error: String(e) })
  }
}

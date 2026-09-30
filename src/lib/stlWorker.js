// A mountain as a 3D-print file (binary STL), made off the main thread: a square of ground around
// the summit from the elevation model (Copernicus GLO-30, the site's 1024² heightmap: 31 m a
// sample), as a closed solid: the relief on top, four walls, a flat base. True scale in every
// direction, 150 mm across. The satellite imagery is not in it: only elevation data, whose licence
// allows this with its credit (the header carries a short one).
import { decodeQ16 } from './q16'

const rad = (d) => (d * Math.PI) / 180
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))

self.onmessage = async ({ data: job }) => {
  try {
    const { url, meta, lat, lon, elevation, sizeKm, grid, widthMm, baseMm, header } = job
    const res = await fetch(url)
    if (!res.ok) throw new Error(`heightmap: ${res.status}`)
    const W = meta.mid.width, H = meta.mid.height
    const h = decodeQ16(new Uint8Array(await res.arrayBuffer()), W, H, meta.q16?.scale || 0.25) // row 0 = south
    const { bbox } = meta
    const mpp = meta.metresPerPx * (meta.width / W)
    const sizeZ = (bbox.north - bbox.south) * 111.195 // km, as lib/geo.js
    const sizeX = (W * mpp) / 1000
    // the summit: the highest sample within 300 m of its surveyed position
    const u0 = (lon - bbox.west) / (bbox.east - bbox.west)
    const v0 = 1 - (mercY(bbox.north) - mercY(lat)) / (mercY(bbox.north) - mercY(bbox.south)) // 0 = south
    let cx = Math.round(u0 * (W - 1)), cy = Math.round(v0 * (H - 1)), top = -Infinity
    const r = Math.ceil(300 / mpp)
    for (let y = Math.max(0, cy - r); y <= Math.min(H - 1, cy + r); y++)
      for (let x = Math.max(0, cx - r); x <= Math.min(W - 1, cx + r); x++)
        if (h[y * W + x] > top) { top = h[y * W + x]; cx = x; cy = y }
    const su = cx / (W - 1), sv = cy / (H - 1)
    // the model rounds the summit off: its surveyed height back, the correction fading within 600 m
    const gap = Math.max(0, elevation - top)
    const sample = (u, v) => {
      const fx = Math.min(Math.max(u, 0), 1) * (W - 1), fy = Math.min(Math.max(v, 0), 1) * (H - 1)
      const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(x0 + 1, W - 1), y1 = Math.min(y0 + 1, H - 1)
      const tx = fx - x0, ty = fy - y0
      const m = (h[y0 * W + x0] * (1 - tx) + h[y0 * W + x1] * tx) * (1 - ty) + (h[y1 * W + x0] * (1 - tx) + h[y1 * W + x1] * tx) * ty
      const d = Math.hypot((u - su) * sizeX, (v - sv) * sizeZ) * 1000
      return m + gap * Math.max(0, 1 - d / 600)
    }
    // the square around the summit, kept inside the tile
    const halfU = sizeKm / 2 / sizeX, halfV = sizeKm / 2 / sizeZ
    const cu = Math.min(Math.max(su, halfU), 1 - halfU), cv = Math.min(Math.max(sv, halfV), 1 - halfV)
    const n = grid
    const z = new Float32Array(n * n)
    let lo = Infinity
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const m = sample(cu - halfU + (2 * halfU * i) / (n - 1), cv - halfV + (2 * halfV * j) / (n - 1))
      z[j * n + i] = m
      if (m < lo) lo = m
    }
    const mmPerM = widthMm / (sizeKm * 1000)
    for (let k = 0; k < z.length; k++) z[k] = baseMm + (z[k] - lo) * mmPerM
    const X = (i) => (i / (n - 1) - 0.5) * widthMm // west → east
    const Y = (j) => (j / (n - 1) - 0.5) * widthMm // south → north

    const tris = (n - 1) * (n - 1) * 2 + 4 * (n - 1) * 2 + 4 * (n - 1)
    const buf = new ArrayBuffer(84 + tris * 50)
    const dv = new DataView(buf)
    for (let k = 0; k < 80; k++) dv.setUint8(k, k < header.length ? header.charCodeAt(k) & 127 : 32)
    dv.setUint32(80, tris, true)
    let o = 84
    const put = (a, b, c) => {
      // normal from the winding (counter-clockwise seen from outside)
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx
      const l = Math.hypot(nx, ny, nz) || 1
      nx /= l; ny /= l; nz /= l
      for (const f of [nx, ny, nz, ...a, ...b, ...c]) { dv.setFloat32(o, f, true); o += 4 }
      dv.setUint16(o, 0, true); o += 2
    }
    const P = (i, j) => [X(i), Y(j), z[j * n + i]]
    const B = (i, j) => [X(i), Y(j), 0]
    // the relief
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
      put(P(i, j), P(i + 1, j), P(i + 1, j + 1))
      put(P(i, j), P(i + 1, j + 1), P(i, j + 1))
    }
    // the walls: south, east, north, west
    for (let i = 0; i < n - 1; i++) { put(B(i, 0), B(i + 1, 0), P(i + 1, 0)); put(B(i, 0), P(i + 1, 0), P(i, 0)) }
    for (let j = 0; j < n - 1; j++) { put(B(n - 1, j), B(n - 1, j + 1), P(n - 1, j + 1)); put(B(n - 1, j), P(n - 1, j + 1), P(n - 1, j)) }
    for (let i = n - 1; i > 0; i--) { put(B(i, n - 1), B(i - 1, n - 1), P(i - 1, n - 1)); put(B(i, n - 1), P(i - 1, n - 1), P(i, n - 1)) }
    for (let j = n - 1; j > 0; j--) { put(B(0, j), B(0, j - 1), P(0, j - 1)); put(B(0, j), P(0, j - 1), P(0, j)) }
    // the base: a fan from its centre to every edge segment of the walls (no gaps where they meet)
    const c = [0, 0, 0]
    const ring = []
    for (let i = 0; i < n - 1; i++) ring.push([B(i, 0), B(i + 1, 0)])
    for (let j = 0; j < n - 1; j++) ring.push([B(n - 1, j), B(n - 1, j + 1)])
    for (let i = n - 1; i > 0; i--) ring.push([B(i, n - 1), B(i - 1, n - 1)])
    for (let j = n - 1; j > 0; j--) ring.push([B(0, j), B(0, j - 1)])
    for (const [p, q] of ring) put(c, q, p) // facing down
    self.postMessage({ buf, heightMm: Math.max(...z), reliefM: Math.round((Math.max(...z) - baseMm) / mmPerM) }, [buf])
  } catch (e) {
    self.postMessage({ error: String(e?.message || e) })
  }
}

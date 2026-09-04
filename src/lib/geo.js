// Coordinate helpers: lat/lon ↔ scene space.
// Scene: 1 unit = 1 km. +X east, -Z north, +Y up. Origin at tile centre, y=0 at sea level.

const rad = (d) => (d * Math.PI) / 180
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))

export function makeGeo(meta) {
  const { bbox, width: W, height: H, metresPerPx } = meta
  const sizeX = (W * metresPerPx) / 1000
  // N–S extent in km from latitude span (Mercator tile is square in pixels, not km)
  const sizeZ = ((bbox.north - bbox.south) * 111.195)
  const mN = mercY(bbox.north), mS = mercY(bbox.south)

  const toUv = (lat, lon) => ({
    u: (lon - bbox.west) / (bbox.east - bbox.west),
    v: 1 - (mN - mercY(lat)) / (mN - mS), // v=1 north
  })

  const uvToScene = (u, v) => ({
    x: (u - 0.5) * sizeX,
    z: (0.5 - v) * sizeZ,
  })

  return {
    sizeX, sizeZ, W, H, bbox, metresPerPx,
    toUv,
    uvToScene,
    /** lat/lon → {x,z} scene (no height) */
    toScene(lat, lon) {
      const { u, v } = toUv(lat, lon)
      return uvToScene(u, v)
    },
  }
}

/** Bilinear height sample (metres) from a Float32 heightmap stored south→north (row 0 = south). */
export function sampleHeight(height, W, H, u, v) {
  const fx = Math.min(Math.max(u, 0), 1) * (W - 1)
  const fy = Math.min(Math.max(v, 0), 1) * (H - 1)
  const x0 = Math.floor(fx), y0 = Math.floor(fy)
  const x1 = Math.min(x0 + 1, W - 1), y1 = Math.min(y0 + 1, H - 1)
  const tx = fx - x0, ty = fy - y0
  const h00 = height[y0 * W + x0], h10 = height[y0 * W + x1]
  const h01 = height[y1 * W + x0], h11 = height[y1 * W + x1]
  return (h00 * (1 - tx) + h10 * tx) * (1 - ty) + (h01 * (1 - tx) + h11 * tx) * ty
}

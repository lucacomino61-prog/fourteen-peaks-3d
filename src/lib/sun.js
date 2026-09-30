// Where the sun is over a mountain at a given hour, and what its light looks like (the explorer's
// Light control and the summit night of a climb: scene/Terrain.jsx). The position is NOAA's solar
// position algorithm (the equations of its solar calculator, after Meeus' Astronomical
// Algorithms): good to a fraction of a degree, far better than the eye can tell on a 3D mountain.
// Hours are read on the clock of the mountain's first-listed country, as the forecast's are.
import * as THREE from 'three'

const rad = (d) => (d * Math.PI) / 180
const deg = (r) => (r * 180) / Math.PI

/** The mountain's clock, minutes east of UTC (none of these countries keeps summer time). */
const OFFSETS = { Nepal: 345, Pakistan: 300, China: 480, India: 330 }
export function clockOf(m) {
  const country = m.peak.clock // in English, whatever the page's language (src/data/index.js)
  return { country, offset: OFFSETS[country] ?? 0 }
}

/** The sun's azimuth (degrees clockwise from north) and elevation (degrees) at a moment, over lat/lon. */
export function sunAt(date, lat, lon) {
  const jd = date.getTime() / 86400000 + 2440587.5
  const jc = (jd - 2451545) / 36525
  const L0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360
  const M = 357.52911 + jc * (35999.05029 - 0.0001537 * jc)
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc)
  const C = Math.sin(rad(M)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) + Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * jc) + Math.sin(rad(3 * M)) * 0.000289
  const app = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(125.04 - 1934.136 * jc))
  const obliq = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(rad(125.04 - 1934.136 * jc))
  const decl = Math.asin(Math.sin(rad(obliq)) * Math.sin(rad(app)))
  const y = Math.tan(rad(obliq / 2)) ** 2
  const eqTime = 4 * deg(y * Math.sin(2 * rad(L0)) - 2 * e * Math.sin(rad(M)) + 4 * e * y * Math.sin(rad(M)) * Math.cos(2 * rad(L0)) - 0.5 * y * y * Math.sin(4 * rad(L0)) - 1.25 * e * e * Math.sin(2 * rad(M)))
  const minutesUtc = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60
  let tst = (minutesUtc + eqTime + 4 * lon) % 1440
  if (tst < 0) tst += 1440
  let ha = tst / 4 - 180
  if (ha < -180) ha += 360
  const la = rad(lat)
  const cosZ = Math.min(1, Math.max(-1, Math.sin(la) * Math.sin(decl) + Math.cos(la) * Math.cos(decl) * Math.cos(rad(ha))))
  const zen = Math.acos(cosZ)
  const az0 = deg(Math.acos(Math.min(1, Math.max(-1, (Math.sin(la) * Math.cos(zen) - Math.sin(decl)) / (Math.cos(la) * Math.sin(zen) || 1e-9)))))
  const az = ha > 0 ? (az0 + 180) % 360 : (540 - az0) % 360
  return { az, el: 90 - deg(zen) }
}

/** The moment that is `minutes` past midnight on the mountain's clock, on a day 'YYYY-MM-DD' of it. */
export function momentAt(m, ymd, minutes) {
  const [Y, Mo, D] = ymd.split('-').map(Number)
  return new Date(Date.UTC(Y, Mo - 1, D, 0, 0) + (minutes - clockOf(m).offset) * 60000)
}

/** Today on the mountain's clock, 'YYYY-MM-DD', and the minutes of its day now. */
export function nowAt(m, date = new Date()) {
  const local = new Date(date.getTime() + clockOf(m).offset * 60000)
  return { ymd: local.toISOString().slice(0, 10), minutes: local.getUTCHours() * 60 + local.getUTCMinutes() }
}

/** Sunrise, solar noon and sunset of a day on the mountain's clock (minutes; null when it doesn't rise or set). */
export function dayOf(m, ymd) {
  const el = (min) => sunAt(momentAt(m, ymd, min), m.peak.lat, m.peak.lon).el
  let noon = 0, best = -99
  for (let min = 0; min < 1440; min += 10) { const v = el(min); if (v > best) { best = v; noon = min } }
  for (let step = 5; step >= 0.5; step /= 2) for (const d of [-step, step]) if (el(noon + d) > el(noon)) noon += d
  const cross = (a, b) => { // the minute the upper limb crosses the horizon (−0.833° with refraction)
    const f = (x) => el(x) + 0.833
    if (Math.sign(f(a)) === Math.sign(f(b))) return null
    for (let i = 0; i < 24; i++) { const mid = (a + b) / 2; if (Math.sign(f(mid)) === Math.sign(f(a))) a = mid; else b = mid }
    return (a + b) / 2
  }
  return { sunrise: cross(noon - 720, noon), noon, sunset: cross(noon, noon + 720) }
}

/** Towards the sun in the scene (+x east, −z north, +y up) */
export function sunVector(az, el, out = new THREE.Vector3()) {
  const a = rad(az), e = rad(el)
  return out.set(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e))
}

// The sun's colour by its height: deep orange at the horizon, warm low, near white high; and how
// much of it gets through the air. Below the horizon: none, and the night's cool fill takes over.
const LOW = new THREE.Color('#ff8a4a'), WARM = new THREE.Color('#ffc99a'), HIGH = new THREE.Color('#fff3e2')
const SKY_DAY = new THREE.Color('#4a63a0').multiplyScalar(0.5), SKY_DUSK = new THREE.Color('#40385f').multiplyScalar(0.4), SKY_NIGHT = new THREE.Color('#141c33').multiplyScalar(0.35)
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/** { color (with its strength), sky (the ambient from above), night 0..1 } for a sun elevation */
export function sunLight(el, out = { color: new THREE.Color(), sky: new THREE.Color(), night: 0 }) {
  const warm = smooth(-1, 12, el), high = smooth(12, 40, el)
  out.color.copy(LOW).lerp(WARM, warm).lerp(HIGH, high)
  // the air's extinction near the horizon, and nothing once the sun is below it
  out.color.multiplyScalar(2.4 * smooth(-1.5, 2, el) * (0.55 + 0.45 * smooth(0, 20, el)) * (1 + 0.12 * high))
  out.night = 1 - smooth(-10, -1, el)
  out.sky.copy(SKY_NIGHT).lerp(SKY_DUSK, smooth(-10, -2, el)).lerp(SKY_DAY, smooth(-2, 10, el))
  return out
}

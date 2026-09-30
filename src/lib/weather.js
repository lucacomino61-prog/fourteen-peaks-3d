// Today's weather on the summit: a forecast from Open-Meteo (open-meteo.com, free for non-commercial
// sites, data under CC BY 4.0, credited wherever it is shown). It is not a measurement: the weather
// models' 400 hPa and 300 hPa levels (about 7,200 and 9,200 m) are interpolated to the summit's height
// by their geopotential heights, hour by hour; the direction as a vector, so north stays north.
//
// Only fetched when the visitor asks for it (the "Show the weather" buttons), or on every visit with
// the setting on: the request goes from the browser to Open-Meteo, which sees the visitor's address
// (the privacy page says so). Kept for the visit in sessionStorage (fp-weather), an hour at most.
import { useStore } from '../store'

const API = 'https://api.open-meteo.com/v1/forecast'
const LEVELS = [400, 300]
const VARS = ['temperature', 'wind_speed', 'wind_direction', 'geopotential_height']
const KEEP_MS = 60 * 60 * 1000
const SESSION = 'fp-weather'

const rad = (d) => (d * Math.PI) / 180

// The clock the times are shown in: the first country the mountain's page lists (the side most
// climbs start from, and the one named on screen: "Pakistan time"). A summit on a border would
// otherwise get whichever zone the coordinates fall in: K2 came out on China's clock.
const ZONES = { Nepal: 'Asia/Kathmandu', Pakistan: 'Asia/Karachi', China: 'Asia/Shanghai', India: 'Asia/Kolkata' }
export function zoneOf(m) {
  const country = m.peak.clock // in English, whatever the page's language (src/data/index.js)
  return { country, zone: ZONES[country] || 'UTC' }
}

/** One hour's values at a height between two levels: { t, temp, wind, dir } */
function atHeight(h, i, z) {
  const [lo, hi] = LEVELS.map((l) => ({
    z: h[`geopotential_height_${l}hPa`][i], temp: h[`temperature_${l}hPa`][i],
    wind: h[`wind_speed_${l}hPa`][i], dir: h[`wind_direction_${l}hPa`][i],
  }))
  if ([lo.z, hi.z, lo.temp, hi.temp, lo.wind, hi.wind].some((v) => v == null)) return null
  const f = Math.min(1.2, Math.max(-0.2, (z - lo.z) / (hi.z - lo.z)))
  const mix = (a, b) => a + (b - a) * f
  // wind as a vector (u east, v north, towards where it blows from), then back to speed and direction
  const vec = (w) => [w.wind * Math.sin(rad(w.dir)), w.wind * Math.cos(rad(w.dir))]
  const [ua, va] = vec(lo), [ub, vb] = vec(hi)
  const u = mix(ua, ub), v = mix(va, vb)
  return { t: h.time[i], temp: mix(lo.temp, hi.temp), wind: Math.hypot(u, v), dir: (Math.atan2(u, v) * 180 / Math.PI + 360) % 360 }
}

/** Wind chill, °C (the 2001 North American formula: air at or below 10 °C, wind over 4.8 km/h) */
export function windChill(temp, kmh) {
  if (temp > 10 || kmh <= 4.8) return temp
  const v = kmh ** 0.16
  return 13.12 + 0.6215 * temp - 11.37 * v + 0.3965 * temp * v
}

/** The eight compass points, for "from the west" */
export const POINTS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west']
export const compass = (deg) => POINTS[Math.round((((deg % 360) + 360) % 360) / 45) % 8]

function fromSession(id) {
  try {
    const all = JSON.parse(sessionStorage.getItem(SESSION) || '{}')
    const w = all[id]
    return w && Date.now() - w.fetchedAt < KEEP_MS ? w : null
  } catch { return null }
}
function toSession(w) {
  try {
    const all = JSON.parse(sessionStorage.getItem(SESSION) || '{}')
    all[w.id] = w
    sessionStorage.setItem(SESSION, JSON.stringify(all))
  } catch { /* storage full or blocked: fetched again next time */ }
}

/**
 * The forecast for a mountain's summit: { id, fetchedAt, offset (s from UTC on its clock), country
 * and tz (whose clock), now: { t, temp, wind, dir }, hours: [{ t, temp, wind, dir }] } over the
 * next week, every hour.
 */
export async function fetchWeather(m) {
  const kept = fromSession(m.id)
  if (kept) return kept
  const hourly = LEVELS.flatMap((l) => VARS.map((v) => `${v}_${l}hPa`)).join(',')
  const { country, zone } = zoneOf(m)
  const url = `${API}?latitude=${m.peak.lat}&longitude=${m.peak.lon}&hourly=${hourly}&forecast_days=7&timezone=${encodeURIComponent(zone)}&timeformat=unixtime&wind_speed_unit=kmh`
  const res = await fetch(url, { referrerPolicy: 'no-referrer' })
  if (!res.ok) throw new Error(`weather ${res.status}`)
  const data = await res.json()
  const h = data.hourly
  const hours = []
  for (let i = 0; i < h.time.length; i++) {
    const v = atHeight(h, i, m.peak.elevation)
    if (v) hours.push(v)
  }
  if (!hours.length) throw new Error('weather: no values')
  const nowS = Date.now() / 1000
  let k = 0
  for (let i = 0; i < hours.length; i++) if (Math.abs(hours[i].t - nowS) < Math.abs(hours[k].t - nowS)) k = i
  const offset = data.utc_offset_seconds || 0
  // "UTC+5:45", from the offset itself (the services' abbreviations vary: +0545, GMT+5:45…)
  const oh = Math.floor(Math.abs(offset) / 3600), om = Math.round((Math.abs(offset) % 3600) / 60)
  const tz = `UTC${offset < 0 ? '−' : '+'}${oh}${om ? `:${String(om).padStart(2, '0')}` : ''}`
  const w = { id: m.id, fetchedAt: Date.now(), offset, country, tz, now: hours[k], hours: hours.filter((x) => x.t >= hours[k].t - 3600) }
  toSession(w)
  return w
}

// asked for in this visit: other mountains' forecasts load as they come on screen
const ASKED = 'fp-weather-asked'
export const weatherWanted = () => {
  if (useStore.getState().settings.weather) return true
  try { return sessionStorage.getItem(ASKED) === '1' } catch { return false }
}

/** Load the forecast for the mountain on screen into the store (weather: { …, status }) */
export async function loadWeather(m, { asked = false } = {}) {
  if (asked) { try { sessionStorage.setItem(ASKED, '1') } catch { /* for this page only */ } }
  const cur = useStore.getState().weather
  if (cur?.id === m.id && (cur.status === 'ready' || cur.status === 'loading')) return
  useStore.setState({ weather: { id: m.id, status: 'loading' } })
  try {
    const w = await fetchWeather(m)
    if (useStore.getState().mountainId !== m.id) return
    useStore.setState({ weather: { ...w, status: 'ready' } })
  } catch {
    if (useStore.getState().mountainId === m.id) useStore.setState({ weather: { id: m.id, status: 'failed' } })
  }
}

/** The hour at the mountain, "14:00" (its own time zone, from the forecast) */
export function localTime(w, t) {
  const d = new Date((t + w.offset) * 1000)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

/** The day at the mountain for a time: its UTC-shifted Date (read with getUTC…) */
export const localDate = (w, t) => new Date((t + w.offset) * 1000)

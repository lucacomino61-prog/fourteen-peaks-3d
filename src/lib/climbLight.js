// The light of a climb's last stretch, for the routes whose own text says when the summit push
// leaves (route.push in src/data, e.g. Everest's South Col: "Summit pushes leave around 9 pm for a
// 10 to 14 hour climb"). Up to the stop before the top camp, the site's usual late light. Towards
// the camp the clock runs from the afternoon to the departure, into the dark; from the camp it
// runs on through the night, with the real sun of that place and day (lib/sun.js): to the
// documented arrival where the text gives one, else through the dawn and back into the usual
// light at the summit, so no arrival hour is made up. The day: the documented push's date where
// the text gives it (the winter ascents, Buhl in 1953), else a day in the mountain's climbing
// season (the 15th of its last month: src/data/seasons.js), else today.
import { dayOf, nowAt } from './sun'

const minutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
const smooth = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t) }

/**
 * For one route and its stops (ui/Ascent.jsx), a function of the progress t (0..1 along the line)
 * that gives { ymd, minutes, blend } (blend 0 = the usual light, 1 = the clock's), or null. All
 * the astronomy is done here, once; the function is cheap enough for every frame of a scroll.
 */
export function prepareClimbLight(m, route, stops) {
  const push = route?.push
  if (!push) return () => null
  const at = stops.findIndex((s) => s.slug === push.camp || s.aliases?.includes(push.camp))
  if (at < 1) return () => null
  const camp = stops[at], before = stops[at - 1]
  const ymd = push.date || m.seasonDate?.() || nowAt(m).ymd
  const sunrise = dayOf(m, ymd).sunrise ?? 360
  const leaves = push.leaves === 'predawn' ? sunrise - 75 : minutes(push.leaves)
  const evening = leaves >= 720 // an evening departure: the summit day is the next one
  const start = 16 * 60 - (evening ? 0 : 1440) // the afternoon before, on the same clock
  let end = null
  if (push.arrives) { end = minutes(push.arrives); while (end <= leaves) end += 1440 }
  const dawn = sunrise + (evening ? 1440 : 0) + 90
  return (t) => {
    if (t < before.t) return null
    if (t < camp.t) {
      const f = (t - before.t) / Math.max(1e-6, camp.t - before.t)
      return { ymd, minutes: start + (leaves - start) * f, blend: smooth(f / 0.35) }
    }
    const f = Math.min(1, (t - camp.t) / Math.max(1e-6, 1 - camp.t))
    if (end != null) return { ymd, minutes: leaves + (end - leaves) * f, blend: 1 }
    return { ymd, minutes: leaves + (dawn - leaves) * Math.min(1, f / 0.85), blend: 1 - smooth((f - 0.85) / 0.15) }
  }
}

import { useEffect, useMemo, useState } from 'react'
import { useStore, useMountain } from '../store'
import { nowAt, dayOf, clockOf, sunAt, momentAt } from '../lib/sun'
import { compass } from '../lib/weather'
import { fmt } from '../lib/format'
import { t } from '../i18n'

// The explorer's Light: the mountain lit at any hour of today, on its own clock (scene/Terrain.jsx
// works out the sun and its shadows). "Usual" is the site's own late light; "Now" follows the real
// sun there, minute by minute. The slider's track shows today's night and day.

const hhmm = (min) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** "the sun 14° up in the east", "twilight", "night" */
function where(el, az) {
  if (el < -6) return t('night')
  if (el < -0.833) return t('twilight, the sun below the horizon')
  return t('the sun {deg}° up in the {dir}', { deg: fmt(Math.max(0, Math.round(el))), dir: t(compass(az)) })
}

export default function LightControl() {
  const m = useMountain()
  const sun = useStore((s) => s.sun)
  const [, tick] = useState(0)
  // "Now" moves on: the read-out follows it every half minute
  useEffect(() => {
    if (sun.mode !== 'now') return
    const id = setInterval(() => tick((n) => n + 1), 30000)
    return () => clearInterval(id)
  }, [sun.mode])
  const today = nowAt(m).ymd
  const day = useMemo(() => dayOf(m, today), [m, today])
  const set = (v) => useStore.setState({ sun: { ...useStore.getState().sun, ...v } })
  const presets = [
    ['usual', t('Usual')],
    ['dawn', t('Dawn'), (day.sunrise ?? 360) + 20],
    ['noon', t('Noon'), day.noon],
    ['dusk', t('Dusk'), (day.sunset ?? 1080) - 20],
    ['now', t('Now')],
  ]
  const minutes = sun.mode === 'now' ? nowAt(m).minutes : sun.minutes
  const active = sun.mode === 'time' ? presets.find(([, , min]) => min != null && Math.abs(Math.round(min) - sun.minutes) < 1)?.[0] : sun.mode
  const { az, el } = sunAt(momentAt(m, today, minutes), m.peak.lat, m.peak.lon)
  const clock = t('{time} {country} time', { time: hhmm(minutes), country: t(clockOf(m).country) })
  const read = sun.mode === 'usual' ? t('The site’s usual light: a late sun, low in the south-west') : `${clock} · ${where(el, az)}`
  const pct = (min) => `${Math.min(100, Math.max(0, (min / 1440) * 100)).toFixed(1)}%`
  return (
    <div className="light-ctl">
      <h3 className="mono">{t('Light')}</h3>
      <div className="light-presets" role="group" aria-label={t('Light the mountain')}>
        {presets.map(([key, label, min]) => (
          <button key={key} type="button" aria-pressed={active === key}
            onClick={() => (key === 'usual' || key === 'now' ? set({ mode: key }) : set({ mode: 'time', minutes: Math.round(min) }))}>{label}</button>
        ))}
      </div>
      <input
        type="range" className="light-slider" min={0} max={1435} step={5} value={Math.round(minutes) % 1440}
        style={{ '--rise': pct(day.sunrise ?? 0), '--set': pct(day.sunset ?? 1440) }}
        onChange={(e) => set({ mode: 'time', minutes: Number(e.target.value) })}
        aria-label={t('Time of day at the mountain, today')} aria-valuetext={sun.mode === 'usual' ? t('the usual light') : `${clock}, ${where(el, az)}`}
      />
      <p className="light-read mono" aria-live="off">{read}</p>
    </div>
  )
}

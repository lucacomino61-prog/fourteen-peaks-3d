import { useMemo, useRef, useState } from 'react'
import { useStore, useMountain } from '../store'
import { loadWeather, windChill, compass, localTime, localDate } from '../lib/weather'
import { fmt } from '../lib/format'
import { alt as altitude, tempText, windText, windScale, useUnits } from '../lib/units'
import { t, LOCALE } from '../i18n'

// Today's weather on the summit (lib/weather.js): a line in the hero, and a panel in "The numbers"
// with the week's summit wind. Nothing is fetched until the visitor asks (or has the setting on);
// every place the forecast shows, Open-Meteo is credited and it is called a forecast.

const fromText = (deg) => t(`from the ${compass(deg)}`)

function Credit() {
  return (
    <span className="wx-credit">
      <a href="https://open-meteo.com/" rel="noopener">{t('Weather data by Open-Meteo.com')}</a> (<a href="https://open-meteo.com/en/licence" rel="noopener">CC BY 4.0</a>)
    </span>
  )
}

/** The hero's line: ask, loading, the forecast now, or a retry */
export function WeatherLine() {
  const m = useMountain()
  const w = useStore((s) => s.weather)
  const units = useUnits()
  const mine = w?.id === m.id ? w : null
  if (mine?.status === 'ready') {
    return (
      <p className="wx-line">
        <span className="wx-now">{t('Summit now: {temp}, wind {wind} {from}', { temp: tempText(mine.now.temp, units), wind: windText(mine.now.wind, units), from: fromText(mine.now.dir) })}</span>
        <span className="mono">{t('forecast, not a measurement')} · <Credit /></span>
      </p>
    )
  }
  return (
    <p className="wx-line">
      <button type="button" className="wx-ask" onClick={() => loadWeather(m, { asked: true })} aria-busy={mine?.status === 'loading'} disabled={mine?.status === 'loading'}>
        {mine?.status === 'loading' ? t('Loading the summit forecast…') : mine?.status === 'failed' ? t('The forecast didn’t load: try again') : t('Show the weather on the summit')}
      </button>
    </p>
  )
}

/** The week's wind at the summit, every hour: a line, day by day, with a read-out under the pointer */
function WindChart({ w, units }) {
  const hours = w.hours
  const t0 = hours[0].t, t1 = hours[hours.length - 1].t
  const top = Math.max(40, Math.ceil(Math.max(...hours.map((h) => h.wind)) / 20) * 20) // km/h
  const X = (tt) => ((tt - t0) / (t1 - t0)) * 1000
  const Y = (kmh) => (1 - kmh / top) * 1000
  const line = hours.map((h, i) => `${i ? 'L' : 'M'}${X(h.t).toFixed(1)} ${Y(h.wind).toFixed(1)}`).join('')
  // midnights at the mountain, for the day lines and labels
  const days = []
  const first = localDate(w, t0)
  const midnight = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate()) / 1000 - w.offset
  for (let d = midnight; d <= t1; d += 86400) days.push(d)
  const ticks = []
  for (let v = 0; v <= top; v += top > 120 ? 40 : 20) ticks.push(v)
  const [hover, setHover] = useState(null)
  const box = useRef()
  const at = (clientX) => {
    const r = box.current.getBoundingClientRect()
    const tt = t0 + Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * (t1 - t0)
    let best = hours[0]
    for (const h of hours) if (Math.abs(h.t - tt) < Math.abs(best.t - tt)) best = h
    return best
  }
  // "Wed 1": the day at the mountain for a moment (the midday of a day for its label)
  const dayOf = (tt) => localDate(w, tt).toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', timeZone: 'UTC' })
  const unitLabel = units === 'ft' ? 'mph' : 'km/h'
  const scale = windScale(units)
  return (
    <div className="wx-chart">
      <div className="wx-plot" ref={box}
        onPointerMove={(e) => setHover(at(e.clientX))} onPointerLeave={() => setHover(null)} onPointerDown={(e) => setHover(at(e.clientX))}
        role="img" aria-label={t('Wind on the summit, every hour for the next seven days, from {min} to {max}', { min: windText(Math.min(...hours.map((h) => h.wind)), units), max: windText(Math.max(...hours.map((h) => h.wind)), units) })}>
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          {ticks.map((v) => <line key={v} className="wx-grid" x1="0" x2="1000" y1={Y(v)} y2={Y(v)} />)}
          {days.slice(1).map((d) => <line key={d} className="wx-day" x1={X(d)} x2={X(d)} y1="0" y2="1000" />)}
          <path className="wx-area" d={`${line}L1000 1000L0 1000Z`} />
          <path className="wx-line" d={line} />
        </svg>
        <i className="wx-me" style={{ left: `${X(w.now.t) / 10}%`, top: `${Y(w.now.wind) / 10}%` }} aria-hidden="true" />
        {hover && (
          <>
            <i className="wx-x" style={{ left: `${X(hover.t) / 10}%` }} aria-hidden="true" />
            <span className={`wx-read mono ${X(hover.t) > 600 ? 'is-left' : ''}`} style={{ left: `${X(hover.t) / 10}%` }} aria-hidden="true">
              <b>{windText(hover.wind, units)}</b>
              <span>{fromText(hover.dir)} · {tempText(hover.temp, units)}</span>
              <span>{dayOf(hover.t)} {localTime(w, hover.t)}</span>
            </span>
          </>
        )}
        <div className="wx-y mono" aria-hidden="true">
          {ticks.map((v) => <span key={v} style={{ top: `${Y(v) / 10}%` }}>{fmt(Math.round(v * scale))}</span>)}
        </div>
        <span className="wx-unit mono" aria-hidden="true">{t('wind, {unit}', { unit: unitLabel })}</span>
      </div>
      <ol className="wx-days mono" aria-label={t('Day by day')}>
        {days.map((d) => {
          const inDay = hours.filter((h) => h.t >= d && h.t < d + 86400)
          // a day with less than half of it in the forecast (today's evening) has no room for a label
          if (inDay.length < 12) return null
          const peak = Math.max(...inDay.map((h) => h.wind)), cold = Math.min(...inDay.map((h) => h.temp))
          return (
            <li key={d} style={{ left: `${Math.max(0, X(d)) / 10}%`, width: `${((Math.min(t1, d + 86400) - Math.max(t0, d)) / (t1 - t0)) * 100}%` }}>
              <b>{dayOf(d + 43200)}</b>
              <span>{t('max {wind}', { wind: windText(peak, units) })}</span>
              <span>{t('min {temp}', { temp: tempText(cold, units) })}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** The panel in "The numbers": what it is, the button until asked, then now and the week */
export function WeatherPanel() {
  const m = useMountain()
  const w = useStore((s) => s.weather)
  const units = useUnits()
  const mine = w?.id === m.id ? w : null
  const chill = useMemo(() => (mine?.status === 'ready' ? windChill(mine.now.temp, mine.now.wind) : null), [mine])
  return (
    <section className="wx" aria-labelledby="wx-title">
      <h3 id="wx-title" className="wx-title">{t('On the summit this week')}</h3>
      {mine?.status !== 'ready' ? (
        <div className="wx-ask-block">
          <p>{t('A forecast for {height}, from Open-Meteo’s weather models: wind, temperature and wind chill, every hour for seven days. Your browser asks Open-Meteo for it, which sees your internet address; nothing is sent until you ask.', { height: altitude(m.peak.elevation, units) })}</p>
          <button type="button" className="pill" onClick={() => loadWeather(m, { asked: true })} aria-busy={mine?.status === 'loading'} disabled={mine?.status === 'loading'}>
            {mine?.status === 'loading' ? t('Loading the summit forecast…') : mine?.status === 'failed' ? t('The forecast didn’t load: try again') : t('Show the summit forecast')}
          </button>
        </div>
      ) : (
        <>
          <dl className="wx-now-grid">
            <div><dt className="mono">{t('Now, {time} {country} time', { time: localTime(mine, mine.now.t), country: t(mine.country) })}</dt><dd><b>{tempText(mine.now.temp, units)}</b></dd></div>
            <div><dt className="mono">{t('Wind')}</dt><dd><b>{windText(mine.now.wind, units)}</b> <small>{fromText(mine.now.dir)}</small></dd></div>
            <div><dt className="mono">{t('Wind chill')}</dt><dd><b>{tempText(chill, units)}</b></dd></div>
          </dl>
          <WindChart w={mine} units={units} />
          <p className="wx-note">
            {t('A forecast, not a measurement: the models’ values at the 400 and 300 hPa pressure levels, interpolated to the summit’s height. Times are {country} time ({tz}). Wind chill: the North American formula of 2001.', { country: t(mine.country), tz: mine.tz })} <Credit />
          </p>
        </>
      )}
    </section>
  )
}

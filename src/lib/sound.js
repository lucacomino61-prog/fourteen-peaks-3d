// The wind (settings → Sound, off by default). Made in the browser, no audio file: brown noise
// through two filters, a low roar and a narrow whistle, their levels and pitch pushed around by
// gusts. It grows with the altitude of the climb (the altimeter's reading), stays at a middle
// strength over the hero and the explorer, and drops to a murmur while reading below; with the
// summit weather loaded (lib/weather.js) the forecast's wind sets its strength too. Silent while
// the tab is hidden. The gusts are scheduled on GSAP's clock, the page's one timer (lib/clock.js).
// A browser only lets sound start from a tap or a key, so a setting kept on from an earlier visit
// starts with the first one.
import { gsap } from 'gsap'
import { useStore } from '../store'

let ctx = null, master = null, roar = null, whistle = null, roarGain = null, whistleGain = null
let running = false, gustCall = null, level = 0, gust = 0.6
const MAX = 0.32 // the loudest the wind gets (0..1 of full scale)

function build() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  ctx = new AC()
  // four seconds of brown noise (integrated white noise), looped
  const len = ctx.sampleRate * 4
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5 }
  // fade the loop's seam
  for (let i = 0; i < 2048; i++) { const k = i / 2048; d[i] *= k; d[len - 1 - i] *= k }
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  roar = ctx.createBiquadFilter()
  roar.type = 'lowpass'
  roar.frequency.value = 500
  roar.Q.value = 0.6
  whistle = ctx.createBiquadFilter()
  whistle.type = 'bandpass'
  whistle.frequency.value = 900
  whistle.Q.value = 9
  roarGain = ctx.createGain()
  whistleGain = ctx.createGain()
  roarGain.gain.value = 0
  whistleGain.gain.value = 0
  master = ctx.createGain()
  master.gain.value = 0
  src.connect(roar).connect(roarGain).connect(master)
  src.connect(whistle).connect(whistleGain).connect(master)
  master.connect(ctx.destination)
  src.start()
  return true
}

/** How strong the wind is for what's on screen, 0..1 */
function target() {
  const s = useStore.getState()
  if (document.hidden) return 0
  if (s.overviewOpen || s.searchOpen || s.correctionOpen || s.settingsOpen) return 0.12
  let v
  if (s.mode === 'ascent' && s.activeRoute) v = 0.2 + 0.8 * Math.min(1, Math.max(0, ((s.altitude || 5000) - 4500) / 4300))
  else if (s.mode === 'idle') v = 0.12
  else v = 0.5
  // the forecast's wind on the summit, when loaded: calm air a third as loud, a gale half as loud again
  const kmh = s.weather?.now?.wind
  if (kmh != null) v *= Math.min(1.5, Math.max(0.35, kmh / 50))
  return Math.min(1, v)
}

function apply(time = 1.2) {
  if (!ctx || !running) return
  level = target()
  const now = ctx.currentTime
  const g = level * gust
  master.gain.setTargetAtTime(MAX * Math.min(1, level * 1.3), now, time)
  roarGain.gain.setTargetAtTime(0.55 + 0.45 * g, now, time * 0.8)
  roar.frequency.setTargetAtTime(300 + 900 * g, now, time)
  whistleGain.gain.setTargetAtTime(0.02 + 0.5 * Math.max(0, g - 0.35), now, time)
  whistle.frequency.setTargetAtTime(650 + 1100 * g + Math.random() * 120, now, time)
}

/** A new gust every one and a half to four seconds */
function gusts() {
  gust = 0.35 + Math.random() * 0.65
  apply(0.6 + Math.random() * 1.2)
  gustCall = gsap.delayedCall(1.5 + Math.random() * 2.5, gusts)
}

async function start() {
  if (running) return
  if (!ctx && !build()) return
  try { await ctx.resume() } catch { return }
  if (ctx.state !== 'running') return // no gesture yet: waitForGesture tries again
  running = true
  gusts()
}

function stop() {
  running = false
  gustCall?.kill()
  gustCall = null
  if (!ctx) return
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
  setTimeout(() => { if (!running) ctx?.suspend() }, 1200)
}

let waiting = false
function waitForGesture() {
  if (waiting) return
  waiting = true
  const go = () => {
    if (!useStore.getState().settings.sound) return
    start().then(() => {
      if (!running) return
      waiting = false
      for (const e of ['pointerdown', 'keydown', 'touchend']) window.removeEventListener(e, go, true)
    })
  }
  for (const e of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(e, go, true)
}

/** Follows the setting and the page; call once at start-up. */
export function initSound() {
  if (useStore.getState().settings.sound) waitForGesture()
  useStore.subscribe((s, prev) => {
    if (s.settings.sound !== prev.settings.sound) {
      // switched on in the settings: that click is the gesture a browser asks for
      if (s.settings.sound) start().then(() => { if (!running) waitForGesture() })
      else stop()
      return
    }
    if (!running) return
    const moved = s.mode !== prev.mode || s.overviewOpen !== prev.overviewOpen || s.searchOpen !== prev.searchOpen || s.settingsOpen !== prev.settingsOpen || s.correctionOpen !== prev.correctionOpen || s.weather !== prev.weather
    // the altitude: only a clear change (the altimeter moves every frame of a scroll)
    if (moved || Math.abs(target() - level) > 0.04) apply(moved ? 1 : 0.6)
  })
  document.addEventListener('visibilitychange', () => {
    if (!running) return
    if (document.hidden) ctx.suspend()
    else ctx.resume().then(() => apply(0.8))
  })
}

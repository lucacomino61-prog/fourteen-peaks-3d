import { useEffect, useId, useRef } from 'react'
import { useStore } from '../store'
import { lockScroll } from '../lib/clock'
import { t } from '../i18n'
import { X } from './Icons'

const THEMES = [['night', 'Night'], ['day', 'Day'], ['system', 'System']]
const TEXT = [['small', 'Small'], ['default', 'Default'], ['large', 'Large'], ['larger', 'Larger']]
const UNITS = [['m', 'Metres'], ['ft', 'Feet']]

/**
 * One choice among a few: a radio group drawn as a row of pills with a thumb that slides to the
 * choice. Arrow keys move through it and every choice applies at once, so the page is the preview.
 */
function Choice({ name, label, options, value, onChange, note }) {
  const noteId = useId()
  const at = Math.max(0, options.findIndex(([v]) => v === value))
  return (
    <fieldset className="set-row" aria-describedby={note ? noteId : undefined}>
      <legend className="set-name">{label}</legend>
      <div className="seg" style={{ '--n': options.length, '--at': at }}>
        <i className="seg-thumb" aria-hidden />
        {options.map(([v, text]) => (
          <label key={v} className="seg-opt">
            <input type="radio" name={name} value={v} checked={v === value} onChange={() => onChange(v)} />
            <span>{text}</span>
          </label>
        ))}
      </div>
      {note && <p id={noteId} className="set-note">{note}</p>}
    </fieldset>
  )
}

/** On or off, with what it does underneath. */
function Switch({ label, note, checked, onChange }) {
  const noteId = useId()
  return (
    <div className="set-row">
      <button type="button" role="switch" aria-checked={checked} className="toggle set-switch" aria-describedby={note ? noteId : undefined} onClick={() => onChange(!checked)}>
        <span className="set-name">{label}</span><i aria-hidden />
      </button>
      {note && <p id={noteId} className="set-note">{note}</p>}
    </div>
  )
}

/** The settings: a dialog (nav, menu, footer). Kept on this device (lib/settings.js). */
export default function Settings() {
  const open = useStore((s) => s.settingsOpen)
  const settings = useStore((s) => s.settings)
  const motion = useStore((s) => s.motion)
  const setSetting = useStore((s) => s.setSetting)
  const setMotion = useStore((s) => s.setMotion)
  const reset = useStore((s) => s.resetSettings)
  const ref = useRef()

  useEffect(() => {
    const d = ref.current
    if (!open || !d) return
    d.showModal()
    lockScroll(true)
    return () => { if (d.open) d.close(); lockScroll(false) }
  }, [open])

  const close = () => useStore.setState({ settingsOpen: false })

  return (
    <dialog className="settings" ref={ref} onClose={close} aria-labelledby="settings-title" data-lenis-prevent
      onClick={(e) => { if (e.target === ref.current) close() }}>
      <div className="settings-head">
        <h2 id="settings-title">Settings</h2>
        <button type="button" className="close" onClick={close} aria-label="Close settings"><X /></button>
      </div>
      <div className="settings-body">
        <section aria-labelledby="set-look">
          <h3 id="set-look" className="set-group mono">Appearance</h3>
          <Choice name="theme" label="Theme" options={THEMES} value={settings.theme} onChange={(v) => setSetting('theme', v)}
            note="System follows your device’s light or dark setting." />
          <Choice name="text" label="Text size" options={TEXT} value={settings.text} onChange={(v) => setSetting('text', v)} />
        </section>
        <section aria-labelledby="set-units">
          <h3 id="set-units" className="set-group mono">Units</h3>
          <Choice name="units" label="Heights in" options={UNITS} value={settings.units} onChange={(v) => setSetting('units', v)}
            note="The figures, the map labels and the altimeter; the descriptions keep their metres." />
        </section>
        <section aria-labelledby="set-motion">
          <h3 id="set-motion" className="set-group mono">Motion and power</h3>
          <Switch label="Animations" checked={motion === 'on'} onChange={(on) => setMotion(on ? 'on' : 'off')}
            note="The turning mountain, the eased camera and the pulsing markers. Off, everything cuts." />
          <Switch label="Battery saver" checked={settings.saver} onChange={(on) => setSetting('saver', on)}
            note="Lighter terrain and at most 30 frames a second." />
        </section>
        <section aria-labelledby="set-sound">
          <h3 id="set-sound" className="set-group mono">{t('Sound')}</h3>
          <Switch label={t('Wind')} checked={settings.sound} onChange={(on) => setSetting('sound', on)}
            note={t('Wind that grows stronger as you climb, and follows the summit forecast when it is shown. Made in your browser from noise: nothing is downloaded.')} />
        </section>
        <section aria-labelledby="set-weather">
          <h3 id="set-weather" className="set-group mono">{t('Summit weather')}</h3>
          <Switch label={t('Load the forecast by itself')} checked={settings.weather} onChange={(on) => setSetting('weather', on)}
            note={t('For each mountain you open, without asking each time. Your browser asks Open-Meteo for it, which sees your internet address.')} />
        </section>
        <section aria-labelledby="set-notify">
          <h3 id="set-notify" className="set-group mono">Notifications</h3>
          <Switch label="Confirmations" checked={settings.confirmations} onChange={(on) => setSetting('confirmations', on)}
            note="Short messages such as “Link copied”. Errors always show." />
          <Switch label="What’s new" checked={settings.whatsNew} onChange={(on) => setSetting('whatsNew', on)}
            note="On a later visit, a note when the site has been updated." />
        </section>
      </div>
      <div className="settings-foot">
        <button type="button" className="btn-ghost btn-small" onClick={reset}>Reset to defaults</button>
        <span className="mono">Saved on this device</span>
        <button type="button" className="btn-solid" onClick={close}>Done</button>
      </div>
    </dialog>
  )
}

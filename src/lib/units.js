// Heights in metres or feet (the settings). The data is in metres; what the page shows is
// converted here. Prose (descriptions, history) keeps its metres: the setting says so.
import { useStore } from '../store'
import { fmt } from './format'
import { toF } from './air'

const FEET = 3.28084

/** The unit in use: 'm' | 'ft' */
export const currentUnits = () => useStore.getState().settings.units

/** A height as a number in the unit in use (feet to the foot: K2 is 28,251 ft) */
export const inUnits = (m, units = currentUnits()) => (units === 'ft' ? Math.round(m * FEET) : m)

/** "8,611 m" or "28,251 ft" (no-break space) */
export const alt = (m, units = currentUnits()) => `${fmt(inUnits(m, units))}\u00a0${units === 'ft' ? 'ft' : 'm'}`

/** "m" | "ft" */
export const unitSymbol = (units = currentUnits()) => (units === 'ft' ? 'ft' : 'm')

/** "metres" | "feet" */
export const unitName = (units = currentUnits()) => (units === 'ft' ? 'feet' : 'metres')

/**
 * A short fact written in metres ("3,600 m", "about 4,500 m to 8,200 m") in the unit in use.
 * Only for short values from the data (route facts, the numbers), never for prose.
 */
export const metresText = (text, units = currentUnits()) =>
  units === 'ft' && typeof text === 'string'
    ? text.replace(/(\d{1,3}(?:,\d{3})+|\d+)(\s|\u00a0)m\b/g, (_, n, sp) => `${fmt(Math.round(Number(n.replace(/,/g, '')) * FEET))}${sp}ft`)
    : text

/** The unit in use, as a React subscription (components re-render when it changes). */
export const useUnits = () => useStore((s) => s.settings.units)

// The weather's units follow the same setting: metres go with °C and km/h, feet with °F and mph.
const MPH = 1.609344
/** "-31 °C" or "-24 °F" */
export const tempText = (c, units = currentUnits()) => (units === 'ft' ? `${fmt(Math.round(toF(c)))} °F` : `${fmt(Math.round(c))} °C`)
/** "73 km/h" or "45 mph" */
export const windText = (kmh, units = currentUnits()) => (units === 'ft' ? `${fmt(Math.round(kmh / MPH))} mph` : `${fmt(Math.round(kmh))} km/h`)
export const windScale = (units = currentUnits()) => (units === 'ft' ? 1 / MPH : 1)

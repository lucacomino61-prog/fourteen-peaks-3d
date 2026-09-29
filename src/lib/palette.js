// Two colours carry the site, night and snow; the signal orange marks only what needs marking:
// the active route, the altimeter's dot, the 8,000 m line and the gravest hazards.
// The CSS tokens in index.css hold the same values.
export const NIGHT = '#0b0d12'
export const SNOW = '#ecebe6'
export const SIGNAL = '#ff5b2e'

/** A route's line and camps: the signal when it is the active one, snow otherwise. */
export const routeColor = (isActive) => (isActive ? SIGNAL : SNOW)

/** Hazard severity 5 is the signal; 3 and 4 stay snow (and are drawn dashed). */
export const hazardColor = (severity) => (severity >= 5 ? SIGNAL : SNOW)

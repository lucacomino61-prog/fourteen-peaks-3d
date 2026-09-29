// The elevation model (Copernicus GLO-30, 30 m cells) rounds off sharp summits: near each peak it
// tops out 24–242 m below the surveyed height. The 3D keeps the model's shape, so anything that
// states an altitude has to correct for the gap: the altimeter pins itself to the documented
// camp and summit heights (src/ui/Ascent.jsx), and the 8,000 m layer uses the threshold below.

/** The correction grows from nothing to the full gap over this many metres below the model's summit. */
const RAMP_M = 1000

/** Model altitude (m) at which the corrected altitude reaches `realM`, for a summit the model puts at `modelTopM`. */
export function modelAltitudeFor(realM, modelTopM, surveyedM) {
  const gap = Math.max(0, surveyedM - modelTopM)
  const base = modelTopM - RAMP_M
  if (realM <= base || gap === 0) return realM
  // corrected = model + gap · (model − base) / RAMP_M, solved for model
  return (realM * RAMP_M + gap * base) / (RAMP_M + gap)
}

/** Where the Death Zone starts in model metres for one loaded terrain and its peak. */
export function deathZoneModelAltitude(terrain, peak) {
  const modelTop = terrain.snapToPeak(peak.lat, peak.lon).y * 1000
  return modelAltitudeFor(8000, modelTop, peak.elevation)
}

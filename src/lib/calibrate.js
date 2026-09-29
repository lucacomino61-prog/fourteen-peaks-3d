// The elevation model (Copernicus GLO-30, 30 m cells) rounds off sharp summits: near each peak it
// tops out 24–242 m below the surveyed height. The 3D keeps the model's shape, so anything that
// states an altitude corrects for the gap: the altimeter pins itself to the documented camp and
// summit heights (src/ui/Ascent.jsx), and the 8,000 m layer, the loupe's contours and its
// read-out use the ramp below, which grows from nothing to the full gap over the top RAMP_M.

/** The correction grows from nothing to the full gap over this many metres below the model's summit. */
const RAMP_M = 1000

/** { gapM, baseM, rampM } for one loaded terrain and its peak. */
export function heightCalibration(terrain, peak) {
  const topM = terrain.snapToPeak(peak.lat, peak.lon).y * 1000
  return { gapM: Math.max(0, peak.elevation - topM), baseM: topM - RAMP_M, rampM: RAMP_M }
}

/** Corrected altitude (m) for a model altitude. */
export function realAltitude(modelM, { gapM, baseM, rampM }) {
  return modelM + gapM * Math.min(1, Math.max(0, (modelM - baseM) / rampM))
}

/** Model altitude (m) at which the corrected altitude reaches `realM` (the inverse of realAltitude). */
export function modelAltitude(realM, { gapM, baseM, rampM }) {
  if (realM <= baseM || gapM === 0) return realM
  // real = model + gap · (model − base) / ramp, solved for model
  return Math.min(realM, (realM * rampM + gapM * baseM) / (rampM + gapM))
}

/** Where the Death Zone starts in model metres for one loaded terrain and its peak. */
export function deathZoneModelAltitude(terrain, peak) {
  return modelAltitude(8000, heightCalibration(terrain, peak))
}

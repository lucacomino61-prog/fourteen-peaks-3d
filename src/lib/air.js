// The air at a height, estimated: shown next to the altimeter as the climb goes up (ui/Ascent.jsx).
//
// Pressure: J. B. West's model atmosphere for high mountains, PB = exp(6.63268 − 0.1112 h − 0.00149 h²)
// mmHg with h in km (J Appl Physiol 1996, 81(4):1850–1854), which predicts the pressures measured at
// high-altitude sites to within about 1%. The standard atmosphere reads a few percent low there: the
// air over the Himalaya and the Karakoram in the climbing seasons is warmer, and so thicker, than
// its mid-latitude average. Oxygen stays a fifth of the air at any height, so the share of sea-level
// pressure is also the share of oxygen in each breath.
//
// Boiling point: the Antoine equation for water, log10 P = 8.07131 − 1730.63 / (233.426 + T), with P
// in mmHg and T in °C (valid from about −20 to 100 °C).

const SEA_LEVEL_MMHG = 760

/** Barometric pressure (mmHg) at a height in metres */
export const pressureMmHg = (m) => {
  const h = m / 1000
  return Math.exp(6.63268 - 0.1112 * h - 0.00149 * h * h)
}

/** The pressure as a share of sea level's, 0..1 */
export const airShare = (m) => pressureMmHg(m) / SEA_LEVEL_MMHG

/** Where water boils (°C) at a height in metres */
export const boilingC = (m) => 1730.63 / (8.07131 - Math.log10(pressureMmHg(m))) - 233.426

export const toF = (c) => (c * 9) / 5 + 32

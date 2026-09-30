// The fourteen's figures as numbers, for the comparison table (ui/Overview.jsx). They come from
// each mountain's own "numbers" (src/data/<id>.js), found by the stat's English label (its `key`,
// fixed before any translation): a figure a mountain doesn't give stays empty and shows as a dash,
// never guessed.

/** "≈ 12,000" → 12000, "1954" → 1954, "8.611" (Italian) → 8611 */
const num = (s) => {
  const m = /\d[\d,.]*/.exec(String(s ?? ''))
  return m ? Number(m[0].replace(/[,.](?=\d{3}(\D|$))/g, '')) : null
}

export function figures(m) {
  const stat = (...keys) => m.stats.find((s) => keys.includes(s.key || s.label))
  const first = stat('First ascent'), summits = stat('Summits', 'True summits'), deaths = stat('Deaths')
  const winter = stat('Winter ascent', 'Winter ascents')
  // K2 gives the count of winter ascents with the date in its note ("January 2021")
  const winterYear = winter ? (/^\d{4}$/.test(String(winter.value).trim()) ? Number(winter.value) : num(/\d{4}/.exec(winter.note || '')?.[0])) : null
  return {
    height: m.peak.elevation,
    first: num(first?.value),
    summits: num(summits?.value), summitsText: summits?.value || null, trueSummits: (summits?.key || summits?.label) === 'True summits', summitsNote: summits?.note,
    deaths: num(deaths?.value), deathsText: deaths?.value || null,
    winter: winterYear,
  }
}

// When each of the fourteen is climbed: the months of its season (or seasons), a line saying so,
// and the sources it rests on, each of them read for this (1 = January). Shown in "The numbers",
// the comparison table and the fact sheet; a day in the season also sets the sun of a summit night
// on the climb when the route's own text gives no date (lib/climbLight.js).
import { LANG, LOCALE } from '../i18n/lang.js'

const HT_2026 = 'The Himalayan Times, “Spring 2026 climbing season opens with summits on three 8,000ers”, 19 April 2026'
const EW_NEPAL = 'Explorersweb, “Everest and Other 8,000’ers in Nepal By the Numbers”, 5 December 2025'
const KP_MANASLU = 'The Kathmandu Post, “Manaslu climbing season begins”, 25 September 2025'
const EW_DHAULAGIRI = 'Explorersweb, “Dhaulagiri Summits”, 30 September 2025'
const NESTLER_TIBET = 'Stefan Nestler, “Summit successes reported on Shishapangma and Cho Oyu”, abenteuer-berg.de, 4 October 2024'
const EW_TIBET = 'Explorersweb, “No Shisha Pangma, No Cho Oyu This Spring”, 19 March 2025'
const EW_SHISHA = 'Explorersweb, “Record Seekers to Flock Back To Shisha Pangma after 2023 Tragedy”, 16 February 2024'
const WP_K2 = 'Wikipedia, “K2”'
const EW_KARAKORAM = 'Explorersweb, “Climbers Adapt to a Warmer Karakoram”, 22 June 2026'
const EW_2022 = 'Explorersweb, “Summits on Broad Peak, No O2 on Nanga Parbat, Casualty on GII”, 5 July 2022'

export const seasons = {
  everest: { months: [4, 5], note: 'Spring, before the monsoon: expeditions spend April acclimatising, and the summit window opens in May.', sources: [HT_2026, EW_NEPAL] },
  lhotse: { months: [4, 5], note: 'Spring, alongside Everest, whose route it shares as far as the Lhotse Face; many Everest climbers climb Lhotse too.', sources: [EW_NEPAL, HT_2026] },
  kangchenjunga: { months: [4, 5], note: 'Spring, before the monsoon; the summit window opens in May.', sources: [HT_2026] },
  makalu: { months: [4, 5], note: 'Spring, before the monsoon: in 2026 the first summits came on 18 April.', sources: [HT_2026] },
  annapurna: { months: [4, 5], note: 'Spring, often early in it: in 2026 the first summits came on 18 April.', sources: [HT_2026] },
  dhaulagiri: { months: [4, 5, 9, 10], note: 'Spring and autumn, either side of the monsoon: summits in late September 2025, and on 17 and 18 April 2026.', sources: [HT_2026, EW_DHAULAGIRI] },
  manaslu: { months: [9, 10], note: 'Autumn, after the monsoon, the season considered its best.', sources: [KP_MANASLU] },
  chooyu: { months: [4, 5, 9, 10], note: 'Spring and autumn, from Tibet, whenever the Chinese authorities open it to foreign expeditions (they kept it closed in spring 2025).', sources: [NESTLER_TIBET, EW_TIBET] },
  shishapangma: { months: [4, 5, 9, 10], note: 'Spring and autumn, from Tibet. Its summit slopes are more prone to avalanches in autumn: in Ralf Dujmovits’s words, it is “much safer to climb in April–May than it is in September/October”.', sources: [EW_SHISHA, NESTLER_TIBET, EW_TIBET] },
  k2: { months: [7, 8], note: 'The Karakoram summer: most ascents are made in July and August.', sources: [WP_K2, EW_KARAKORAM] },
  broadpeak: { months: [6, 7, 8], note: 'The Karakoram summer, from the end of June: in 2022 the first summits came on 5 July.', sources: [EW_KARAKORAM, EW_2022] },
  gasherbrum1: { months: [6, 7, 8], note: 'The Karakoram summer, from the end of June to August.', sources: [EW_KARAKORAM] },
  gasherbrum2: { months: [6, 7, 8], note: 'The Karakoram summer, from the end of June to August.', sources: [EW_KARAKORAM, EW_2022] },
  nangaparbat: { months: [6, 7], note: 'Summer, and early in it: in 2025 the teams reached base camp by 6 June and the first summits came on 30 June.', sources: [EW_KARAKORAM] },
}

// an Italian page reads the notes in Italian (src/data/it/seasons.js); the sources are cited as published
if (LANG === 'it') {
  const { default: notes } = await import('./it/seasons.js')
  for (const [id, note] of Object.entries(notes)) if (seasons[id]) seasons[id].note = note
}

/** The months in runs: [4, 5, 9, 10] → [[4, 5], [9, 10]] */
export function monthRuns(months) {
  const runs = []
  for (const m of [...months].sort((a, b) => a - b)) {
    const last = runs[runs.length - 1]
    if (last && m === last[last.length - 1] + 1) last.push(m)
    else runs.push([m])
  }
  return runs
}

/** A month's name in the page's language: 'narrow' (A), 'short' (Apr), 'long' (April) */
export const monthName = (m, style, locale = LOCALE) => new Date(Date.UTC(2026, m - 1, 1)).toLocaleDateString(locale, { month: style, timeZone: 'UTC' })

/** "Apr–May, Sep–Oct" */
export const seasonText = (months, style = 'short', locale = LOCALE) => monthRuns(months).map((run) => (run.length > 1 ? `${monthName(run[0], style, locale)}–${monthName(run[run.length - 1], style, locale)}` : monthName(run[0], style, locale))).join(', ')

/** A day in the mountain's (first) season this year, 'YYYY-MM-DD': the 15th of its last month */
export function seasonDate(id, year = new Date().getUTCFullYear()) {
  const s = seasons[id]
  if (!s) return null
  const run = monthRuns(s.months)[0]
  return `${year}-${String(run[run.length - 1]).padStart(2, '0')}-15`
}

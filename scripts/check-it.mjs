// The Italian against the English (npm run check:it). Every text of the mountains, the glossary, the
// seasons and the interface is paired with its English, and:
//   - nothing is missing, and the overlays have the data's shape (camps, figures, incidents, years);
//   - every number in the English is in the Italian, and no other (8,611 → 8611, 28,251 → 28.251,
//     1.5 → 1,5; "2nd" → "2ª"): a translation may reword, never change a figure, a date or a height;
//   - the Italian writes its numbers the Italian way (no "8,611");
//   - every text the interface asks for (t('…') in src/) has its Italian, and every glossary
//     expression finds its own term.
// Exits 1 on any problem.
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const root = path.resolve(import.meta.dirname, '..')
const vite = await createServer({ root, logLevel: 'silent', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
const load = (p) => vite.ssrLoadModule(p)
const { mountains } = await load('/src/data/index.js')
const { mountains: it } = await load('/src/data/it/index.js')
const { glossary } = await load('/src/data/glossary.js')
const { default: itGlossary } = await load('/src/data/it/glossary.js')
const { seasons } = await load('/src/data/seasons.js')
const { default: itSeasons } = await load('/src/data/it/seasons.js')
const { default: table } = await load('/src/i18n/it.js')
await vite.close()

const problems = []
const note = (where, what) => problems.push(`${where}: ${what}`)

// ---- numbers
const ORD = /(\d+)(?:st|nd|rd|th|ª|º|°(?=\s*(?:grado|posto)))/g // "2nd", "2ª": the number alone
/** The numbers in a text, as values: English writes 8,611 and 1.5; Italian 8611, 28.251 and 1,5 */
function numbers(text, lang) {
  const out = []
  const s = String(text ?? '').replace(ORD, '$1')
  for (const [tok] of s.matchAll(/\d+(?:[.,]\d+)*/g)) {
    let v = tok
    if (lang === 'en') v = /^\d{1,3}(,\d{3})+$/.test(v) ? v.replace(/,/g, '') : v.replace(/,/g, ' ')
    else v = /^\d{1,3}(\.\d{3})+$/.test(v) ? v.replace(/\./g, '') : v.replace(/,/g, '.')
    for (const part of v.split(' ')) out.push(String(Number(part)))
  }
  return out.sort()
}
const diff = (a, b) => { const left = [...a]; const extra = []; for (const x of b) { const i = left.indexOf(x); if (i >= 0) left.splice(i, 1); else extra.push(x) } return { missing: left, extra } }

/** One English text and its Italian: present, the same numbers, written the Italian way */
function pair(where, en, itText) {
  if (en == null || en === '') return
  if (itText == null || itText === '') { note(where, 'no Italian'); return }
  // a name may stay as it is; a sentence may not
  if (itText === en && /\b(the|and|of|on|in|to|from|with|by|is|a|an|for|at|its)\b/i.test(en)) note(where, `the Italian is the English: ${JSON.stringify(en.slice(0, 60))}`)
  const { missing, extra } = diff(numbers(en, 'en'), numbers(itText, 'it'))
  if (missing.length || extra.length) note(where, `numbers differ: missing ${missing.join(', ') || '–'}; extra ${extra.join(', ') || '–'}\n      EN ${en}\n      IT ${itText}`)
  if (/\d,\d{3}(?!\d)/.test(itText)) note(where, `English thousands separator in the Italian: ${JSON.stringify(itText.match(/\S*\d,\d{3}\S*/)[0])}`)
}

// ---- the mountains
const PEAK = ['aka', 'range', 'countries', 'tagline', 'summitText', 'summitBlurb', 'figuresLead', 'otherLines', 'historyTitle', 'historyLead']
const ROUTE = ['name', 'aka', 'firstAscent', 'share', 'difficulty', 'verticalGain', 'summary']
for (const m of mountains) {
  const o = it[m.id]
  if (!o) { note(m.id, 'no Italian overlay'); continue }
  for (const f of PEAK) pair(`${m.id}.peak.${f}`, m.peak[f], o.peak?.[f])
  for (const id of Object.keys(o.routes || {})) if (!m.routes.some((r) => r.id === id)) note(`${m.id}.routes`, `no route "${id}" in the data`)
  for (const r of m.routes) {
    const ro = o.routes?.[r.id]
    if (!ro) { note(`${m.id}.routes.${r.id}`, 'no Italian'); continue }
    for (const f of ROUTE) pair(`${m.id}.${r.id}.${f}`, r[f], ro[f])
    if ((ro.camps || []).length !== r.camps.length) note(`${m.id}.${r.id}.camps`, `${(ro.camps || []).length} in Italian, ${r.camps.length} in the data`)
    r.camps.forEach((c, i) => { pair(`${m.id}.${r.id}.camps[${i}].name`, c.name, ro.camps?.[i]?.[0]); pair(`${m.id}.${r.id}.camps[${i}].blurb`, c.blurb, ro.camps?.[i]?.[1]) })
    if (r.finish) { pair(`${m.id}.${r.id}.finish.title`, r.finish.title, ro.finish?.title); pair(`${m.id}.${r.id}.finish.body`, r.finish.body, ro.finish?.body) }
  }
  for (const id of Object.keys(o.hazards || {})) if (!m.hazards.some((h) => h.id === id)) note(`${m.id}.hazards`, `no hazard "${id}" in the data`)
  for (const h of m.hazards) {
    const ho = o.hazards?.[h.id]
    if (!ho) { note(`${m.id}.hazards.${h.id}`, 'no Italian'); continue }
    for (const f of ['name', 'kind', 'blurb']) pair(`${m.id}.${h.id}.${f}`, h[f], ho[f])
    const inc = h.incidents || []
    if ((ho.incidents || []).length !== inc.length) note(`${m.id}.${h.id}.incidents`, `${(ho.incidents || []).length} in Italian, ${inc.length} in the data`)
    inc.forEach((x, i) => pair(`${m.id}.${h.id}.incidents[${i}]`, x, ho.incidents?.[i]))
  }
  if ((o.stats || []).length !== m.stats.length) note(`${m.id}.stats`, `${(o.stats || []).length} in Italian, ${m.stats.length} in the data`)
  m.stats.forEach((s, i) => { const w = o.stats?.[i] || []; pair(`${m.id}.stats[${i}].label`, s.label, w[0]); pair(`${m.id}.stats[${i}].value`, s.value, w[1]); pair(`${m.id}.stats[${i}].note`, s.note, w[2]) })
  for (const y of Object.keys(o.timeline || {})) if (!m.timeline.some((e) => String(e.year) === y)) note(`${m.id}.timeline`, `no year ${y} in the data`)
  for (const e of m.timeline) { const w = o.timeline?.[e.year] || []; pair(`${m.id}.${e.year}.title`, e.title, w[0]); pair(`${m.id}.${e.year}.text`, e.text, w[1]) }
}

// ---- the glossary: the Italian term, its expression (which must find the term), the definition
for (const g of glossary) {
  const w = itGlossary[g.id]
  if (!w) { note(`glossary.${g.id}`, 'no Italian'); continue }
  pair(`glossary.${g.id}.term`, g.term, w.term)
  pair(`glossary.${g.id}.def`, g.def, w.def)
  try {
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${w.match})(?![\\p{L}\\p{N}])`, w.cased ? 'u' : 'iu')
    const term = w.cased ? w.term.toLowerCase() : w.term
    if (!re.test(term)) note(`glossary.${g.id}.match`, `"${w.match}" does not find "${term}"`)
  } catch (e) { note(`glossary.${g.id}.match`, e.message) }
}
for (const [id, s] of Object.entries(seasons)) pair(`seasons.${id}`, s.note, itSeasons[id])

// ---- the interface: every t('…') and tl(lang, '…') key in src/ has its Italian
const keys = new Set()
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name)
    if (f.isDirectory()) { if (!['it'].includes(f.name)) walk(p) }
    else if (/\.(jsx?|mjs)$/.test(f.name)) {
      const src = fs.readFileSync(p, 'utf8')
      for (const m of src.matchAll(/\b(?:t|tr|tl\(\w+,)\s*\(\s*'((?:[^'\\]|\\.)*)'/g)) keys.add(m[1].replace(/\\'/g, "'"))
      for (const m of src.matchAll(/\bplural\([^,]+,\s*'((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'/g)) { keys.add(m[1]); keys.add(m[2]) }
      for (const m of src.matchAll(/\btl\(\s*\w+\s*,\s*'((?:[^'\\]|\\.)*)'/g)) keys.add(m[1].replace(/\\'/g, "'"))
    }
  }
}
walk(path.join(root, 'src'))
const missingKeys = [...keys].filter((k) => !(k in table))
for (const k of missingKeys) note('interface', `no Italian for ${JSON.stringify(k)}`)
for (const [k, v] of Object.entries(table)) {
  const need = [...k.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join()
  const have = [...String(v).matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort().join()
  if (need !== have) note('interface', `placeholders differ for ${JSON.stringify(k)}: {${need}} vs {${have}}`)
  const { missing, extra } = diff(numbers(k.replace(/\{\w+\}/g, ''), 'en'), numbers(String(v).replace(/\{\w+\}/g, ''), 'it'))
  if (missing.length || extra.length) note('interface', `numbers differ for ${JSON.stringify(k)}: missing ${missing.join(', ') || '–'}; extra ${extra.join(', ') || '–'}`)
}
// the table's last group holds the keys built at run time (a compass point, a country…): no search
// of the code finds them, so they don't count as unused
const itSource = fs.readFileSync(path.join(root, 'src/i18n/it.js'), 'utf8')
const runtime = new Set([...itSource.slice(itSource.indexOf('// built at run time')).matchAll(/^\s*'((?:[^'\\]|\\.)*)':/gm)].map((m) => m[1]))
const unused = Object.keys(table).filter((k) => !keys.has(k) && !runtime.has(k))

console.log(`${mountains.length} mountains, ${glossary.length} glossary terms, ${Object.keys(seasons).length} seasons, ${keys.size} interface texts (${unused.length} Italian entries no longer used${unused.length ? `: ${unused.slice(0, 8).map((k) => JSON.stringify(k.slice(0, 40))).join(', ')}${unused.length > 8 ? '…' : ''}` : ''})`)
if (problems.length) {
  console.log(`\n${problems.length} problems:\n${problems.slice(0, 400).map((p) => `  ${p}`).join('\n')}`)
  process.exit(1)
}
console.log('the Italian matches the English')

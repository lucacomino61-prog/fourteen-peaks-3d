import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { byRank } from '../data'
import { alt } from '../lib/units'
import { lockScroll } from '../lib/clock'
import { goTo } from '../lib/navigate'
import { track } from '../lib/analytics'
import { t, plural } from '../i18n'
import { Search as SearchIcon, X } from './Icons'

// case- and accent-insensitive, and "8,611" finds 8611
const norm = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/(\d),(\d)/g, '$1$2')

/** Everything a visitor might look for, across all fourteen. */
function buildIndex() {
  const items = []
  for (const m of byRank) {
    const p = m.peak
    items.push({ type: 'Peak', label: p.name, sub: `${alt(p.elevation)} · ${p.range} · ${p.countries}`, text: `${p.name} ${p.aka || ''} ${p.range} ${p.countries} ${p.elevation}`, go: { mountain: m.id } })
    m.routes.forEach((r) => {
      items.push({ type: 'Route', label: r.name, sub: `${p.name} · ${r.aka}`, text: `${r.name} ${r.aka} ${p.name} ${r.firstAscent || ''}`, go: { mountain: m.id, route: r.id } })
      r.camps.forEach((c, k) => items.push({ type: 'Camp', label: c.name, sub: `${r.name}, ${p.name} · ${alt(c.alt)}`, text: `${c.name} ${r.name} ${p.name} ${c.alt}`, go: { mountain: m.id, route: r.id, camp: `${r.id}:${k}:${c.name}` } }))
    })
    m.hazards.forEach((h) => items.push({ type: 'Hazard', label: h.name, sub: `${p.name} · ${h.kind}`, text: `${h.name} ${h.kind} ${p.name} ${h.alt}`, go: { mountain: m.id, hazard: h.id } }))
    m.timeline.forEach((e) => items.push({ type: 'History', label: `${e.year} · ${e.title}`, sub: p.name, text: `${e.year} ${e.title} ${e.text} ${p.name}`, go: { mountain: m.id, year: e.year } }))
  }
  return items.map((it, i) => ({ ...it, id: `sr-${i}`, key: norm(it.label), hay: norm(`${it.label} ${it.text}`) }))
}

const WEIGHT = { Peak: 12, Route: 9, Hazard: 6, Camp: 4, History: 3 }
function find(index, query, here) {
  const q = norm(query).trim()
  if (!q) return index.filter((it) => it.type === 'Peak')
  const words = q.split(/\s+/)
  const hits = []
  for (const it of index) {
    if (!words.every((w) => it.hay.includes(w))) continue
    // the mountain on screen first: "camp 4" on K2's page means K2's camps
    const s = (it.key === q ? 100 : it.key.startsWith(q) ? 60 : it.key.includes(q) ? 30 : 0) + WEIGHT[it.type] + (it.go.mountain === here ? 20 : 0)
    hits.push([s, it])
  }
  return hits.sort((a, b) => b[0] - a[0]).slice(0, 40).map((h) => h[1])
}

/** Search the fourteen: a dialog with a combobox (arrow keys move, Enter goes, Escape closes). */
export default function Search() {
  const open = useStore((s) => s.searchOpen)
  const here = useStore((s) => s.mountainId)
  const ref = useRef()
  const input = useRef()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const index = useMemo(() => (open ? buildIndex() : []), [open])
  const results = useMemo(() => find(index, query, here), [index, query, here])

  useEffect(() => {
    const d = ref.current
    if (!open || !d) return
    setQuery('')
    setActive(0)
    d.showModal()
    input.current?.focus()
    lockScroll(true)
    return () => { if (d.open) d.close(); lockScroll(false) }
  }, [open])

  // keep the highlighted result in view
  useEffect(() => { document.getElementById(results[active]?.id)?.scrollIntoView({ block: 'nearest' }) }, [active, results])

  const close = () => useStore.setState({ searchOpen: false })
  const go = (it) => {
    if (!it) return
    track('Search', { type: it.type, length: query.trim().length })
    close()
    goTo(it.go)
  }
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[active]) }
    // a search field's own Escape only clears it: here one press closes the search
    else if (e.key === 'Escape') { e.preventDefault(); close() }
  }

  return (
    <dialog className="search" ref={ref} onClose={close} aria-labelledby="search-label" data-lenis-prevent
      onClick={(e) => { if (e.target === ref.current) close() }}>
      <div className="search-box">
        <div className="search-field">
          <SearchIcon />
          <label id="search-label" htmlFor="search-input" className="visually-hidden">{t('Search the fourteen peaks')}</label>
          <input
            id="search-input" ref={input} type="search" value={query} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" enterKeyHint="go"
            placeholder={t('Peaks, routes, camps, hazards, years…')}
            role="combobox" aria-expanded={results.length > 0} aria-controls="search-results" aria-autocomplete="list"
            aria-activedescendant={results[active]?.id}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }} onKeyDown={onKey}
          />
          <button type="button" className="close" onClick={close} aria-label={t('Close search')}><X /></button>
        </div>
        <ul id="search-results" className="search-results" role="listbox" aria-label={query ? t('Results') : t('The fourteen peaks')}>
          {results.map((it, i) => (
            <li key={it.id} id={it.id} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''}
              onMouseMove={() => { if (i !== active) setActive(i) }} onClick={() => go(it)}>
              <span className="type mono">{t(it.type)}</span>
              <span className="txt"><b translate={it.type === 'Peak' ? 'no' : undefined}>{it.label}</b><small>{it.sub}</small></span>
            </li>
          ))}
        </ul>
        <p className="search-status" role="status">
          {query.trim() && !results.length ? t('Nothing matches “{q}”. Try a peak, a route, a camp or a year.', { q: query.trim() }) : query.trim() ? plural(results.length, '{n} result', '{n} results') : ''}
        </p>
        <p className="search-hint mono" aria-hidden="true">{t('↑ ↓ to move · Enter to go · Esc to close')}</p>
      </div>
    </dialog>
  )
}

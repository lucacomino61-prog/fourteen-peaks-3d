import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { glossary, termById } from '../data/glossary'
import { useStore } from '../store'
import { t, withLang } from '../i18n'
import { X } from './Icons'

// The glossary where the words are (src/data/glossary.js): in a text, the first occurrence of each
// known term (three at most, so a paragraph doesn't turn into a list of links) becomes a button
// with a dotted underline; pressing it opens the definition beside it, with a link to all of them.

// whole words, letters of any alphabet (arête); no lookbehind, which older Safari can't parse
const RULES = glossary.map((g) => ({ id: g.id, re: new RegExp(`(^|[^\\p{L}\\p{N}])(${g.match})(?![\\p{L}\\p{N}])`, 'iu') }))

/** The marked terms of a text: [{ id, start, end }], in order, never overlapping, `max` at most */
function marksIn(text, max = 3) {
  const found = []
  for (const r of RULES) {
    const m = r.re.exec(text)
    if (!m) continue
    const start = m.index + m[1].length
    found.push({ id: r.id, start, end: start + m[2].length })
  }
  found.sort((a, b) => a.start - b.start)
  const out = []
  for (const f of found) {
    if (out.length >= max) break
    if (out.length && f.start < out[out.length - 1].end) continue
    out.push(f)
  }
  return out
}

/** A text with its terms marked. `tabbable` false keeps the buttons out of the tab order (a hidden card). */
export default function Glossed({ text, tabbable = true }) {
  const parts = useMemo(() => {
    if (!text) return []
    const out = []
    let at = 0
    for (const m of marksIn(String(text))) {
      if (m.start > at) out.push(text.slice(at, m.start))
      out.push({ id: m.id, text: text.slice(m.start, m.end) })
      at = m.end
    }
    if (at < text.length) out.push(text.slice(at))
    return out
  }, [text])
  const openId = useStore((s) => s.term?.id)
  return parts.map((p, i) => (typeof p === 'string' ? p : (
    <button key={i} type="button" className="term" aria-haspopup="dialog" aria-expanded={openId === p.id} tabIndex={tabbable ? 0 : -1}
      onClick={(e) => { e.stopPropagation(); useStore.setState({ term: openId === p.id ? null : { id: p.id, anchor: e.currentTarget } }) }}>
      {p.text}
    </button>
  )))
}

/** The definition, beside the word that opened it; Escape, a press elsewhere or a scroll closes it. */
export function TermPopover() {
  const term = useStore((s) => s.term)
  const g = term ? termById[term.id] : null
  const box = useRef()
  const [pos, setPos] = useState(null)
  useLayoutEffect(() => {
    if (!term?.anchor || !box.current) { setPos(null); return }
    const a = term.anchor.getBoundingClientRect(), b = box.current.getBoundingClientRect()
    const pad = 12
    const below = a.bottom + 8 + b.height < window.innerHeight - pad
    const top = below ? a.bottom + 8 : Math.max(pad, a.top - 8 - b.height)
    const left = Math.min(window.innerWidth - pad - b.width, Math.max(pad, a.left + a.width / 2 - b.width / 2))
    setPos({ top, left })
  }, [term])
  useEffect(() => {
    if (!term) return
    const close = () => useStore.setState({ term: null })
    const onKey = (e) => { if (e.key === 'Escape') { close(); term.anchor?.focus?.() } }
    const onDown = (e) => { if (box.current && !box.current.contains(e.target) && e.target !== term.anchor) close() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('scroll', close, { passive: true })
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('scroll', close)
      window.removeEventListener('resize', close)
    }
  }, [term])
  // once placed (it is hidden while measured, and a hidden element takes no focus), the definition
  // takes the focus, so a screen reader reads it and Tab moves through its link
  useEffect(() => { if (pos) box.current?.focus({ preventScroll: true }) }, [pos])
  if (!g) return null
  return (
    <div className="term-pop" ref={box} role="dialog" aria-labelledby="term-pop-title" tabIndex={-1}
      style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden', top: 0, left: 0 }}>
      <p id="term-pop-title" className="term-pop-title">{g.term}</p>
      <p>{g.def}</p>
      <a href={`${withLang('/glossary/')}#${g.id}`}>{t('All the terms')}</a>
      <button type="button" className="close" onClick={() => { useStore.setState({ term: null }); term.anchor?.focus?.() }} aria-label={t('Close')}><X /></button>
    </div>
  )
}

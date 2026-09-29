import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { byId, byRank } from '../data'
import { lockScroll } from '../lib/clock'
import { track } from '../lib/analytics'
import { campaign } from '../lib/utm'
import { X } from './Icons'

// Where corrections go: the form service at VITE_FORM_ENDPOINT (Formspree, Web3Forms, a Worker…
// anything that takes a JSON POST), or else a prefilled issue in the site's public repository.
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || ''
const REPO_URL = 'https://github.com/lucacomino61-prog/fourteen-peaks-3d'
const TOPICS = ['A route, camp or hazard position', 'An altitude or a figure', 'A date, a name or history', 'Something else']
const EMPTY = { topic: TOPICS[0], details: '', source: '', email: '', website: '' }

function validate(v) {
  const e = {}
  const details = v.details.trim()
  if (details.length < 20) e.details = details ? 'Say a little more: what is wrong, and what should it say? (20 characters at least)' : 'Write what is wrong and what it should say.'
  else if (details.length > 2000) e.details = `Keep it under 2,000 characters (now ${details.length.toLocaleString('en-GB')}).`
  if (v.source.trim()) {
    let ok = false
    try { ok = /^https?:$/.test(new URL(v.source.trim()).protocol) } catch { /* not an address */ }
    if (!ok) e.source = 'Paste the full address of the source, starting with https://, or leave it empty.'
  }
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Check the email address, or leave it empty.'
  return e
}
const LABELS = { details: 'What should change', source: 'Source', email: 'Your email' }

/** "Suggest a correction": a dialog with the form, its checks, and a confirmation before discarding. */
export default function Correction() {
  const open = useStore((s) => s.correctionOpen)
  const current = useStore((s) => s.mountainId)
  const dialog = useRef()
  const confirm = useRef()
  const summary = useRef()
  const [mountain, setMountain] = useState(current)
  const [v, setV] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('editing') // editing | sending | sent | github | failed
  const started = useRef(false)

  useEffect(() => {
    const d = dialog.current
    if (!open || !d) return
    setMountain(useStore.getState().mountainId)
    setV({ ...EMPTY, details: open.about ? `${open.about}: ` : '' })
    setErrors({})
    setStatus('editing')
    started.current = false
    d.showModal()
    lockScroll(true)
    track('Correction opened', { mountain: useStore.getState().mountainId })
    requestAnimationFrame(() => d.querySelector('#fix-details')?.focus())
    return () => { if (d.open) d.close(); lockScroll(false) }
  }, [open])

  const dirty = status !== 'sent' && status !== 'github' && (v.details.trim().length > (open?.about?.length || 0) + 2 || v.source.trim() || v.email.trim())
  const shut = () => useStore.setState({ correctionOpen: false })
  // closing with something written asks first
  const requestClose = () => {
    if (dirty) confirm.current?.showModal()
    else shut()
  }
  const discard = () => { confirm.current?.close(); track('Correction discarded', { mountain }); shut() }

  const change = (field) => (e) => {
    const value = e.target.value
    setV((old) => ({ ...old, [field]: value }))
    if (!started.current) { started.current = true; track('Correction started', { mountain }) }
    // an error clears as soon as the field is right
    if (errors[field]) setErrors((old) => { const next = { ...old }; if (!validate({ ...v, [field]: value })[field]) delete next[field]; return next })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const found = validate(v)
    setErrors(found)
    if (Object.keys(found).length) {
      track('Correction invalid', { fields: Object.keys(found).join(',') })
      requestAnimationFrame(() => summary.current?.focus())
      return
    }
    if (v.website) { setStatus('sent'); return } // the hidden field only robots fill in
    const m = byId[mountain]
    const payload = {
      mountain: m.peak.name, topic: v.topic, details: v.details.trim(), source: v.source.trim(), email: v.email.trim(),
      page: `${location.origin}/${mountain}/`, came_from: campaign().utm_source || '',
    }
    if (!ENDPOINT) {
      // no form service: the correction goes as a prefilled public issue (the visitor submits it there)
      const body = `**Mountain:** ${payload.mountain}\n**About:** ${payload.topic}\n\n${payload.details}\n\n**Source:** ${payload.source || '(none given)'}\n\n_From ${payload.page}_`
      window.open(`${REPO_URL}/issues/new?${new URLSearchParams({ title: `Correction: ${payload.mountain}, ${payload.topic.toLowerCase()}`, body })}`, '_blank', 'noopener')
      track('Correction sent', { mountain, via: 'github' })
      setStatus('github')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(String(res.status))
      track('Correction sent', { mountain, via: 'form' })
      setStatus('sent')
    } catch (err) {
      track('Correction failed', { mountain, reason: String(err?.message || 'network').slice(0, 40) })
      setStatus('failed')
    }
  }

  const errorList = Object.keys(errors)
  const field = (name) => ({ id: `fix-${name}`, name, value: v[name], onChange: change(name), 'aria-invalid': errors[name] ? true : undefined, 'aria-describedby': [errors[name] && `fix-${name}-error`, `fix-${name}-hint`].filter(Boolean).join(' ') })

  return (
    // React passes the confirm dialog's own close/cancel up to these handlers: only this dialog's count
    <dialog className="fix" ref={dialog} aria-labelledby="fix-title" data-lenis-prevent
      onCancel={(e) => { if (e.target !== dialog.current) return; e.preventDefault(); requestClose() }}
      onClose={(e) => { if (e.target === dialog.current) shut() }}
      onClick={(e) => { if (e.target === dialog.current) requestClose() }}>
      <div className="fix-box">
        <div className="fix-head">
          <h2 id="fix-title">Suggest a correction</h2>
          <button type="button" className="close" onClick={requestClose} aria-label="Close"><X /></button>
        </div>

        {status === 'sent' || status === 'github' ? (
          <div className="fix-done" role="status">
            <p className="fix-done-title">{status === 'sent' ? 'Thank you. Your correction is on its way.' : 'Your correction is ready on GitHub.'}</p>
            <p>{status === 'sent'
              ? 'It will be checked against the source before the page changes.'
              : 'Submit the issue in the tab that opened to send it; nothing is sent until you do. No tab? Your browser may have blocked it: allow pop-ups for this site and press Continue again.'}</p>
            <div className="fix-actions">
              {status === 'github' && <button type="button" className="btn-ghost" onClick={() => setStatus('editing')}>Back to the form</button>}
              <button type="button" className="btn-solid" onClick={shut}>Close</button>
            </div>
          </div>
        ) : (
          <form className="fix-form" onSubmit={submit} noValidate>
            <p className="fix-lead">Seen a wrong altitude, date or line? Tell us what it should say, with a source if you have one.</p>

            {errorList.length > 0 && (
              <div className="fix-summary" role="alert" tabIndex={-1} ref={summary}>
                <p>{errorList.length === 1 ? 'One thing to fix before sending:' : `${errorList.length} things to fix before sending:`}</p>
                <ul>{errorList.map((k) => <li key={k}><a href={`#fix-${k}`} onClick={(e) => { e.preventDefault(); document.getElementById(`fix-${k}`)?.focus() }}>{LABELS[k]}: {errors[k]}</a></li>)}</ul>
              </div>
            )}

            <div className="fix-row">
              <div className="fix-field">
                <label htmlFor="fix-mountain">Mountain</label>
                <select id="fix-mountain" value={mountain} onChange={(e) => setMountain(e.target.value)}>
                  {byRank.map((m) => <option key={m.id} value={m.id}>{m.peak.name}</option>)}
                </select>
              </div>
              <div className="fix-field">
                <label htmlFor="fix-topic">About</label>
                <select id="fix-topic" value={v.topic} onChange={change('topic')}>
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="fix-field">
              <label htmlFor="fix-details">What should change <span className="req">required</span></label>
              <textarea {...field('details')} rows={5} maxLength={2400} required autoCapitalize="sentences" />
              <p className="fix-hint" id="fix-details-hint">What the page says, what it should say, and how you know.</p>
              {errors.details && <p className="fix-error" id="fix-details-error">{errors.details}</p>}
            </div>

            <div className="fix-field">
              <label htmlFor="fix-source">Source <span className="opt">optional</span></label>
              <input {...field('source')} type="url" inputMode="url" autoComplete="off" autoCapitalize="off" spellCheck="false" placeholder="https://" />
              <p className="fix-hint" id="fix-source-hint">A book, an article or an expedition report online.</p>
              {errors.source && <p className="fix-error" id="fix-source-error">{errors.source}</p>}
            </div>

            {ENDPOINT && (
              <div className="fix-field">
                <label htmlFor="fix-email">Your email <span className="opt">optional</span></label>
                <input {...field('email')} type="email" inputMode="email" autoComplete="email" autoCapitalize="off" spellCheck="false" />
                <p className="fix-hint" id="fix-email-hint">Only to answer you. See the <a href="/privacy/">privacy page</a>.</p>
                {errors.email && <p className="fix-error" id="fix-email-error">{errors.email}</p>}
              </div>
            )}

            {/* for robots only: people never see or fill this */}
            <div className="fix-trap" aria-hidden="true">
              <label htmlFor="fix-website">Website</label>
              <input id="fix-website" name="website" tabIndex={-1} autoComplete="off" value={v.website} onChange={change('website')} />
            </div>

            {status === 'failed' && (
              <p className="fix-error fix-failed" role="alert">It didn’t go through (no connection, or the form service is down). Your text is still here: try again in a moment.</p>
            )}

            <div className="fix-actions">
              <button type="button" className="btn-ghost" onClick={requestClose}>Cancel</button>
              <button type="submit" className="btn-solid" aria-busy={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : status === 'failed' ? 'Try again' : ENDPOINT ? 'Send correction' : 'Continue on GitHub'}
              </button>
            </div>
            {!ENDPOINT && <p className="fix-hint">Corrections are collected as public issues in the site’s repository; you need a GitHub account to submit one.</p>}
          </form>
        )}
      </div>

      <dialog className="confirm" ref={confirm} aria-labelledby="confirm-title" aria-describedby="confirm-text">
        <h3 id="confirm-title">Discard this correction?</h3>
        <p id="confirm-text">What you wrote will be lost.</p>
        <div className="fix-actions">
          <button type="button" className="btn-ghost" onClick={() => confirm.current?.close()} autoFocus>Keep writing</button>
          <button type="button" className="btn-danger" onClick={discard}>Discard</button>
        </div>
      </dialog>
    </dialog>
  )
}

import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { answer, analyticsName } from '../lib/analytics'
import { t, withLang } from '../i18n'

/**
 * The question about visit counting. It only exists when counting is set up for the build and the
 * visitor hasn't answered (lib/analytics.js); the footer's "Privacy choices" asks again. Not a
 * wall: the page works around it, and "No" is as easy as "Yes".
 */
export default function Consent() {
  const open = useStore((s) => s.consentOpen)
  const ref = useRef()
  useEffect(() => { if (open === 'asked') ref.current?.focus() }, [open])
  if (!open) return null
  const reply = (yes) => { answer(yes); useStore.setState({ consentOpen: false, toast: { text: yes ? t('Thanks: visits are counted, without cookies') : t('Understood: nothing is counted'), at: Date.now() } }) }
  return (
    <section className="consent" aria-labelledby="consent-title" ref={ref} tabIndex={-1}>
      <h2 id="consent-title">{t('Count this visit?')}</h2>
      <p>{t('This site sets no cookies. With your OK, {name} counts visits anonymously, so we can see which mountains and routes people open.', { name: analyticsName })} <a href={withLang('/privacy/')}>{t('Privacy')}</a></p>
      <div className="consent-actions">
        <button type="button" className="btn-solid" onClick={() => reply(true)}>{t('Count my visit')}</button>
        <button type="button" className="btn-ghost" onClick={() => reply(false)}>{t('No thanks')}</button>
      </div>
    </section>
  )
}

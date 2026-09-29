// The plain pages (privacy, terms, 404): fonts, tokens, their layout, and the visit-counting
// choice on the privacy page, which the app's consent card reads (lib/analytics.js).
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/archivo'
import '@fontsource-variable/jetbrains-mono'
import '../base.css'
import './page.css'
import { CONSENT_KEY, refusedByBrowser } from '../lib/consent.js'

const choice = document.querySelector('[data-choice]')
if (choice) {
  const state = choice.querySelector('[data-choice-state]')
  const buttons = [...choice.querySelectorAll('[data-choice-set]')]
  const read = () => { try { return localStorage.getItem(CONSENT_KEY) } catch { return null } }
  const paint = () => {
    const v = read()
    if (refusedByBrowser()) {
      state.textContent = 'your browser asks sites not to track it, so nothing is counted'
      buttons.forEach((b) => { b.hidden = true })
      return
    }
    state.textContent = v === 'yes' ? 'count my visits' : v === 'no' ? 'don’t count them' : 'not given yet'
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.choiceSet === v)))
  }
  buttons.forEach((b) => b.addEventListener('click', () => {
    try { localStorage.setItem(CONSENT_KEY, b.dataset.choiceSet) } catch { /* private window: nothing to remember */ }
    paint()
  }))
  choice.hidden = false
  paint()
}

// The plain pages (privacy, terms, 404): fonts, tokens, their layout, and the visit-counting
// choice on the privacy page, which the app's consent card reads (lib/analytics.js).
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/archivo'
import '@fontsource-variable/jetbrains-mono'
import '../base.css'
import './page.css'
import { CONSENT_KEY, refusedByBrowser } from '../lib/consent.js'

// the answer's words in the page's language (it/privacy/ is Italian)
const WORDS = document.documentElement.lang === 'it'
  ? { refused: 'il tuo browser chiede ai siti di non tracciarlo, quindi non viene contato nulla', yes: 'conta le mie visite', no: 'non contarle', none: 'non ancora data' }
  : { refused: 'your browser asks sites not to track it, so nothing is counted', yes: 'count my visits', no: 'don’t count them', none: 'not given yet' }

const choice = document.querySelector('[data-choice]')
if (choice) {
  const state = choice.querySelector('[data-choice-state]')
  const buttons = [...choice.querySelectorAll('[data-choice-set]')]
  const read = () => { try { return localStorage.getItem(CONSENT_KEY) } catch { return null } }
  const paint = () => {
    const v = read()
    if (refusedByBrowser()) {
      state.textContent = WORDS.refused
      buttons.forEach((b) => { b.hidden = true })
      return
    }
    state.textContent = v === 'yes' ? WORDS.yes : v === 'no' ? WORDS.no : WORDS.none
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.choiceSet === v)))
  }
  buttons.forEach((b) => b.addEventListener('click', () => {
    try { localStorage.setItem(CONSENT_KEY, b.dataset.choiceSet) } catch { /* private window: nothing to remember */ }
    paint()
  }))
  choice.hidden = false
  paint()
}

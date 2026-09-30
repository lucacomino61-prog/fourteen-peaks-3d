// The interface's words. The English text is the key: t('Climb a route') gives the text in the page's
// language, and English where no translation exists (a development warning says which). {name}
// placeholders are filled from the second argument. The Italian table (./it.js) is loaded only on
// Italian pages, before anything is drawn (a top-level await), so no English flashes first. The
// build (vite.config.js) registers the tables itself and asks with tl(lang, …).
import { LANG } from './lang.js'

export { LANG, LOCALE, LOCALES, withLang, stripLang, langOf, prefixOf, LANGS } from './lang.js'

const tables = {}
const missing = new Set()

/** Makes a language's table available to tl() (the page's own is registered below). */
export function registerTable(lang, table) { tables[lang] = table }

if (LANG === 'it') registerTable('it', (await import('./it.js')).default)

const fill = (text, vars) => (vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text)

/** The text for `key` in a given language */
export function tl(lang, key, vars) {
  if (lang === 'en') return fill(key, vars)
  const hit = tables[lang]?.[key]
  if (hit === undefined) {
    if (!missing.has(key)) { missing.add(key); if (typeof console !== 'undefined' && (typeof window === 'undefined' || import.meta.env?.DEV)) console.warn(`[i18n] no ${lang} for: ${key}`) }
    return fill(key, vars)
  }
  return fill(hit, vars)
}

/** The text for `key` in the page's language */
export const t = (key, vars) => tl(LANG, key, vars)

/** One form or the other by count: plural(3, '{n} route', '{n} routes') */
export const plural = (n, one, many) => t(n === 1 ? one : many, { n })

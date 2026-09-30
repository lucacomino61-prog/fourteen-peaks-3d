// The page's language comes from its address: /it/… is Italian, everything else English. A switch
// of language is a new page (the address changes), so the language is fixed for a page's life and
// nothing here needs to react to it. The build (vite.config.js, in Node) passes a language itself.

export const LANGS = ['en', 'it']

/** 'en' | 'it' for an address path */
export const langOf = (pathname) => (/^\/it(\/|$)/.test(pathname || '') ? 'it' : 'en')

export const LANG = typeof location === 'undefined' ? 'en' : langOf(location.pathname)

/** Number and date formats: 8,611 m in English, 8611 m (and 28.251 ft) in Italian. */
export const LOCALES = { en: 'en-GB', it: 'it-IT' }
export const LOCALE = LOCALES[LANG]

/** '' | '/it': what goes in front of every path inside the site */
export const prefixOf = (lang) => (lang === 'it' ? '/it' : '')

/** A path inside the site in a language: ('/k2/', 'it') → '/it/k2/' */
export const withLang = (path, lang = LANG) => `${prefixOf(lang)}${path}`

/** The path without its language: '/it/k2/' → '/k2/' */
export const stripLang = (pathname) => (pathname || '/').replace(/^\/it(?=\/|$)/, '') || '/'

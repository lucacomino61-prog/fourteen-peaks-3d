import { LANG, stripLang, withLang } from '../i18n'

// The same page in the other language: the address as it is now (a route or a stop of the climb
// keeps its place), with its hash. Each language names itself in its own words.
const OTHER = LANG === 'it' ? { lang: 'en', label: 'English' } : { lang: 'it', label: 'Italiano' }
const here = () => (typeof location === 'undefined' ? '/' : withLang(stripLang(location.pathname), OTHER.lang) + location.hash)

// the address moves as the page scrolls (lib/address.js): the link reads it again just before it
// is followed, opened in a new tab or copied
const refresh = (e) => { e.currentTarget.href = here() }

export default function LangSwitch({ className }) {
  return (
    <a className={className} href={here()} hrefLang={OTHER.lang} lang={OTHER.lang} onClick={refresh} onAuxClick={refresh} onContextMenu={refresh}>
      {OTHER.label}
    </a>
  )
}

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { mountains } from './src/data/index.js'
import { glossary, glossarySources } from './src/data/glossary.js'
import { siteName, siteDescription, mountainPath, routePath, routeStops, mountainTitle, mountainDescription, routeTitle, routeDescription, stopTitle, stopDescription } from './src/lib/meta.js'
import { PREPAINT } from './src/lib/settings.js'
import { LOCALES, withLang } from './src/i18n/lang.js'
import { registerTable } from './src/i18n/index.js'
import itTable from './src/i18n/it.js'
import { mountains as itWords } from './src/data/it/index.js'
import itGlossary from './src/data/it/glossary.js'
import itSeasons from './src/data/it/seasons.js'
import { localized } from './src/data/localize.js'

const PLACEHOLDER_URL = 'https://fourteen-peaks.example'
const REPO_URL = 'https://github.com/lucacomino61-prog/fourteen-peaks-3d'

/** The date of the last commit: the site's "last updated" (today when git has none). */
function lastUpdated() {
  try {
    return execSync('git log -1 --format=%cs', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}
const longDate = (iso, lang = 'en') => new Date(`${iso}T12:00:00Z`).toLocaleDateString(LOCALES[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// the languages the site is built in (each language's pages live under its prefix: /it/…)
const LANGS = ['en', 'it']
const OG_LOCALE = { en: 'en_GB', it: 'it_IT' }
// the interface's Italian for tl('it', …), and the fourteen and the glossary in each language: the
// English data, and Italian copies with src/data/it/ laid over them (the app lays them in place)
registerTable('it', itTable)
const PEAKS = { en: mountains, it: mountains.map((m) => localized(m, itWords[m.id], itSeasons[m.id])) }
const peakIn = (lang, id) => PEAKS[lang].find((m) => m.id === id)
const GLOSSARY = { en: glossary, it: glossary.map((g) => ({ ...g, ...itGlossary[g.id] })) }

/**
 * The pages behind the app: one HTML file per mountain (/k2/), route (/k2/abruzzi/) and stop of a
 * climb (/k2/abruzzi/camp-4/), each with its own title, description, canonical address, link
 * preview and structured data; the sitemap and robots.txt; the policy texts that depend on how the
 * build is set up (analytics, corrections); the last-updated date. SITE_URL (the address the site
 * is served from) makes every link absolute; without it the build uses a placeholder domain and
 * says so.
 */
function sitePages(env) {
  const site = (env.SITE_URL || PLACEHOLDER_URL).replace(/\/+$/, '')
  const updated = lastUpdated()
  const analytics = env.VITE_ANALYTICS && env.VITE_ANALYTICS_SRC && env.VITE_ANALYTICS_SITE ? env.VITE_ANALYTICS : null
  const analyticsName = { plausible: 'Plausible Analytics', umami: 'Umami' }[analytics] || analytics
  const analyticsPolicy = { plausible: 'https://plausible.io/data-policy', umami: 'https://umami.is/privacy' }[analytics]
  const formHost = (() => { try { return new URL(env.VITE_FORM_ENDPOINT).host } catch { return '' } })()

  const image = (name) => `${site}/og/${name}.jpg`
  /** `path` is the page's address without its language; every language's version is named */
  const headBlock = ({ lang, path: p, title, description, img, imgAlt, jsonLd }) => [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${site}${withLang(p, lang)}" />`,
    ...(LANGS.length > 1 ? [...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${site}${withLang(p, l)}" />`), `<link rel="alternate" hreflang="x-default" href="${site}${p}" />`] : []),
    `<meta property="og:site_name" content="${esc(siteName(lang))}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:locale" content="${OG_LOCALE[lang]}" />`,
    ...LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
    `<meta property="og:url" content="${site}${withLang(p, lang)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${img}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${esc(imgAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<meta name="twitter:image:alt" content="${esc(imgAlt)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
  const website = (lang) => ({ '@type': 'WebSite', name: siteName(lang), url: `${site}${withLang('/', lang)}`, inLanguage: lang })
  const posterAlt = (name, lang) => (lang === 'it' ? `${name} in 3D, il suo nome in grande dietro la montagna` : `${name} in 3D, its name set large behind the mountain`)
  const homeHead = (lang) => headBlock({
    lang, path: '/', title: siteName(lang), description: siteDescription(lang), img: image('home'),
    imgAlt: posterAlt('Everest', lang),
    jsonLd: {
      '@context': 'https://schema.org', ...website(lang), description: siteDescription(lang), dateModified: updated,
      hasPart: PEAKS[lang].map((m) => ({ '@type': 'WebPage', name: mountainTitle(m, lang), url: `${site}${mountainPath(m.id, lang)}` })),
    },
  })
  const mountainAbout = (m) => ({
    '@type': 'Mountain', name: m.peak.name, alternateName: m.peak.aka?.split(' · ').filter(Boolean),
    geo: { '@type': 'GeoCoordinates', latitude: m.peak.lat, longitude: m.peak.lon, elevation: m.peak.elevation },
  })
  const crumbs = (lang, items) => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${site}${url}` })),
  })
  const mountainHead = (m, lang) => headBlock({
    lang, path: mountainPath(m.id, 'en'), title: mountainTitle(m, lang), description: mountainDescription(m, lang), img: image(m.id),
    imgAlt: posterAlt(m.peak.name, lang),
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'WebPage', name: mountainTitle(m, lang), url: `${site}${mountainPath(m.id, lang)}`,
      description: mountainDescription(m, lang), inLanguage: lang, dateModified: updated, isPartOf: website(lang), about: mountainAbout(m),
    },
  })
  const routeHead = (m, r, lang) => headBlock({
    lang, path: routePath(m.id, r.id, null, 'en'), title: routeTitle(m, r, lang), description: routeDescription(m, r), img: image(m.id),
    imgAlt: posterAlt(m.peak.name, lang),
    jsonLd: {
      '@context': 'https://schema.org', '@graph': [
        { '@type': 'WebPage', name: routeTitle(m, r, lang), url: `${site}${routePath(m.id, r.id, null, lang)}`, description: routeDescription(m, r), inLanguage: lang, dateModified: updated, isPartOf: website(lang), about: mountainAbout(m) },
        crumbs(lang, [[m.peak.name, mountainPath(m.id, lang)], [r.name, routePath(m.id, r.id, null, lang)]]),
      ],
    },
  })
  const stopHead = (m, r, slug, stop, lang, canonicalRoute) => {
    const place = stop.kind === 'summit'
      ? mountainAbout(m)
      : { '@type': 'Place', name: stop.name, ...(stop.lat != null ? { geo: { '@type': 'GeoCoordinates', latitude: stop.lat, longitude: stop.lon, elevation: stop.alt } } : {}), containedInPlace: mountainAbout(m) }
    return headBlock({
      lang, path: routePath(m.id, canonicalRoute.id, slug, 'en'), title: stopTitle(m, r, stop, lang), description: stopDescription(m, r, stop), img: image(m.id),
      imgAlt: posterAlt(m.peak.name, lang),
      jsonLd: {
        '@context': 'https://schema.org', '@graph': [
          { '@type': 'WebPage', name: stopTitle(m, r, stop, lang), url: `${site}${routePath(m.id, r.id, slug, lang)}`, description: stopDescription(m, r, stop), inLanguage: lang, dateModified: updated, isPartOf: website(lang), about: place },
          crumbs(lang, [[m.peak.name, mountainPath(m.id, lang)], [r.name, routePath(m.id, r.id, null, lang)], [stop.name, routePath(m.id, r.id, slug, lang)]]),
        ],
      },
    })
  }
  const pageHead = ({ slug, title, description }, lang) => headBlock({
    lang, path: `/${slug}/`, title: `${title} · ${siteName(lang)}`, description, img: image('home'),
    imgAlt: posterAlt('Everest', lang),
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: `${site}${withLang(`/${slug}/`, lang)}`, inLanguage: lang, dateModified: updated, isPartOf: website(lang) },
  })
  const PAGES = {
    en: {
      privacy: { slug: 'privacy', title: 'Privacy', description: 'What this site keeps and sends: no cookies, no accounts; your settings in your browser, the summit weather only when you ask for it, and visit counting only with your agreement.' },
      terms: { slug: 'terms', title: 'Terms of use', description: 'How to use the fourteen 8,000 m peaks in 3D: an educational model, not for navigation, with its data sources and their terms.' },
      guess: { slug: 'guess', title: 'Guess the mountain', description: 'Ten of the fourteen 8,000 m peaks drawn as contour maps from their elevation models. Can you name them?' },
      glossary: { slug: 'glossary', title: 'Glossary', description: 'The climbing words of the fourteen 8,000 m peaks in plain terms: serac, couloir, col, cornice, the Death Zone, alpine style and more.' },
    },
    it: {
      privacy: { slug: 'privacy', title: 'Privacy', description: 'Cosa conserva e invia questo sito: niente cookie, niente account; le tue impostazioni nel tuo browser, il meteo in vetta solo quando lo chiedi, e il conteggio delle visite solo con il tuo consenso.' },
      terms: { slug: 'terms', title: 'Condizioni d’uso', description: 'Come usare le quattordici vette di 8000 m in 3D: un modello didattico, non per la navigazione, con le sue fonti di dati e le loro condizioni.' },
      guess: { slug: 'guess', title: 'Indovina la montagna', description: 'Dieci delle quattordici vette di 8000 m disegnate a curve di livello dai loro modelli di elevazione. Sai riconoscerle?' },
      glossary: { slug: 'glossary', title: 'Glossario', description: 'Le parole dell’alpinismo delle quattordici vette di 8000 m spiegate semplici: seracco, canalone, colle, cornice, la zona della morte, lo stile alpino e altro.' },
    },
  }

  // the parts of the policy pages that follow the build's settings, in each language
  const analyticsText = (lang) => {
    if (!analytics) return lang === 'it'
      ? '<p>Questo sito non conta le visite. Non carica script di analisi, pubblicità o tracciamento.</p>'
      : '<p>This site does not count visits. It loads no analytics, advertising or tracking script.</p>'
    return lang === 'it'
      ? `<p>Solo se sei d’accordo, questo sito conta le visite con <a href="${analyticsPolicy}">${analyticsName}</a>, che non usa cookie e non crea profili personali: quali pagine e montagne vengono aperte, il sito da cui arriva il link, l’etichetta di campagna del link (<code>utm_…</code>), e paese, browser e tipo di dispositivo, tutto conteggiato in forma aggregata. Se il tuo browser invia Global Privacy Control o Do Not Track, non ti viene chiesto nulla e non viene contato nulla.</p>
      <p class="choice" data-choice hidden>La tua risposta: <b data-choice-state>non data</b>. <button type="button" data-choice-set="yes">Conta le mie visite</button> <button type="button" data-choice-set="no">Non contarle</button></p>`
      : `<p>Only if you agree, this site counts visits with <a href="${analyticsPolicy}">${analyticsName}</a>, which sets no cookies and keeps no personal profile: which pages and mountains are opened, the site that linked here, the campaign tag of the link (<code>utm_…</code>), and country, browser and device type, all counted in aggregate. If your browser sends Global Privacy Control or Do Not Track, you are not asked and nothing is counted.</p>
      <p class="choice" data-choice hidden>Your answer: <b data-choice-state>not given</b>. <button type="button" data-choice-set="yes">Count my visits</button> <button type="button" data-choice-set="no">Don’t count them</button></p>`
  }
  const correctionsText = (lang) => {
    if (formHost) return lang === 'it'
      ? `<p>Se usi «Suggerisci una correzione», ciò che scrivi, la pagina in cui ti trovavi e, solo se lo indichi, il tuo indirizzo email vengono inviati al servizio di moduli su <code>${esc(formHost)}</code> e da lì alla persona che gestisce questo sito. Sono usati solo per verificare e correggere le informazioni del sito, e per risponderti se hai chiesto una risposta.</p>`
      : `<p>If you use “Suggest a correction”, what you write, the page you were on and, only if you give it, your email address are sent to the form service at <code>${esc(formHost)}</code> and on to the person who runs this site. They are used only to check and fix the site’s information, and to answer you if you asked for an answer.</p>`
    return lang === 'it'
      ? `<p>«Suggerisci una correzione» apre una nuova segnalazione nel <a href="${REPO_URL}">repository pubblico GitHub</a> del sito con il tuo testo già inserito. Non viene inviato nulla finché non la invii tu, lì, con il tuo account GitHub, dove chiunque può leggerla.</p>`
      : `<p>“Suggest a correction” opens a new issue in the site’s <a href="${REPO_URL}">public GitHub repository</a> with your text filled in. Nothing is sent until you submit it there, under your own GitHub account, where anyone can read it.</p>`
  }

  const peakLinks = (lang) => mountains.map((m) => `<li><a href="${mountainPath(m.id, lang)}"><b translate="no">${esc(m.peak.name)}</b> <span class="mono">${m.peak.elevation.toLocaleString(LOCALES[lang])} m</span></a></li>`).join('\n          ')
  // the glossary page, from the same data as the words marked in the app (src/data/glossary.js)
  const glossaryList = (terms) => [...terms].sort((a, b) => a.term.localeCompare(b.term)).map((g) => `<div id="${g.id}"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join('\n        ')
  const glossarySourceList = (sources) => sources.map((s) => `<li>${esc(s)}</li>`).join('\n        ')

  /**
   * Every page the app answers to, per language: [path without language, head(lang)].
   * A hazard on several routes gets a page on each; the first route that lists it is canonical.
   */
  const appPages = () => {
    const out = []
    for (const en of mountains) {
      // each language's head is written from that language's copy of the mountain (PEAKS)
      const M = (lang) => peakIn(lang, en.id)
      out.push([mountainPath(en.id, 'en'), (lang) => mountainHead(M(lang), lang)])
      const firstRouteOf = {}
      for (const r of en.routes) for (const id of r.hazards) firstRouteOf[id] ||= r.id
      for (const r of en.routes) {
        const R = (lang) => M(lang).routes.find((x) => x.id === r.id)
        out.push([routePath(en.id, r.id, null, 'en'), (lang) => routeHead(M(lang), R(lang), lang)])
        for (const [slug, stop] of routeStops(en, r)) {
          const camp = stop.kind === 'camp' ? r.camps.find((c) => c.slug === slug) : null
          const hz = stop.kind === 'hazard' ? en.hazards.find((h) => h.id === slug) : null
          const where = camp || hz ? { lat: (camp || hz).lat, lon: (camp || hz).lon } : {}
          const canonical = hz ? firstRouteOf[slug] : r.id
          out.push([routePath(en.id, r.id, slug, 'en'), (lang) => {
            const m = M(lang), route = R(lang)
            return stopHead(m, route, slug, { ...routeStops(m, route).get(slug), ...where }, lang, { id: canonical })
          }])
        }
      }
    }
    return out
  }

  let warned = false
  let outDir = path.resolve('dist')
  const withHead = (html, head) => html.replace(/<!-- head:page -->[\s\S]*?<!-- \/head:page -->/, `<!-- head:page -->\n    ${head}\n    <!-- /head:page -->`)
  return {
    name: 'site-pages',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir) },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const file = ctx.filename.replace(/\\/g, '/')
        // the Italian pages are their own files under it/ (it/privacy/index.html…)
        const lang = path.relative(process.cwd(), ctx.filename).split(path.sep)[0] === 'it' ? 'it' : 'en'
        const P = PAGES[lang]
        let head = ''
        if (file.endsWith('/404.html')) head = ''
        else if (/\/privacy\/index\.html$/.test(file)) head = pageHead(P.privacy, lang)
        else if (/\/terms\/index\.html$/.test(file)) head = pageHead(P.terms, lang)
        else if (/\/guess\/index\.html$/.test(file)) head = pageHead(P.guess, lang)
        else if (/\/glossary\/index\.html$/.test(file)) head = pageHead(P.glossary, lang)
        else head = homeHead(lang)
        return html
          // the visitor's theme and text size (lib/settings.js) before anything is drawn
          .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <script>${PREPAINT}</script>`)
          .replace(/<!-- head:page -->[\s\S]*?<!-- \/head:page -->/, head ? `<!-- head:page -->\n    ${head}\n    <!-- /head:page -->` : '$&')
          .replaceAll('%LAST_UPDATED%', longDate(updated, lang))
          .replaceAll('%LAST_UPDATED_ISO%', updated)
          .replaceAll('%REPO_URL%', REPO_URL)
          .replace('<!-- policy:analytics -->', analyticsText(lang))
          .replace('<!-- policy:corrections -->', correctionsText(lang))
          .replace('<!-- list:peaks -->', peakLinks(lang))
          .replace('<!-- list:glossary -->', glossaryList(GLOSSARY[lang]))
          .replace('<!-- list:glossary-sources -->', glossarySourceList(glossarySources))
      },
    },
    // after the build: a copy of the app's page for every mountain, route and stop, then the
    // sitemap and robots.txt
    closeBundle() {
      const out = outDir
      const index = path.join(out, 'index.html')
      if (!fs.existsSync(index)) return
      const html = fs.readFileSync(index, 'utf8')
      // an Italian page says so from its first byte (the app sets it again: src/main.jsx)
      const inLang = (page, lang) => (lang === 'en' ? page : page.replace('<html lang="en">', `<html lang="${lang}">`))
      const pages = appPages()
      const urls = []
      for (const lang of LANGS) {
        // the home page in the other languages (/it/); the English one is index.html itself
        if (lang !== 'en') {
          fs.mkdirSync(path.join(out, withLang('/', lang)), { recursive: true })
          fs.writeFileSync(path.join(out, withLang('/', lang), 'index.html'), inLang(withHead(html, homeHead(lang)), lang))
        }
        for (const [p, head] of pages) {
          const dir = path.join(out, withLang(p, lang))
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(path.join(dir, 'index.html'), inLang(withHead(html, head(lang)), lang))
        }
        urls.push(withLang('/', lang), ...pages.map(([p]) => withLang(p, lang)), withLang('/guess/', lang), withLang('/glossary/', lang), withLang('/privacy/', lang), withLang('/terms/', lang))
      }
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${site}${u}</loc><lastmod>${updated}</lastmod></url>`).join('\n')}\n</urlset>\n`
      fs.writeFileSync(path.join(out, 'sitemap.xml'), sitemap)
      fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`)
      console.log(`  site-pages: ${pages.length * LANGS.length} app pages, ${urls.length} addresses in the sitemap`)
      if (!env.SITE_URL && !warned) {
        warned = true
        console.warn(`\n  site-pages: SITE_URL is not set, so canonical links, link previews and the sitemap point at ${PLACEHOLDER_URL}. Build with SITE_URL=https://… before publishing.\n`)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }
  return {
    plugins: [react(), sitePages(env)],
    define: {
      'import.meta.env.VITE_LAST_UPDATED': JSON.stringify(lastUpdated()),
    },
    build: {
      // three.js alone is about 700 kB minified; it gets a chunk of its own so it caches across deploys
      chunkSizeWarningLimit: 800,
      rolldownOptions: {
        input: {
          main: path.resolve('index.html'),
          privacy: path.resolve('privacy/index.html'),
          terms: path.resolve('terms/index.html'),
          guess: path.resolve('guess/index.html'),
          glossary: path.resolve('glossary/index.html'),
          itPrivacy: path.resolve('it/privacy/index.html'),
          itTerms: path.resolve('it/terms/index.html'),
          itGuess: path.resolve('it/guess/index.html'),
          itGlossary: path.resolve('it/glossary/index.html'),
          notFound: path.resolve('404.html'),
        },
        output: {
          codeSplitting: {
            groups: [
              { name: 'three', test: /node_modules[\\/]three[\\/]/ },
              { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
              { name: 'gsap', test: /node_modules[\\/]gsap[\\/]/ },
              { name: 'vendor', test: /node_modules/ },
            ],
          },
        },
      },
    },
  }
})

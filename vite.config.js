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
const LANGS = ['en']
const OG_LOCALE = { en: 'en_GB', it: 'it_IT' }

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
  const posterAlt = (name) => `${name} in 3D, its name set large behind the mountain`
  const homeHead = (lang) => headBlock({
    lang, path: '/', title: siteName(lang), description: siteDescription(lang), img: image('home'),
    imgAlt: posterAlt('Everest'),
    jsonLd: {
      '@context': 'https://schema.org', ...website(lang), description: siteDescription(lang), dateModified: updated,
      hasPart: mountains.map((m) => ({ '@type': 'WebPage', name: mountainTitle(m, lang), url: `${site}${mountainPath(m.id, lang)}` })),
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
    imgAlt: posterAlt(m.peak.name),
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'WebPage', name: mountainTitle(m, lang), url: `${site}${mountainPath(m.id, lang)}`,
      description: mountainDescription(m, lang), inLanguage: lang, dateModified: updated, isPartOf: website(lang), about: mountainAbout(m),
    },
  })
  const routeHead = (m, r, lang) => headBlock({
    lang, path: routePath(m.id, r.id, null, 'en'), title: routeTitle(m, r, lang), description: routeDescription(m, r), img: image(m.id),
    imgAlt: posterAlt(m.peak.name),
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
      imgAlt: posterAlt(m.peak.name),
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
    imgAlt: posterAlt('Everest'),
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: `${site}${withLang(`/${slug}/`, lang)}`, inLanguage: lang, dateModified: updated, isPartOf: website(lang) },
  })
  const PAGES = {
    privacy: { slug: 'privacy', title: 'Privacy', description: 'What this site keeps and sends: no cookies, no accounts; your settings in your browser, the summit weather only when you ask for it, and visit counting only with your agreement.' },
    terms: { slug: 'terms', title: 'Terms of use', description: 'How to use the fourteen 8,000 m peaks in 3D: an educational model, not for navigation, with its data sources and their terms.' },
    guess: { slug: 'guess', title: 'Guess the mountain', description: 'Ten of the fourteen 8,000 m peaks drawn as contour maps from their elevation models. Can you name them?' },
    glossary: { slug: 'glossary', title: 'Glossary', description: 'The climbing words of the fourteen 8,000 m peaks in plain terms: serac, couloir, col, cornice, the Death Zone, alpine style and more.' },
  }

  // the parts of the policy pages that follow the build's settings
  const analyticsText = analytics
    ? `<p>Only if you agree, this site counts visits with <a href="${analyticsPolicy}">${analyticsName}</a>, which sets no cookies and keeps no personal profile: which pages and mountains are opened, the site that linked here, the campaign tag of the link (<code>utm_…</code>), and country, browser and device type, all counted in aggregate. If your browser sends Global Privacy Control or Do Not Track, you are not asked and nothing is counted.</p>
      <p class="choice" data-choice hidden>Your answer: <b data-choice-state>not given</b>. <button type="button" data-choice-set="yes">Count my visits</button> <button type="button" data-choice-set="no">Don’t count them</button></p>`
    : '<p>This site does not count visits. It loads no analytics, advertising or tracking script.</p>'
  const correctionsText = formHost
    ? `<p>If you use “Suggest a correction”, what you write, the page you were on and, only if you give it, your email address are sent to the form service at <code>${esc(formHost)}</code> and on to the person who runs this site. They are used only to check and fix the site’s information, and to answer you if you asked for an answer.</p>`
    : `<p>“Suggest a correction” opens a new issue in the site’s <a href="${REPO_URL}">public GitHub repository</a> with your text filled in. Nothing is sent until you submit it there, under your own GitHub account, where anyone can read it.</p>`

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
    for (const m of mountains) {
      out.push([mountainPath(m.id, 'en'), (lang) => mountainHead(m, lang)])
      const firstRouteOf = {}
      for (const r of m.routes) for (const id of r.hazards) firstRouteOf[id] ||= r
      for (const r of m.routes) {
        out.push([routePath(m.id, r.id, null, 'en'), (lang) => routeHead(m, r, lang)])
        for (const [slug, stop] of routeStops(m, r)) {
          const camp = stop.kind === 'camp' ? r.camps.find((c) => c.slug === slug) : null
          const hz = stop.kind === 'hazard' ? m.hazards.find((h) => h.id === slug) : null
          const where = camp || hz ? { lat: (camp || hz).lat, lon: (camp || hz).lon } : {}
          out.push([routePath(m.id, r.id, slug, 'en'), (lang) => stopHead(m, r, slug, { ...stop, ...where }, lang, hz ? firstRouteOf[slug] : r)])
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
        const lang = 'en'
        let head = ''
        if (file.endsWith('/404.html')) head = ''
        else if (/\/privacy\/index\.html$/.test(file)) head = pageHead(PAGES.privacy, lang)
        else if (/\/terms\/index\.html$/.test(file)) head = pageHead(PAGES.terms, lang)
        else if (/\/guess\/index\.html$/.test(file)) head = pageHead(PAGES.guess, lang)
        else if (/\/glossary\/index\.html$/.test(file)) head = pageHead(PAGES.glossary, lang)
        else head = homeHead(lang)
        return html
          // the visitor's theme and text size (lib/settings.js) before anything is drawn
          .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <script>${PREPAINT}</script>`)
          .replace(/<!-- head:page -->[\s\S]*?<!-- \/head:page -->/, head ? `<!-- head:page -->\n    ${head}\n    <!-- /head:page -->` : '$&')
          .replaceAll('%LAST_UPDATED%', longDate(updated, lang))
          .replaceAll('%LAST_UPDATED_ISO%', updated)
          .replaceAll('%REPO_URL%', REPO_URL)
          .replace('<!-- policy:analytics -->', analyticsText)
          .replace('<!-- policy:corrections -->', correctionsText)
          .replace('<!-- list:peaks -->', peakLinks(lang))
          .replace('<!-- list:glossary -->', glossaryList(glossary))
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
      const pages = appPages()
      const urls = []
      for (const lang of LANGS) {
        for (const [p, head] of pages) {
          const dir = path.join(out, withLang(p, lang))
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(path.join(dir, 'index.html'), withHead(html, head(lang)))
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

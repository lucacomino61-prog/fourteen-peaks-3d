import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { mountains } from './src/data/index.js'
import { SITE_NAME, SITE_DESCRIPTION, mountainPath, mountainTitle, mountainDescription } from './src/lib/meta.js'
import { PREPAINT } from './src/lib/settings.js'

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
const longDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * The pages behind the app: one HTML file per mountain (/k2/ …) with its own title, description,
 * canonical address, link preview and structured data; the sitemap and robots.txt; the policy
 * texts that depend on how the build is set up (analytics, corrections); the last-updated date.
 * SITE_URL (the address the site is served from) makes every link absolute; without it the
 * build uses a placeholder domain and says so.
 */
function sitePages(env) {
  const site = (env.SITE_URL || PLACEHOLDER_URL).replace(/\/+$/, '')
  const updated = lastUpdated()
  const analytics = env.VITE_ANALYTICS && env.VITE_ANALYTICS_SRC && env.VITE_ANALYTICS_SITE ? env.VITE_ANALYTICS : null
  const analyticsName = { plausible: 'Plausible Analytics', umami: 'Umami' }[analytics] || analytics
  const analyticsPolicy = { plausible: 'https://plausible.io/data-policy', umami: 'https://umami.is/privacy' }[analytics]
  const formHost = (() => { try { return new URL(env.VITE_FORM_ENDPOINT).host } catch { return '' } })()

  const image = (name) => `${site}/og/${name}.jpg`
  const headBlock = ({ url, title, description, img, imgAlt, jsonLd }) => [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="en_GB" />',
    `<meta property="og:url" content="${url}" />`,
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
  const website = { '@type': 'WebSite', name: SITE_NAME, url: `${site}/`, inLanguage: 'en' }
  const homeHead = () => headBlock({
    url: `${site}/`, title: SITE_NAME, description: SITE_DESCRIPTION, img: image('home'),
    imgAlt: 'Everest in 3D, its name set large behind the mountain',
    jsonLd: {
      '@context': 'https://schema.org', ...website, description: SITE_DESCRIPTION, dateModified: updated,
      hasPart: mountains.map((m) => ({ '@type': 'WebPage', name: mountainTitle(m), url: `${site}${mountainPath(m.id)}` })),
    },
  })
  const mountainHead = (m) => headBlock({
    url: `${site}${mountainPath(m.id)}`, title: mountainTitle(m), description: mountainDescription(m), img: image(m.id),
    imgAlt: `${m.peak.name} in 3D, its name set large behind the mountain`,
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'WebPage', name: mountainTitle(m), url: `${site}${mountainPath(m.id)}`,
      description: mountainDescription(m), inLanguage: 'en', dateModified: updated, isPartOf: website,
      about: {
        '@type': 'Mountain', name: m.peak.name, alternateName: m.peak.aka?.split(' · ').filter(Boolean),
        geo: { '@type': 'GeoCoordinates', latitude: m.peak.lat, longitude: m.peak.lon, elevation: m.peak.elevation },
      },
    },
  })
  const pageHead = ({ slug, title, description }) => headBlock({
    url: `${site}/${slug}/`, title: `${title} · ${SITE_NAME}`, description, img: image('home'),
    imgAlt: 'Everest in 3D, its name set large behind the mountain',
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: `${site}/${slug}/`, inLanguage: 'en', dateModified: updated, isPartOf: website },
  })
  const PAGES = {
    privacy: { slug: 'privacy', title: 'Privacy', description: 'What this site keeps and sends: no cookies, no accounts; your settings in your browser, and visit counting only with your agreement.' },
    terms: { slug: 'terms', title: 'Terms of use', description: 'How to use the fourteen 8,000 m peaks in 3D: an educational model, not for navigation, with its data sources and their terms.' },
  }

  // the parts of the policy pages that follow the build's settings
  const analyticsText = analytics
    ? `<p>Only if you agree, this site counts visits with <a href="${analyticsPolicy}">${analyticsName}</a>, which sets no cookies and keeps no personal profile: which pages and mountains are opened, the site that linked here, the campaign tag of the link (<code>utm_…</code>), and country, browser and device type, all counted in aggregate. If your browser sends Global Privacy Control or Do Not Track, you are not asked and nothing is counted.</p>
      <p class="choice" data-choice hidden>Your answer: <b data-choice-state>not given</b>. <button type="button" data-choice-set="yes">Count my visits</button> <button type="button" data-choice-set="no">Don’t count them</button></p>`
    : '<p>This site does not count visits. It loads no analytics, advertising or tracking script.</p>'
  const correctionsText = formHost
    ? `<p>If you use “Suggest a correction”, what you write, the page you were on and, only if you give it, your email address are sent to the form service at <code>${esc(formHost)}</code> and on to the person who runs this site. They are used only to check and fix the site’s information, and to answer you if you asked for an answer.</p>`
    : `<p>“Suggest a correction” opens a new issue in the site’s <a href="${REPO_URL}">public GitHub repository</a> with your text filled in. Nothing is sent until you submit it there, under your own GitHub account, where anyone can read it.</p>`

  const peakLinks = mountains.map((m) => `<li><a href="${mountainPath(m.id)}"><b translate="no">${esc(m.peak.name)}</b> <span class="mono">${m.peak.elevation.toLocaleString('en-GB')} m</span></a></li>`).join('\n          ')

  let warned = false
  let outDir = path.resolve('dist')
  return {
    name: 'site-pages',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir) },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const file = ctx.filename.replace(/\\/g, '/')
        let head = ''
        if (file.endsWith('/404.html')) head = ''
        else if (/\/privacy\/index\.html$/.test(file)) head = pageHead(PAGES.privacy)
        else if (/\/terms\/index\.html$/.test(file)) head = pageHead(PAGES.terms)
        else head = homeHead()
        return html
          // the visitor's theme and text size (lib/settings.js) before anything is drawn
          .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <script>${PREPAINT}</script>`)
          .replace(/<!-- head:page -->[\s\S]*?<!-- \/head:page -->/, head ? `<!-- head:page -->\n    ${head}\n    <!-- /head:page -->` : '$&')
          .replaceAll('%LAST_UPDATED%', longDate(updated))
          .replaceAll('%LAST_UPDATED_ISO%', updated)
          .replaceAll('%REPO_URL%', REPO_URL)
          .replace('<!-- policy:analytics -->', analyticsText)
          .replace('<!-- policy:corrections -->', correctionsText)
          .replace('<!-- list:peaks -->', peakLinks)
      },
    },
    // after the build: a copy of the app's page for every mountain, then the sitemap and robots.txt
    closeBundle() {
      const out = outDir
      const index = path.join(out, 'index.html')
      if (!fs.existsSync(index)) return
      const html = fs.readFileSync(index, 'utf8')
      for (const m of mountains) {
        const dir = path.join(out, m.id)
        fs.mkdirSync(dir, { recursive: true })
        const page = html.replace(/<!-- head:page -->[\s\S]*?<!-- \/head:page -->/, `<!-- head:page -->\n    ${mountainHead(m)}\n    <!-- /head:page -->`)
        fs.writeFileSync(path.join(dir, 'index.html'), page)
      }
      const urls = ['/', ...mountains.map((m) => mountainPath(m.id)), '/privacy/', '/terms/']
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${site}${u}</loc><lastmod>${updated}</lastmod></url>`).join('\n')}\n</urlset>\n`
      fs.writeFileSync(path.join(out, 'sitemap.xml'), sitemap)
      fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`)
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

// Before publishing: every link on every page, and the correction form, on the built site.
//
//   npm run build && node scripts/check-site.mjs [--external]
//
// Pages: the home page, the fourteen mountain pages, privacy, terms and the 404, each rendered in
// headless Chrome so the links the app draws are counted too. A link inside the site must point at
// a file in dist/ (or an id on its page); with --external, links to other sites are fetched as
// well (network needed). Then the correction form: its checks, the confirmation before
// discarding, and the hand-off. Exits 1 on any failure.
// Needs Google Chrome (CHROME_PATH to override) and puppeteer-core (a dev dependency).
import { preview } from 'vite'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { mountains } from '../src/data/index.js'

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const EXTERNAL = process.argv.includes('--external')
const PORT = 4213
const BASE = `http://127.0.0.1:${PORT}`
const DIST = path.resolve('dist')
const PAGES = ['/', ...mountains.map((m) => `/${m.id}/`), '/privacy/', '/terms/', '/404.html']
const problems = []
const note = (msg) => { problems.push(msg); console.log(`  ✗ ${msg}`) }

if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error('No dist/: run npm run build first.'); process.exit(1) }
const server = await preview({ root: process.cwd(), logLevel: 'silent', preview: { port: PORT, strictPort: true, host: '127.0.0.1' } })
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--mute-audio', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })

// a path inside the site exists when dist/ has the file (or the folder's index.html)
function existsInDist(pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+/, '')
  const file = path.join(DIST, clean)
  if (!file.startsWith(DIST)) return false
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return true
  return fs.existsSync(path.join(file, 'index.html'))
}

const external = new Map() // url → pages that link it
let checked = 0
console.log(`Links on ${PAGES.length} pages`)
for (const p of PAGES) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('fp-motion', 'off') } catch { /* private mode */ } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(BASE + p, { waitUntil: 'networkidle2', timeout: 90000 })
  await page.waitForSelector('main', { timeout: 30000 })
  // open the menus that hold links, so the app draws them
  await page.evaluate(() => document.querySelector('.hero-open')?.click())
  const found = await page.evaluate(() => {
    const out = []
    for (const a of document.querySelectorAll('a[href]')) out.push({ url: a.href, raw: a.getAttribute('href'), what: `link “${(a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 40)}”` })
    for (const l of document.querySelectorAll('link[href]:not([rel=canonical]):not([rel=preconnect])')) out.push({ url: l.href, raw: l.getAttribute('href'), what: `<link rel=${l.rel}>` })
    for (const s of document.querySelectorAll('script[src], img[src]')) out.push({ url: s.src, raw: s.getAttribute('src'), what: `<${s.tagName.toLowerCase()}>` })
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id)
    return { out, ids }
  })
  for (const { url, raw, what } of found.out) {
    if (!/^https?:/.test(url)) continue // mailto:, javascript: …
    const u = new URL(url)
    checked++
    if (u.origin === BASE) {
      if (raw.startsWith('#')) { if (raw.length > 1 && !found.ids.includes(raw.slice(1))) note(`${p}: ${what} → ${raw} (no such id on the page)`) }
      else if (!existsInDist(u.pathname)) note(`${p}: ${what} → ${u.pathname} (not in dist/)`)
    } else if (!external.has(url)) external.set(url, [p])
    else external.get(url).push(p)
  }
  if (errors.length) note(`${p}: script error: ${errors[0]}`)
  await page.close()
}
console.log(`  ${checked} links inside and out, ${external.size} distinct outside the site`)

if (EXTERNAL) {
  console.log('Outside links')
  for (const [url, pages] of external) {
    let status = 0
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0 (link check)' } })
      status = res.status
    } catch (e) { status = e.name === 'TimeoutError' ? 'timeout' : 'no answer' }
    // some sites refuse robots (403/429) but work in a browser: reported, not failed
    if (status === 403 || status === 429) console.log(`  ? ${status} ${url} (refuses automated checks; open it by hand)`)
    else if (typeof status !== 'number' || status >= 400) note(`${status} ${url} (on ${[...new Set(pages)].slice(0, 3).join(', ')})`)
    else console.log(`  ✓ ${status} ${url}`)
  }
}

console.log('The correction form')
{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(`${BASE}/k2/`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => !document.querySelector('.loader'), { timeout: 90000 })
  const step = async (label, fn) => { try { const ok = await fn(); console.log(`  ${ok ? '✓' : '✗'} ${label}`); if (!ok) problems.push(`form: ${label}`) } catch (e) { note(`form: ${label}: ${e.message}`) } }
  const click = (sel, text) => page.evaluate((sel, text) => [...document.querySelectorAll(sel)].find((b) => !text || b.textContent.includes(text))?.click(), sel, text)
  await step('opens from the footer', async () => { await click('.foot-actions button', 'correction'); return !!(await page.waitForSelector('dialog.fix[open]', { timeout: 3000 })) })
  await step('an empty send shows what to fix, focused, without disabling the button', async () => {
    await click('.fix-form button[type=submit]')
    await new Promise((r) => setTimeout(r, 200))
    return page.evaluate(() => !!document.querySelector('.fix-summary') && document.activeElement?.classList.contains('fix-summary') && document.querySelector('#fix-details').getAttribute('aria-invalid') === 'true' && !document.querySelector('.fix-form button[type=submit]').disabled)
  })
  await step('a wrong source address is flagged, and clears once right', async () => {
    await page.type('#fix-details', 'The altitude of Camp 3 should read 7,300 m, as in the expedition report.')
    await page.type('#fix-source', 'report')
    await click('.fix-form button[type=submit]')
    await new Promise((r) => setTimeout(r, 200))
    const flagged = await page.$eval('#fix-source', (e) => e.getAttribute('aria-invalid') === 'true')
    await page.$eval('#fix-source', (e) => e.select())
    await page.keyboard.type('https://example.org/report')
    await new Promise((r) => setTimeout(r, 100))
    return flagged && (await page.$eval('#fix-source', (e) => e.getAttribute('aria-invalid') === null))
  })
  await step('closing with text asks first, and "Keep writing" keeps it', async () => {
    await click('.fix-actions button', 'Cancel')
    await new Promise((r) => setTimeout(r, 200))
    const asked = !!(await page.$('dialog.confirm[open]'))
    await click('dialog.confirm button', 'Keep writing')
    await new Promise((r) => setTimeout(r, 200))
    return asked && page.evaluate(() => !!document.querySelector('dialog.fix[open]') && !document.querySelector('dialog.confirm[open]') && document.querySelector('#fix-details').value.length > 20)
  })
  await step('sending hands over (form service, or a prefilled GitHub issue)', async () => {
    const tab = new Promise((res) => browser.once('targetcreated', (t) => res(t.url())))
    await page.setRequestInterception(true)
    page.on('request', (r) => (r.method() === 'POST' ? r.respond({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'application/json', body: '{"ok":true}' }) : r.continue()))
    await click('.fix-form button[type=submit]')
    const url = await Promise.race([tab, new Promise((r) => setTimeout(() => r(''), 4000))])
    await new Promise((r) => setTimeout(r, 300))
    const done = await page.$eval('.fix-done', (e) => e.textContent).catch(() => '')
    for (const p of await browser.pages()) if (p !== page && /github\.com/.test(p.url())) await p.close()
    return /on its way|ready on GitHub/.test(done) && (!/GitHub/.test(done) || /issues\/new/.test(decodeURIComponent(url)))
  })
  await page.close()
}

await browser.close()
await new Promise((r) => server.httpServer.close(r))
console.log(problems.length ? `\n${problems.length} problem(s)` : '\nAll links and the form check out.')
process.exit(problems.length ? 1 : 0)

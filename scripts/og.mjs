// Link previews: public/og/<id>.jpg for every mountain and public/og/home.jpg (the home page shows
// the first mountain), 1200×630, rendered from the built site in headless Chrome on the real GPU:
// the mountain with its name behind it, animations stopped, the controls hidden, a caption added.
//
//   npm run build && node scripts/og.mjs [id …]
//
// Needs Google Chrome (CHROME_PATH to override) and puppeteer-core (a dev dependency).
import { preview } from 'vite'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { mountains } from '../src/data/index.js'

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 4211
const only = process.argv.slice(2)
const jobs = [{ id: mountains[0].id, file: 'home' }, ...mountains.map((m) => ({ id: m.id, file: m.id }))].filter((j) => !only.length || only.includes(j.file))

const server = await preview({ root: process.cwd(), logLevel: 'silent', preview: { port: PORT, strictPort: true, host: '127.0.0.1' } })
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--mute-audio', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
})
fs.mkdirSync('public/og', { recursive: true })
for (const { id, file } of jobs) {
  const m = mountains.find((x) => x.id === id)
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
  await page.evaluateOnNewDocument(() => { localStorage.setItem('fp-motion', 'off'); localStorage.setItem('fp-stats', 'no') })
  await page.goto(`http://127.0.0.1:${PORT}/${id}/`, { waitUntil: 'domcontentloaded' })
  // the mountain up, the full textures in, the loader gone
  await page.waitForFunction((id) => window.__k2perf?.(id)?.['tex:albedo'] && !document.querySelector('.loader'), { timeout: 120000, polling: 250 }, id)
  await new Promise((r) => setTimeout(r, 2500))
  await page.addStyleTag({ content: `
    .nav, .hero-min, .switch, .hero-side, .grain, .progress, .skip-link, .loupe-ring, .loupe-paper, .consent, .toast { display: none !important; }
    /* a wide, short card: the name sits high, so the summit only cuts into its foot */
    .poster { place-items: start center !important; padding: 28px 0 0 !important; }
    .og-caption { position: fixed; left: 48px; right: 48px; bottom: 36px; z-index: 200; display: flex; justify-content: space-between; align-items: baseline;
      font-family: 'JetBrains Mono Variable', monospace; font-size: 22px; color: #ecebe6; text-shadow: 0 1px 2px rgb(0 0 0 / 0.9), 0 0 14px rgb(0 0 0 / 0.75); }
    .og-caption b { font-family: 'Archivo Variable', sans-serif; font-weight: 600; font-size: 22px; }` })
  await page.evaluate((line, site) => {
    const c = document.createElement('div')
    c.className = 'og-caption'
    c.innerHTML = `<span>${line}</span><b>${site}</b>`
    document.body.append(c)
  }, `${m.peak.elevation.toLocaleString('en-GB')} m · ${m.peak.range}`, 'The fourteen 8,000 m peaks in 3D')
  await new Promise((r) => setTimeout(r, 400))
  const path = `public/og/${file}.jpg`
  await page.screenshot({ path, type: 'jpeg', quality: 80 })
  console.log(`${path}  ${Math.round(fs.statSync(path).size / 1024)} KB`)
  await page.close()
}
await browser.close()
await new Promise((r) => server.httpServer.close(r))

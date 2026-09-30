// Guess the mountain: ten of the fourteen as contour maps (the site's map paper: snow, ink contours
// every 200 m, index lines every 1,000 m, the 8,000 m line in the signal, shaded by the relief as
// the loupe is), four names to choose from. The maps come from scripts/make-guess.mjs. The best
// score stays on this device (localStorage fp-guess). No animation loop: a map is drawn once.
import './page.js'
import './notfound.css'
import './guess.css'
import { decodeQ16 } from '../lib/q16.js'
import { t, withLang } from '../i18n/index.js'
import { fmt } from '../lib/format.js'

const ROUNDS = 10
const CHOICES = 4
const MINOR = 200, INDEX = 1000
const PAPER = [236, 235, 230], INK = [11, 13, 18], SIGNAL = '#ff5b2e'
const BEST_KEY = 'fp-guess'
const $ = (sel) => document.querySelector(sel)

const board = $('[data-board]')
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches

let index = null // { km, size, mountains }
let game = null // { order, round, score, answered, hint }
const cache = new Map()

/** The height grid of one mountain: Float32, north row first */
async function heights(id) {
  if (cache.has(id)) return cache.get(id)
  const p = fetch(`/guess/${id}.q16`).then((r) => r.arrayBuffer()).then((b) => {
    const n = index.size
    const south = decodeQ16(new Uint8Array(b), n, n) // row 0 = south (as the terrain textures)
    const north = new Float32Array(n * n)
    for (let y = 0; y < n; y++) north.set(south.subarray((n - 1 - y) * n, (n - y) * n), y * n)
    return north
  })
  cache.set(id, p)
  return p
}

/** marching squares: every segment of one contour level, in grid units */
function contour(g, n, level, emit) {
  for (let j = 0; j < n - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = g[j * n + i], b = g[j * n + i + 1], c = g[(j + 1) * n + i + 1], e = g[(j + 1) * n + i]
      const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (e > level ? 1 : 0)
      if (idx === 0 || idx === 15) continue
      const f = (p, q) => (level - p) / (q - p)
      const top = () => [i + f(a, b), j], right = () => [i + 1, j + f(b, c)], bottom = () => [i + f(e, c), j + 1], left = () => [i, j + f(a, e)]
      switch (idx) {
        case 1: case 14: emit(left(), bottom()); break
        case 2: case 13: emit(bottom(), right()); break
        case 3: case 12: emit(left(), right()); break
        case 4: case 11: emit(top(), right()); break
        case 5: emit(left(), top()); emit(bottom(), right()); break
        case 6: case 9: emit(top(), bottom()); break
        case 7: case 8: emit(left(), top()); break
        case 10: emit(top(), right()); emit(left(), bottom()); break
      }
    }
  }
}

/** The map: paper shaded by the relief (light from the north-west), then the contours on it */
function draw(canvas, g) {
  const n = index.size
  const css = canvas.clientWidth || 560
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = Math.round(css * dpr)
  canvas.height = Math.round(css * dpr)
  const ctx = canvas.getContext('2d')
  const px = (index.km * 1000) / n // metres per sample
  const shade = new ImageData(n, n)
  const h = (x, y) => g[Math.min(n - 1, Math.max(0, y)) * n + Math.min(n - 1, Math.max(0, x))]
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    // the slope eastwards and southwards (rows run north to south); the ground's normal is
    // (−east, +south, 1) in (east, north, up), lit by a sun in the north-west at 45°
    const ge = (h(i + 1, j) - h(i - 1, j)) / (2 * px), gs = (h(i, j + 1) - h(i, j - 1)) / (2 * px)
    const lit = Math.max(0, (0.5 * ge + 0.5 * gs + 0.707) / Math.hypot(ge, gs, 1))
    const k = 0.8 + 0.2 * Math.min(1, lit)
    const o = (j * n + i) * 4
    for (let c = 0; c < 3; c++) shade.data[o + c] = Math.round(INK[c] + (PAPER[c] - INK[c]) * k)
    shade.data[o + 3] = 255
  }
  const off = document.createElement('canvas')
  off.width = off.height = n
  off.getContext('2d').putImageData(shade, 0, 0)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height)
  const s = canvas.width / (n - 1)
  const stroke = (level, width, color) => {
    ctx.beginPath()
    contour(g, n, level, (p, q) => { ctx.moveTo(p[0] * s, p[1] * s); ctx.lineTo(q[0] * s, q[1] * s) })
    ctx.lineWidth = width * dpr
    ctx.strokeStyle = color
    ctx.stroke()
  }
  ctx.lineCap = 'round'
  let lo = Infinity, hi = -Infinity
  for (const v of g) { lo = Math.min(lo, v); hi = Math.max(hi, v) }
  for (let l = Math.ceil(lo / MINOR) * MINOR; l < hi; l += MINOR) {
    if (l === 8000) continue
    const major = l % INDEX === 0
    stroke(l, major ? 1.5 : 0.8, `rgb(11 13 18 / ${major ? 0.85 : 0.42})`)
  }
  if (hi > 8000) stroke(8000, 2.4, SIGNAL)
}

const peakName = (m) => m.name
function best() { try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 } }
function saveBest(score) { try { if (score > best()) localStorage.setItem(BEST_KEY, String(score)) } catch { /* private window: not kept */ } }

async function showRound() {
  const { order, round } = game
  const answer = order[round]
  game.answered = false
  game.hint = false
  $('[data-round]').textContent = t('Round {n} of {total}', { n: round + 1, total: ROUNDS })
  $('[data-score]').textContent = t('{n} right', { n: game.score })
  $('[data-status]').textContent = ''
  $('[data-next]').hidden = true
  $('[data-hint]').hidden = false
  $('[data-hint]').disabled = false
  const others = shuffle(index.mountains.filter((m) => m.id !== answer.id)).slice(0, CHOICES - 1)
  const choices = shuffle([answer, ...others])
  const host = $('[data-options]')
  host.textContent = ''
  choices.forEach((m, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'game-option'
    b.dataset.id = m.id
    const key = document.createElement('span')
    key.className = 'mono'
    key.textContent = String(i + 1)
    key.setAttribute('aria-hidden', 'true')
    const name = document.createElement('b')
    name.textContent = peakName(m)
    name.translate = false
    b.append(key, name)
    b.addEventListener('click', () => choose(m.id))
    host.append(b)
  })
  const canvas = $('[data-map]')
  board.setAttribute('aria-busy', 'true')
  const g = await heights(answer.id)
  if (game.order[game.round] !== answer) return // a newer round started meanwhile
  draw(canvas, g)
  board.removeAttribute('aria-busy')
  // the next map downloads while this one is played
  const next = order[round + 1]
  if (next) heights(next.id)
}

function choose(id) {
  if (game.answered) return
  game.answered = true
  const answer = game.order[game.round]
  const right = id === answer.id
  if (right) game.score++
  for (const b of document.querySelectorAll('.game-option')) {
    b.disabled = true
    if (b.dataset.id === answer.id) b.dataset.state = 'right'
    else if (b.dataset.id === id) b.dataset.state = 'wrong'
  }
  const status = $('[data-status]')
  status.textContent = ''
  const lead = document.createElement('b')
  lead.textContent = right ? t('Right: {name}.', { name: answer.name }) : t('It was {name}.', { name: answer.name })
  const rest = document.createElement('span')
  rest.textContent = ` ${t('{height} m, {range}.', { height: fmt(answer.elevation), range: answer.range })} `
  const a = document.createElement('a')
  a.href = withLang(`/${answer.id}/`)
  a.textContent = t('Open it in 3D')
  status.append(lead, rest, a)
  $('[data-score]').textContent = t('{n} right', { n: game.score })
  $('[data-hint]').hidden = true
  const next = $('[data-next]')
  next.hidden = false
  next.textContent = game.round + 1 < ROUNDS ? t('Next mountain') : t('See your score')
  next.focus()
}

function hint() {
  const answer = game.order[game.round]
  game.hint = true
  const vars = { range: answer.range, countries: answer.countries }
  $('[data-status]').textContent = /\//.test(answer.countries) ? t('Hint: {range}, on the border of {countries}.', vars) : t('Hint: {range}, in {countries}.', vars)
  $('[data-hint]').disabled = true
}

function end() {
  board.hidden = true
  const endEl = $('[data-end]')
  endEl.hidden = false
  const before = best()
  saveBest(game.score)
  $('[data-end-title]').textContent = t('{n} of {total} right', { n: game.score, total: ROUNDS })
  $('[data-end-note]').textContent = game.score > before && before > 0
    ? t('Your best so far on this device.')
    : game.score === ROUNDS ? t('All ten. The contour lines hold no secrets from you.') : before ? t('Your best on this device: {n}.', { n: Math.max(before, game.score) }) : t('Play again for a new ten, in a new order.')
  $('[data-again]').focus()
}

function start() {
  game = { order: shuffle([...index.mountains]).slice(0, ROUNDS), round: 0, score: 0, answered: false, hint: false }
  $('[data-end]').hidden = true
  board.hidden = false
  showRound()
}

async function shareScore() {
  const url = new URL(withLang('/guess/'), location.origin)
  url.searchParams.set('utm_source', navigator.share && coarse ? 'native' : 'copy')
  url.searchParams.set('utm_medium', 'share')
  const text = t('I named {n} of {total} of the 8,000 m peaks from their contour lines. Can you?', { n: game.score, total: ROUNDS })
  if (navigator.share && coarse) {
    try { await navigator.share({ title: t('Guess the mountain'), text, url: url.href }); return } catch (e) { if (e?.name === 'AbortError') return }
  }
  let ok = false
  try { await navigator.clipboard.writeText(`${text} ${url.href}`); ok = true } catch { /* no clipboard */ }
  const note = $('[data-end-note]')
  note.textContent = ok ? t('Copied: your score and the link.') : `${text} ${url.href}`
}

if (board) {
  $('[data-next]').addEventListener('click', () => { if (game.round + 1 < ROUNDS) { game.round++; showRound() } else end() })
  $('[data-hint]').addEventListener('click', hint)
  $('[data-again]').addEventListener('click', start)
  $('[data-share]').addEventListener('click', shareScore)
  // 1–4 answer, Enter goes on (not while typing anywhere, and never with a modifier)
  window.addEventListener('keydown', (e) => {
    if (!game || e.metaKey || e.ctrlKey || e.altKey || board.hidden) return
    const n = Number(e.key)
    if (n >= 1 && n <= CHOICES && !game.answered) { document.querySelectorAll('.game-option')[n - 1]?.click(); e.preventDefault() }
  })
  // a map drawn at one width is redrawn at another
  let last = 0
  const ro = new ResizeObserver(() => {
    const w = $('[data-map]').clientWidth
    if (!game || Math.abs(w - last) < 2) return
    last = w
    heights(game.order[game.round].id).then((g) => draw($('[data-map]'), g))
  })
  ro.observe($('[data-map]'))
  fetch('/guess/index.json').then((r) => r.json()).then((data) => { index = data; start() })
}

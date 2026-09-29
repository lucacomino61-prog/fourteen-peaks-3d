// The 404: an imaginary mountain drawn as contour lines, read through the site's contour loupe.
// Its lowest point is 404 m (where you start) and its summit 8,404 m; reach the 8,000 m line and
// the way back shows. No animation loop: the loupe moves only when the pointer or a key does.
import './page.js'
import './notfound.css'

const W = 120, H = 80 // grid cells
const VW = 1200, VH = 800 // SVG units
const LOW = 404, HIGH = 8404
const R = 110 // loupe radius, SVG units
const fmt = (n) => Math.round(n).toLocaleString('en-GB')

// the terrain: a main peak, a shoulder, a second summit, the valley you start in, a little noise
function heightfield() {
  const g = new Float32Array((W + 1) * (H + 1))
  const bump = (x, y, cx, cy, sx, sy, a) => a * Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2))
  const hash = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s) }
  const noise = (x, y) => {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy)
    const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
  let min = Infinity, max = -Infinity
  for (let j = 0; j <= H; j++) {
    for (let i = 0; i <= W; i++) {
      const x = i / W, y = j / H
      let h = bump(x, y, 0.6, 0.4, 0.17, 0.2, 1) + bump(x, y, 0.42, 0.52, 0.14, 0.12, 0.5) + bump(x, y, 0.8, 0.3, 0.1, 0.12, 0.62) + bump(x, y, 0.5, 0.25, 0.3, 0.08, 0.25)
      h += 0.06 * noise(x * 9, y * 9) + 0.03 * noise(x * 23, y * 23)
      h -= bump(x, y, 0.2, 0.78, 0.16, 0.16, 0.2) // the valley you start in
      g[j * (W + 1) + i] = h
      if (h < min) min = h
      if (h > max) max = h
    }
  }
  for (let k = 0; k < g.length; k++) g[k] = LOW + ((g[k] - min) / (max - min)) * (HIGH - LOW)
  return g
}

// marching squares: one path of line segments per contour level
function contour(g, level) {
  const at = (i, j) => g[j * (W + 1) + i]
  const sx = VW / W, sy = VH / H
  const parts = []
  const seg = (p, q) => parts.push(`M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`)
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), e = at(i, j + 1) // corners: tl, tr, br, bl
      const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (e > level ? 1 : 0)
      if (idx === 0 || idx === 15) continue
      const t = (p, q) => (level - p) / (q - p)
      const top = () => [(i + t(a, b)) * sx, j * sy]
      const right = () => [(i + 1) * sx, (j + t(b, c)) * sy]
      const bottom = () => [(i + t(e, c)) * sx, (j + 1) * sy]
      const left = () => [i * sx, (j + t(a, e)) * sy]
      switch (idx) {
        case 1: case 14: seg(left(), bottom()); break
        case 2: case 13: seg(bottom(), right()); break
        case 3: case 12: seg(left(), right()); break
        case 4: case 11: seg(top(), right()); break
        case 5: seg(left(), top()); seg(bottom(), right()); break
        case 6: case 9: seg(top(), bottom()); break
        case 7: case 8: seg(left(), top()); break
        case 10: seg(top(), right()); seg(left(), bottom()); break
      }
    }
  }
  return parts.join('')
}

const host = document.querySelector('[data-map]')
if (host) {
  const g = heightfield()
  const levels = []
  for (let l = 500; l < HIGH; l += 500) levels.push(l)
  const minor = levels.filter((l) => l % 1000 && l !== 8000).map((l) => contour(g, l)).join('')
  const index = levels.filter((l) => !(l % 1000) && l !== 8000).map((l) => contour(g, l)).join('')
  const dz = contour(g, 8000)
  const layer = () => `<path class="minor" d="${minor}"/><path class="index" d="${index}"/><path class="dz" d="${dz}"/>`

  // start at the lowest point: 404 m
  let lo = 0
  for (let k = 1; k < g.length; k++) if (g[k] < g[lo]) lo = k
  const pos = { x: ((lo % (W + 1)) / W) * VW, y: (Math.floor(lo / (W + 1)) / H) * VH }

  host.innerHTML = `
    <svg viewBox="0 0 ${VW} ${VH}" tabindex="0" role="img" aria-label="A mountain that does not exist, drawn as contour lines every 500 metres, with the 8,000 metre line in orange. The loupe reads the ground under the pointer; the arrow keys move it.">
      <defs><clipPath id="lens"><circle r="${R}" cx="${pos.x}" cy="${pos.y}"/></clipPath></defs>
      <g class="ghost">${layer()}</g>
      <g class="lens" clip-path="url(#lens)"><rect width="${VW}" height="${VH}"/>${layer()}</g>
      <circle class="ring" r="${R}" cx="${pos.x}" cy="${pos.y}"/>
    </svg>
    <span class="lost-read mono" aria-hidden="true"></span>`
  const svg = host.querySelector('svg')
  const lens = host.querySelector('#lens circle')
  const ring = host.querySelector('.ring')
  const read = host.querySelector('.lost-read')
  const live = document.querySelector('[data-readout]')
  const found = document.querySelector('[data-found]')
  let top = false

  const heightAt = (x, y) => {
    const fx = Math.min(W - 1e-6, Math.max(0, (x / VW) * W)), fy = Math.min(H - 1e-6, Math.max(0, (y / VH) * H))
    const i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j
    const at = (a, b) => g[b * (W + 1) + a]
    return (at(i, j) * (1 - u) + at(i + 1, j) * u) * (1 - v) + (at(i, j + 1) * (1 - u) + at(i + 1, j + 1) * u) * v
  }
  const place = (x, y, announce) => {
    pos.x = Math.min(VW, Math.max(0, x))
    pos.y = Math.min(VH, Math.max(0, y))
    for (const c of [lens, ring]) { c.setAttribute('cx', pos.x.toFixed(1)); c.setAttribute('cy', pos.y.toFixed(1)) }
    const h = heightAt(pos.x, pos.y)
    const text = `≈ ${fmt(h)} m`
    read.textContent = text
    // the read-out sits under the ring, or over it near the bottom edge, and never leaves the map
    const below = pos.y + R + 70 < VH
    read.style.left = `${Math.min(88, Math.max(12, (pos.x / VW) * 100))}%`
    read.style.top = `${((below ? pos.y + R : pos.y - R) / VH) * 100}%`
    read.style.transform = below ? 'translate(-50%, 8px)' : 'translate(-50%, calc(-100% - 8px))'
    const atTop = h >= 8000
    ring.classList.toggle('is-top', atTop)
    if (atTop && !top) {
      top = true
      found.hidden = false
      live.textContent = `${text}. Summit: the way back is under the map.`
    } else if (announce) live.textContent = text
  }
  const fromEvent = (e) => {
    const m = svg.getScreenCTM()
    if (!m) return
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    place(p.x, p.y, false)
  }
  svg.addEventListener('pointermove', fromEvent)
  svg.addEventListener('pointerdown', (e) => { svg.setPointerCapture?.(e.pointerId); fromEvent(e) })
  svg.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 90 : 30
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key]
    if (!d) return
    e.preventDefault()
    place(pos.x + d[0], pos.y + d[1], true)
  })
  place(pos.x, pos.y, false)
}

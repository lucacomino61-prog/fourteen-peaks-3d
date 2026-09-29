// The contour loupe's pointer state, shared by the terrain shader (scene/Terrain.jsx) and the
// ring on the page (ui/Loupe.jsx). With a mouse the loupe follows the pointer over the ground;
// on a touch screen, press and hold (350 ms without moving) to lift it above the finger, drag
// to move it, let go to drop it. It only works where the canvas takes the pointer: the hero
// and the explorer.
import { useStore } from '../store'

export const loupe = {
  active: false, // a pointer wants the loupe
  touch: false, // held by a finger (drawn above it, a little smaller)
  x: 0, // CSS px within the canvas
  y: 0,
  ring: null, // set by <LoupeRing>
  read: null,
  paper: null, // set by <LoupePaper>: the disc under the canvas

}

const LIFT = 96 // px the loupe floats above a finger
const HOLD_MS = 350

// leaving the hero or the explorer takes the loupe away (the pointer may not have moved)
useStore.subscribe((s, prev) => {
  if (s.mode !== prev.mode && s.mode !== 'hero' && s.mode !== 'explorer') loupe.active = false
})

export function attachLoupe(canvas) {
  let timer = 0, sx = 0, sy = 0, finger = null
  const at = (clientX, clientY) => { const r = canvas.getBoundingClientRect(); return [clientX - r.left, clientY - r.top] }
  const drop = () => {
    clearTimeout(timer); timer = 0
    if (loupe.touch) { loupe.touch = false; loupe.active = false; useStore.setState({ loupeHold: false }) }
    finger = null
  }
  const onMove = (e) => {
    if (e.pointerType === 'mouse') {
      ;[loupe.x, loupe.y] = at(e.clientX, e.clientY)
      loupe.active = true
    } else if (e.pointerId === finger) {
      if (loupe.touch) { const [x, y] = at(e.clientX, e.clientY); loupe.x = x; loupe.y = y - LIFT }
      else if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) { clearTimeout(timer); timer = 0 } // a swipe, not a hold
    }
  }
  const onDown = (e) => {
    if (e.pointerType === 'mouse') return
    finger = e.pointerId; sx = e.clientX; sy = e.clientY
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = 0
      const [x, y] = at(sx, sy)
      loupe.x = x; loupe.y = y - LIFT; loupe.touch = true; loupe.active = true
      useStore.setState({ loupeHold: true })
    }, HOLD_MS)
  }
  const onUp = (e) => { if (e.pointerId === finger) drop() }
  const onLeave = (e) => { if (e.pointerType === 'mouse') loupe.active = false }
  const noMenu = (e) => { if (loupe.touch || timer) e.preventDefault() } // a long press would open the phone's menu
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('contextmenu', noMenu)
  return () => {
    drop()
    loupe.active = false
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onUp)
    canvas.removeEventListener('pointerleave', onLeave)
    canvas.removeEventListener('contextmenu', noMenu)
  }
}

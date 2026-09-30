// Share and copy. On a phone the system share sheet opens; elsewhere, and whenever it isn't
// available, the link is copied. Shared links carry utm_source/utm_medium=share (lib/utm.js).
import { taggedUrl } from './utm.js'
import { track } from './analytics.js'
import { useStore } from '../store'

// a confirmation (hidden from view when the visitor turned confirmations off) or an error (always shown)
export const toast = (text, kind) => useStore.setState({ toast: { text, kind, at: Date.now() } })

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // older browsers and non-secure pages: a hidden text area and the copy command
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:-100px;opacity:0'
    document.body.append(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { /* nothing more to try */ }
    ta.remove()
    return ok
  }
}

export async function copyLink(path) {
  const ok = await copyText(taggedUrl(path, 'copy'))
  toast(ok ? 'Link copied' : 'Couldn’t copy: the link is in the address bar', ok ? 'confirm' : 'error')
  if (ok) track('Share', { method: 'copy' })
  return ok
}

export async function share({ title, text, path }) {
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  if (navigator.share && coarse) {
    try {
      await navigator.share({ title, text, url: taggedUrl(path, 'native') })
      track('Share', { method: 'native' })
      return
    } catch (e) {
      if (e?.name === 'AbortError') return // closed the sheet
    }
  }
  await copyLink(path)
}

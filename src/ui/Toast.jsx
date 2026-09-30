import { useStore } from '../store'

/**
 * A short message at the bottom, read out by screen readers. Each message is a fresh element, so
 * its CSS timing (in, hold, out: index.css) starts over; no timers here.
 * Kinds: 'confirm' (link copied …) is only read out, not shown, when the visitor turned
 * confirmations off in the settings; 'error' always shows; 'news' (the site changed since the last
 * visit) stays up longer.
 */
export default function Toast() {
  const toast = useStore((s) => s.toast)
  const confirmations = useStore((s) => s.settings.confirmations)
  const kind = toast?.kind || 'confirm'
  const quiet = kind === 'confirm' && !confirmations
  return (
    <div className="toast" role="status" aria-live="polite">
      {toast && <span key={toast.at} className={quiet ? 'visually-hidden' : kind === 'news' ? 'is-long' : undefined}>{toast.text}</span>}
    </div>
  )
}

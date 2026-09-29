import { useStore } from '../store'

/**
 * A short confirmation at the bottom (link copied …), read out by screen readers. Each message is
 * a fresh element, so its CSS timing (in, hold, out: index.css) starts over; no timers here.
 */
export default function Toast() {
  const toast = useStore((s) => s.toast)
  return (
    <div className="toast" role="status" aria-live="polite">
      {toast && <span key={toast.at}>{toast.text}</span>}
    </div>
  )
}

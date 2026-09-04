// Minimal icon set (Phosphor-style, 1.5 stroke). Kept inline to avoid a dependency for four glyphs.
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24', 'aria-hidden': true }
export const ArrowDown = () => (<svg {...base}><path d="M12 4v16M5 13l7 7 7-7" /></svg>)
export const ArrowRight = () => (<svg {...base}><path d="M4 12h16M13 5l7 7-7 7" /></svg>)
export const ArrowLeft = () => (<svg {...base}><path d="M20 12H4M11 5l-7 7 7 7" /></svg>)
export const Eye = ({ off }) => off
  ? (<svg {...base}><path d="M3 3l18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7-0.5 1.2-1.6 2.8-3.2 4.2M6.2 6.2C4.2 7.7 2.7 9.9 2 12c1 2.5 5 7 10 7 1.4 0 2.7-0.3 3.9-0.9" /></svg>)
  : (<svg {...base}><path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" /><circle cx="12" cy="12" r="3" /></svg>)
export const X = () => (<svg {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>)
export const Warning = () => (<svg {...base}><path d="M12 3l10 18H2L12 3zM12 10v5M12 18h.01" /></svg>)
export const Compass = () => (<svg {...base}><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-4 0 2-6z" /></svg>)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/archivo'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './App.jsx'
import { startClock } from './lib/clock'
import { parsePath } from './lib/address'
import { LANG } from './i18n'

// an address that names no mountain, route or stop goes to the 404 page (static hosts serve it by
// themselves; this covers servers that fall back to the app instead)
if (!parsePath(location.pathname).valid) location.replace('/404.html')
// the page's language comes from its address (the development server serves one HTML for all)
document.documentElement.lang = LANG

startClock()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

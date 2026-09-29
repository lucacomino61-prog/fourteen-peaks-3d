import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/archivo'
import '@fontsource-variable/jetbrains-mono'
import './index.css'
import App from './App.jsx'
import { startClock } from './lib/clock'
import { byId } from './data'

// an address that is neither the home page nor a mountain's goes to the 404 page (static hosts
// serve it by themselves; this covers servers that fall back to the app instead)
const segments = location.pathname.replace(/index\.html$/, '').split('/').filter(Boolean)
if (segments.length > 1 || (segments.length === 1 && !byId[segments[0]])) location.replace('/404.html')

startClock()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

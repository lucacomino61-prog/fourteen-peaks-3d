// "Download for 3D printing": the mountain on screen as an STL file (lib/stlWorker.js makes it off
// the main thread), handed over as a download. Nothing leaves the device: the heightmap comes from
// this site, as it does for the 3D.
import { toast } from './share'
import { fmt } from './format'
import { t } from '../i18n'

export const PRINT = { sizeKm: 12, widthMm: 150, baseMm: 4, grid: 220 }
/** 1 mm on the print is this many metres of mountain */
export const printScale = () => Math.round((PRINT.sizeKm * 1e6) / PRINT.widthMm) // 80,000 → 1:80,000

export function downloadStl(m) {
  return new Promise((resolve) => {
    let worker
    try { worker = new Worker(new URL('./stlWorker.js', import.meta.url), { type: 'module' }) } catch { toast(t('This browser can’t make the file'), 'error'); resolve(false); return }
    const done = (ok) => { worker.terminate(); resolve(ok) }
    worker.onerror = () => { toast(t('Couldn’t make the 3D-print file'), 'error'); done(false) }
    worker.onmessage = ({ data }) => {
      if (data.error) { toast(t('Couldn’t make the 3D-print file'), 'error'); done(false); return }
      const url = URL.createObjectURL(new Blob([data.buf], { type: 'model/stl' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${m.id}-3d-print.stl`
      document.body.append(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
      toast(t('{file} saved: {w} mm across, 1:{scale}', { file: a.download, w: PRINT.widthMm, scale: fmt(printScale()) }))
      done(true)
    }
    fetch(`/terrain/${m.id}/height.json`).then((r) => r.json()).then((meta) => {
      const name = m.peak.name.normalize('NFD').replace(/[^\x20-\x7e]/g, '')
      worker.postMessage({
        url: `/terrain/${m.id}/height-mid.q16`, meta, lat: m.peak.lat, lon: m.peak.lon, elevation: m.peak.elevation,
        ...PRINT,
        header: `${name}, ${PRINT.sizeKm} km square, 1:${printScale()}. Copernicus DEM GLO-30 (c) DLR, Airbus, EU/ESA`,
      })
    }).catch(() => { toast(t('Couldn’t make the 3D-print file'), 'error'); done(false) })
  })
}

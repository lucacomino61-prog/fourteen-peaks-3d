// Decodes a terrain texture into raw RGBA rows off the main thread, bottom row first (v = 0, as
// the terrain samples it), so the page can hand it to the GPU a band of rows per frame (lib/pixels.js).
self.onmessage = async ({ data: { id, url } }) => {
  try {
    if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
      self.postMessage({ id, unsupported: true })
      return
    }
    const res = await fetch(url)
    if (!res.ok) {
      self.postMessage({ id, missing: true })
      return
    }
    const bitmap = await createImageBitmap(await res.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' })
    const { width: w, height: h } = bitmap
    // a CPU canvas: getImageData on a GPU one would read the pixels back from the GPU
    const ctx = new OffscreenCanvas(w, h).getContext('2d', { willReadFrequently: true })
    ctx.setTransform(1, 0, 0, -1, 0, h)
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close()
    const { data } = ctx.getImageData(0, 0, w, h)
    self.postMessage({ id, w, h, buf: data.buffer }, [data.buffer])
  } catch (e) {
    self.postMessage({ id, error: String(e?.message || e) })
  }
}

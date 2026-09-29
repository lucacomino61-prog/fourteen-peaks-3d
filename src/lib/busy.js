// Loading work in flight (shader compiles, textures going to the GPU by the band): frame times
// taken meanwhile say nothing about how fast the GPU draws the scene, so the adaptive resolution
// (scene/Resolution.jsx) doesn't judge them. Each mark keeps it waiting a moment longer.
let until = 0

export function markBusy(ms = 1000) {
  until = Math.max(until, performance.now() + ms)
}

export function isBusy() {
  return performance.now() < until
}

import { useEffect, useState } from 'react'
import { loadTerrain } from './terrain'

/**
 * The terrain for a mountain id: the 512² first-paint version, then the full one. While another
 * id is loading, the previous terrain stays up and `loading` is true.
 */
export function useTerrain(id) {
  const [state, setState] = useState({ terrain: null, id: null })
  useEffect(() => {
    let alive = true
    loadTerrain(id, (full) => { if (alive) setState({ terrain: full, id }) })
      // never let the first-paint version replace a full terrain that arrived first
      .then((t) => { if (alive) setState((s) => (s.id === id && s.terrain && !s.terrain.lo ? s : { terrain: t, id })) })
    return () => { alive = false }
  }, [id])
  return { terrain: state.terrain, loading: state.id !== id }
}

// The scene's light as it is this frame, shared by everything the sun lights: the terrain sets it
// (scene/Terrain.jsx), the plume reads it (scene/Plume.jsx). The default is the site's fixed late
// sun from the south-west, 17° up, which the terrain's baked shadows were made for.
import * as THREE from 'three'

export const DEFAULT_SUN_DIR = new THREE.Vector3(-0.62, 0.26, 0.6).normalize()
export const DEFAULT_SUN_COLOR = new THREE.Color('#ffc99a').multiplyScalar(2.4)

export const light = {
  dir: DEFAULT_SUN_DIR.clone(), // towards the sun, scene axes (+x east, -z north, +y up)
  color: DEFAULT_SUN_COLOR.clone(),
  night: 0, // 0 day … 1 night
}

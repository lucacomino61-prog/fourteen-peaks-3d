# The fourteen 8,000 m peaks in 3D

A single-page, scroll-driven 3D site about the great peaks, one mountain at a time: switch between
them with the arrows on the hero (or the keyboard). Each mountain is a real-terrain model with its
established routes, camps, hazards, key figures and a history timeline.

Flow: the page opens on the bare mountain (drag to turn it 360°, it keeps turning on its own).
Nothing is drawn until a route is picked from the Routes menu in the nav (or the chooser below the
hero); the pick draws the line and scrolls into its camp-by-camp ascent. The explorer is free orbit.

Mountains live in `src/data/<id>.js` (peak facts, routes, hazards, timeline, stats) and
`public/terrain/<id>/` (heightmap + textures). Add one by creating both and listing it in
`src/data/index.js`.

## Run

```bash
npm install
npm run dev
```

The terrain assets in `public/terrain/<id>/` are committed (≈ 30 MB per mountain). To rebuild
them from source data for one mountain (`PEAK` selects the folder and coordinates):

```bash
PEAK=everest npm run terrain
PEAK=everest node scripts/fetch-detail.mjs 16 16 clarity   # 8 km detail layer -> rename to detail16.*
PEAK=everest node scripts/fetch-detail.mjs 17 16 clarity   # 4 km summit layer -> rename to detail17.*
```

That runs three scripts:

| script | what it does |
| --- | --- |
| `scripts/fetch-terrain.mjs` | Downloads the AWS Terrain Tiles (SRTM-derived) and Esri World Imagery for a 31 km tile around K2 at Web-Mercator zoom 13/14 and writes `height.json`. |
| `scripts/fetch-copernicus.mjs` | Replaces the SRTM heights with **Copernicus DEM GLO-30** (TanDEM-X based, far cleaner in the Karakoram), resampled bilinearly onto the same grid → `height.bin` (Float32, 2048², metres). |
| `scripts/build-albedo.mjs` | Builds the satellite texture from Esri **Clarity** imagery: zoom 14 where it is seamless, blended into zoom 13 in the east where the z14 mosaic switches capture → `albedo.jpg`. |

`scripts/probe.mjs` is a helper for placing route data: `el` prints DEM elevations at coordinates,
`profile` samples a line, `crop` / `cropimg` render gridded hillshade or satellite crops with markers.

## Loading and performance

- Heightmaps ship as `height.q16`: quarter-metre uint16, row-delta and zig-zag coded, deflated
  (16 MB → ~3.7 MB per mountain), decoded in the browser with fflate. A 512² `height-lo.q16`
  (~350 KB) paints first; the full one is swapped in when it arrives and the routes are re-draped.
- Lighting is baked per mountain (`light.webp`: sun shadow in R, ambient occlusion in G) by
  `scripts/bake-light.mjs`, so the fragment shader has no ray-march loop; this is what cut the
  shader compile on integrated GPUs from tens of seconds to a few.
- Textures ship as WebP. First paint uses a 1K albedo (~300 KB); the tier's full albedo, the 8 km
  detail layer and the 4 km summit layer stream in afterwards and are switched on through uniforms,
  so there is one shader program and no recompile.
- The terrain program is compiled with `renderer.compileAsync` (KHR_parallel_shader_compile) while
  the meshes sit on a camera-invisible layer, so the page stays responsive during the compile.
- The next and previous mountains' heightmap and 1K albedo are prefetched in idle time.
- `?peak=<id>` deep-links a mountain; the overview grid (`All fourteen`) lists them by height with
  shaded-relief thumbnails (`thumb.webp`).
- Regenerate the shipped assets from the JPEG/`height.bin` sources with `npm run assets`
  (encode heights, bake light, WebP, thumbnails).

## How the 3D works

- `src/lib/terrain.js` loads the heightmap into a float `DataTexture`; the vertex shader in
  `src/scene/Terrain.jsx` displaces a plane with it (1 scene unit = 1 km). Normals are computed per
  texel in the fragment shader; sun shadow and ambient occlusion come from the baked `light.webp`;
  altitude-weighted fog, a cold-shadow grade and a distance dissolve into the CSS sky do the mood.
- Routes (`src/data/<id>.js`) are lat/lon waypoint lists draped onto the surface
  (`src/lib/paths.js`); camp altitudes were checked against the DEM so they match documented values.
- `src/scene/CameraRig.jsx` drives the camera: slow orbit in the hero, a path-following flight
  along the Abruzzi Spur scrubbed by scroll (`src/ui/Ascent.jsx`), then hands over to
  OrbitControls in the explorer with fly-to poses per route.
- Quality tiers (`high` / `medium` / `low`) pick mesh density, shadow steps and DPR from the GPU
  string and viewport width.

## Data and attribution

- Elevation: Copernicus DEM GLO-30, © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH
  2014–2018, provided under COPERNICUS by the European Union and ESA.
- Imagery: Esri World Imagery (Clarity) — Esri, Maxar, Earthstar Geographics, and the GIS User
  Community. Check Esri's terms before commercial use.
- Route and camp positions are approximate reconstructions from published expedition accounts,
  fitted to the terrain. Not for navigation.

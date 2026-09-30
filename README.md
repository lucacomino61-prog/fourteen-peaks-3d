# The fourteen 8,000 m peaks in 3D

A single-page, scroll-driven 3D site about the great peaks, one mountain at a time: switch between
them with the arrows on the hero (or the keyboard). Each mountain is a real-terrain model with its
established routes, camps, hazards, key figures and a history timeline.

Flow: the page opens on the bare mountain (drag to turn it 360°, it keeps turning on its own).
Nothing is drawn until a route is picked from the Routes menu in the nav (or the chooser below the
hero); the pick draws the line and scrolls into its camp-by-camp ascent. The explorer is free orbit.

The design follows the Awwwards-winner vocabulary (see `DESIGN.md`): two colours (night and snow)
and one signal orange, the peak's name at poster size behind the mountain, one animation clock, a
Stop-animations switch in the nav, a list view of the fourteen, and a loader that counts up to the
summit with a skip. The signature is the **contour loupe**: a round loupe that redraws the ground
under the pointer as a two-colour contour map with the corrected altitude (press and hold on a
phone; the explorer's "Contour map" layer draws the whole mountain that way).

Mountains live in `src/data/<id>.js` (peak facts, routes, hazards, timeline, stats) and
`public/terrain/<id>/` (heightmap + textures). Add one by creating both and listing it in
`src/data/index.js`.

## Run

```bash
npm install
npm run dev
```

The terrain assets in `public/terrain/<id>/` are committed (about 15 MB per mountain). Neighbours
share a tile: Lhotse uses Everest's heightmap and imagery, Broad Peak K2's, Gasherbrum I
Gasherbrum II's; each keeps its own summit layers and thumbnail. The pipeline sources
(`terrain-src/`, JPEG and Float32 heightmaps) are not in the repository; to rebuild one mountain
from the original data (network needed; `PEAK` selects the folder and coordinates):

```bash
PEAK=everest npm run terrain
PEAK=everest node scripts/fetch-detail.mjs 16 16 clarity   # 8 km detail layer -> rename to detail16.*
PEAK=everest node scripts/fetch-detail.mjs 17 16 clarity   # 4 km summit layer -> rename to detail17.*
```

That runs three scripts:

| script | what it does |
| --- | --- |
| `scripts/fetch-terrain.mjs` | Downloads the AWS Terrain Tiles (SRTM-derived) and Esri World Imagery for a 2048-pixel tile (32–35 km) around the peak at Web-Mercator zoom 13/14 and writes `height.json`. |
| `scripts/fetch-copernicus.mjs` | Replaces the SRTM heights with **Copernicus DEM GLO-30** (TanDEM-X based, far cleaner in the Karakoram), resampled bilinearly onto the same grid → `height.bin` (Float32, 2048², metres). |
| `scripts/build-albedo.mjs` | Builds the satellite texture from Esri **Clarity** imagery: zoom 14 where it is seamless, blended into zoom 13 in the east where the z14 mosaic switches capture → `albedo.jpg`. |

`scripts/probe.mjs` is a helper for placing route data: `el` prints DEM elevations at coordinates,
`profile` samples a line, `crop` / `cropimg` render gridded hillshade or satellite crops with markers.

## Loading and performance

- Heightmaps ship as `height.q16`: quarter-metre uint16, row-delta and zig-zag coded, deflated
  (16 MB → ~3.7 MB per mountain), decoded with fflate in a worker (`src/lib/heightWorker.js`,
  main-thread fallback). A 512² `height-lo.q16` (~350 KB) paints first; the full one is swapped in
  when it is on the GPU and the routes are re-draped. Phones and weak devices (the low tier) take
  the 1024² `height-mid.q16` instead (~1.2 MB): one value per 31 m, the 30 m DEM's own resolution,
  so a first visit on a phone is 3.5 MB instead of 6. `node scripts/encode-height.mjs --from-q16`
  derives it from the published `height.q16`.
- Drawing: at most 60 frames a second, 30 when the page is at rest (15 with animations stopped),
  none while the reading sections cover the stage (`src/lib/clock.js`); 4× multisampling only on
  phones, tablets and desktop graphics cards (`src/lib/quality.js`). Measured on an Intel HD 4600
  at 1440×900: hero 31 → 60 fps, ascent 41 → 60, explorer 35 → 60, at a higher resolution (1.0×
  instead of 0.75×), and a GPU frame 22–27 → 10–11.5 ms.
- Lighting is baked per mountain (`light.webp`: sun shadow in R, ambient occlusion in G) by
  `scripts/bake-light.mjs`, so the fragment shader has no ray-march loop; this is what cut the
  shader compile on integrated GPUs from tens of seconds to a few.
- Textures ship as WebP. First paint uses a 1K albedo (~300 KB); the tier's full albedo, the 8 km
  detail layer and the 4 km summit layer stream in afterwards and are switched on through uniforms,
  so there is one shader program and no recompile.
- Nothing the GPU does freezes a frame:
  - Textures are decoded in a worker into raw rows (`src/lib/pixelWorker.js`, OffscreenCanvas)
    and sent to the GPU a band per frame (1 / 2 / 4 MB for the low / medium / high tier, mipmaps
    built once after the last band), then their CPU copy is dropped. One `texImage2D` of a 2K
    image froze the page for 50–290 ms on an integrated GPU. Where workers can't decode (Safari
    before 16.4), an `ImageBitmap` or the `TextureLoader` takes over. A restored WebGL context
    remounts the terrain so everything is sent again.
  - The full heightmap goes up the same way while the 512² one stays on screen.
  - The whole scene (terrain, route lines, markers) is compiled in the render commit with
    KHR_parallel_shader_compile, before any frame can draw it. The mountain is revealed once every
    program has linked and its heightmap is on the GPU. An invisible pair of lines
    (`LinePrograms` in `Scene.jsx`) keeps the line shaders alive when drei rebuilds the route lines.
  - The terrain grids are written straight into typed arrays (PlaneGeometry took a quarter of a
    second for the 768² summit patch).
- Memory: the current mountain and the last two visited stay loaded (the last one on phones and
  tablets). Older ones free their heightmaps, GPU textures and first-paint albedo. The render loop
  pauses while the 3D is scrolled away or the overview is open.
- Resolution adapts per screen and frame time (`src/scene/Resolution.jsx`, see `DESIGN.md`); a GPU
  that can't keep up gets half the resolution at once and then the light tier. Add
  `?quality=low` (or `medium`, `high`) to any address to force a tier when testing a device.
- Phones: the stage is `100lvh` (no resize as the browser bars slide), safe-area insets, a compact
  landscape layout, a web manifest with a maskable icon.
- Once a mountain is up, the next and previous mountains' first-paint files (512² heightmap, 1K
  albedo, the small JSON) are prefetched in idle time, about 0.7 MB each, so the arrows switch at
  once. Nothing else is fetched until a mountain is opened; Save-Data and 2G/3G skip it.
- Fonts (Bricolage Grotesque, Archivo, JetBrains Mono) are self-hosted from `@fontsource-variable`.
- Three.js, React, GSAP and the other dependencies build into separate chunks, so a deploy that
  only changes the site re-downloads only the site's own code.
- One animation clock (`src/lib/clock.js`): GSAP's ticker owns requestAnimationFrame and steps
  Lenis (smooth wheel scrolling) and the 3D render (`<Canvas frameloop="never">` + `advance`).
  "Stop animations" (and `prefers-reduced-motion`) turns off Lenis, auto-rotation, easing and
  pulses; programmatic scrolls go through `jumpTo`.
- Every mountain has its own address (`/k2/`, `/everest/` …; older `?peak=<id>` links move there);
  the overview grid (`All fourteen`) lists them by height with shaded-relief thumbnails
  (`thumb.webp`).
- Regenerate the shipped assets from the JPEG/`height.bin` sources with `npm run assets`
  (encode heights, bake light, WebP, thumbnails).

## Pages, sharing and the launch checklist

- **Pages.** The app (`index.html`) plus three plain pages: `privacy/`, `terms/` and `404.html`,
  with shared tokens in `src/base.css`. The 404 is an imaginary mountain drawn as contour lines,
  read through the contour loupe: it starts at 404 m, and its summit (8,404 m) shows the way back.
  A server that answers unknown addresses with the app sends them to `/404.html` (`main.jsx`).
- **One page per mountain.** At build time the `site-pages` plugin (`vite.config.js`) writes
  `dist/<id>/index.html` for each mountain, with its own title, description, canonical link,
  Open Graph and Twitter tags and JSON-LD (`WebPage` about a `Mountain`), all derived from the
  data (`src/lib/meta.js`). The app keeps the head in step when you switch (`src/lib/head.js`);
  Back and Forward move between mountains. It also writes `sitemap.xml` and `robots.txt`, stamps
  "Last updated" (the date of the last commit) and fills in the privacy text that depends on the
  build's settings.
- **Link previews.** `public/og/<id>.jpg` and `home.jpg` (1200×630, 57–105 KB), rendered from the
  built site by `npm run og` (headless Chrome, animations stopped, the controls hidden).
- **Search.** `/` or Ctrl/⌘ K (and "Search" in the nav and the menu): peaks, routes, camps,
  hazards and history years across all fourteen, the mountain on screen first
  (`src/ui/Search.jsx`, a combobox in a native `<dialog>`). A result opens its mountain and goes
  to the route's ascent, the camp or hazard in the explorer, or the year (`src/lib/navigate.js`).
- **Share.** "Copy link" (and the system share sheet on phones) in the footer and the menu; the
  shared address carries `utm_source`/`utm_medium=share`. "Print fact sheet" prints the mountain as
  a black-on-white fact sheet (`src/ui/PrintSheet.jsx` and the `print` styles).
- **Suggest a correction** (`src/ui/Correction.jsx`): checks on send (a summary that takes focus,
  messages under each field, `aria-invalid`), the button is never disabled, a confirmation before
  discarding what was written, and a clear sent or failed state. It posts JSON to
  `VITE_FORM_ENDPOINT` or, without one, opens a prefilled issue in the public repository.
- **Visit counting and consent** (`src/lib/analytics.js`, `src/ui/Consent.jsx`): off unless the
  build sets `VITE_ANALYTICS` (Plausible or Umami, both cookieless), and then only after the visitor
  says yes on a small card; Global Privacy Control and Do Not Track mean no without asking.
  "Privacy choices" in the footer, and the privacy page, change the answer. Counted events: route
  chosen, explorer opened, search, share, and each step of the correction form (opened, started,
  invalid, sent, failed, discarded: its success rate). Campaign tags (`utm_…`) are kept for the
  visit (`src/lib/utm.js`), sent with events and corrections, and taken out of the address bar.
- **Reading bar.** A signal hairline at the top edge, a CSS scroll timeline where supported.
- **Settings** (`src/ui/Settings.jsx`, `src/lib/settings.js`; the sliders button in the nav, the
  menu, the footer): theme Night / Day / System, text size (90–130 %, every size is in rem), heights
  in metres or feet (`src/lib/units.js`: figures, labels, the altimeter; the descriptions keep
  metres), Animations, a battery saver (the light tier, half the frame rate, resolution 1× at most),
  and two notifications: confirmations such as "Link copied" (off: read out to screen readers,
  not shown; errors always show) and "What's new" (on a later visit, a note when the build's
  last-updated date is newer than the one seen, `fp-seen`). Everything applies at once and is kept
  on the device (`fp-settings`, only what differs from the defaults); theme and text size are set
  by a script in every page's head before anything is drawn, so nothing flashes.
- **Checks.** `npm run check` renders every page in headless Chrome and checks every link (inside
  the site against `dist/`, and with `-- --external` the outside ones too), then walks the
  correction form. Settings for the build are in `.env.example`; what the owner still has to decide
  is in `NEEDS_CONTENT.md`.

## How the 3D works

- `src/lib/terrain.js` loads the heightmap into a float `DataTexture`; the vertex shader in
  `src/scene/Terrain.jsx` displaces a plane with it (1 scene unit = 1 km). Normals are computed per
  texel in the fragment shader; sun shadow and ambient occlusion come from the baked `light.webp`;
  altitude-weighted fog, a cold-shadow grade and a distance dissolve into the CSS sky do the mood.
- A GPU without `OES_texture_float_linear` cannot filter a 32-bit float texture (it would sample as
  zero and the mountain would vanish). There the heightmap is sampled nearest and the shader blends
  the four texels itself (`MANUAL_BILINEAR`). To test it, hide the extension from `getExtension`.
- Routes (`src/data/<id>.js`) are lat/lon waypoint lists draped onto the surface
  (`src/lib/paths.js`); camp altitudes were checked against the DEM so they match documented values.
- The DEM rounds off sharp summits: near each peak it tops out 24–242 m below the surveyed height.
  The altimeter therefore follows the ground between stops but is pinned to each card's documented
  altitude, and the Death Zone layer starts where the corrected altitude crosses 8,000 m
  (`src/lib/calibrate.js`), so it appears on every one of the fourteen.
- `src/scene/CameraRig.jsx` drives the camera: slow orbit in the hero, a path-following flight
  along the chosen route scrubbed by scroll (`src/ui/Ascent.jsx`), then hands over to
  OrbitControls in the explorer with fly-to poses per route. A pose aims at most 3.5 km short of
  the summit and keeps the camera within 10.5 km of it, so the summit stays in frame and clear of
  the distance dissolve at every angle of the explorer's orbit. During the ascent the camera rises
  until the point of the climb is in plain view (the ground has to stay a few degrees under the
  line of sight, not just under it), and it looks at most 300 m further up the route, so the camp
  on the card stays near the middle of the frame on long routes.
- Choosing a route changes the ascent's height. When it is chosen further down the page (the
  explorer, search), the page is shifted by the difference before it paints, so the view stays put.
  Browser scroll anchoring is off (`overflow-anchor: none`), so every browser behaves the same.
- Marker and hazard names are HTML (`@react-three/drei` `<Html>`); `src/scene/Declutter.jsx`
  hides the text of any name that would land on a more important one, keeping its dot.
- The contour loupe: `src/lib/loupe.js` tracks the pointer (mouse hover; touch press-and-hold),
  `Terrain.jsx` casts a ray onto the heightfield (`terrain.hitTest`), draws the map inside the ring
  in the fragment shader (`contourMap`: 100 m and 500 m contours from the calibrated height, the
  8,000 m line in signal) and moves the HTML ring and read-out (`src/ui/Loupe.jsx`) in the same frame.
- Quality tiers (`high` / `medium` / `low`) pick mesh density, texture sizes, the upload band and
  the resolution budget from the GPU string and viewport width.

## Data and attribution

- Elevation: Copernicus DEM GLO-30, © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH
  2014–2018, provided under COPERNICUS by the European Union and ESA.
- Imagery: Esri World Imagery (Clarity) — Esri, Maxar, Earthstar Geographics, and the GIS User
  Community. The textures in `public/terrain/` are derived from it and remain under Esri's terms;
  check them before any reuse or commercial use.
- Route and camp positions are approximate reconstructions from published expedition accounts,
  fitted to the terrain. Not for navigation.
- Licence terms for the code and the data: see `LICENSE`.

# DESIGN.md — The fourteen 8,000 m peaks in 3D

Recorded from the built surface (2026-09-04; award redesign 2026-09-29). Governs any extension of this site.

## Direction

**World:** expedition cartography at night. The mountain (real terrain, real imagery, low warm sun,
cold blue shadows, valley fog) is the page; the interface annotates it the way an expedition map or
an altimeter would: hairlines, monospaced measurements, one signal colour.

**Vocabulary:** the Awwwards-winner vocabulary measured in the Award Site Anatomy study
(`~/.claude/skills/awwwards-blueprints`): poster display type, two colours, one named signature
moment borrowing a winner's technique, one animation clock, a Stop-animations switch, a list view of
every index, a loader with a skip. Gate: `node ~/.claude/skills/awwwards-blueprints/scripts/audit.mjs <url>`
(2026-09-29: 0 fail, 29 pass, 1 warn; the warn is weight, 10.9 MB by the fourth scroll step at the
medium tier, which is the terrain itself; first paint is about 1 MB: the 512² heightmap and the 1K albedo).

**Signature — the contour loupe** (Lando Norris's cursor reveal, turned into cartography). A round
loupe follows the pointer over the ground and redraws what is under it as a two-colour contour map:
snow paper shaded by the relief, ink contours every 100 m, index contours every 500 m, the 8,000 m
line in the signal colour, and a read-out of the corrected altitude and position (`≈ 8,350 m ·
35.879° N 76.515° E`). The terrain shader draws the map (`contourMap` in `src/scene/Terrain.jsx`),
the ring and read-out are HTML (`src/ui/Loupe.jsx`) moved in the same frame, the pointer state is
`src/lib/loupe.js`. Phones: press and hold 350 ms to lift it above the finger, drag, let go. Keyboard
and phones: the explorer's **Contour map** layer draws the whole terrain as the map. Hero and
explorer only (where the canvas takes the pointer).

## Colour

Two colours carry the page; one signal marks only what needs marking.

| token | value | role |
| --- | --- | --- |
| `--night` | `#0b0d12` | page ground, panels, the map's ink |
| `--snow` | `#ecebe6` | text, lines, the map's paper, inactive routes, camps, lesser hazards |
| `--signal` | `#ff5b2e` | the active route and its camps, the altimeter dot and its 8,000 m tick, the map's 8,000 m line, the Death Zone band, severity-5 hazards, key years, focus ring |
| `--snow-2` / `--snow-3` | snow at 74% / 58% | secondary text / labels (9.8:1 and 6:1 on night) |
| `--line` / `--line-strong` | snow at 14% / 30% | hairlines, borders |

Routes are told apart by **number** (01–05 in tabs, menus, lists and cards), never by hue. Lesser
hazards are dashed snow rings; grave ones solid signal. The same values live in `src/lib/palette.js`
for the 3D. Dark only.

## Type

Self-hosted variable fonts (`@fontsource-variable`).

- **Poster:** Bricolage Grotesque 800, uppercase, tracking −0.045em, line-height 0.82: the peak's
  name set **behind** the mountain in the stage, under the transparent canvas, so the ridge cuts the
  letters and the far ridges dissolve over them. Fitted to 92% of the width (long names take the
  75% end of the width axis first), at most 480 px or half the viewport height. Hero only; the
  hero's visually hidden `h1` carries the same text.
- **Display:** Bricolage Grotesque for section heads at `--step-display` (56 → 192 px), weight 400,
  tracking −0.045em; uppercase 700 for names (nav, menu, cards, list).
- **Text:** Archivo 400–600, body `--step-0`, line-height 1.55, measure ≤ 62ch.
- **Measurements:** JetBrains Mono with tabular figures: the altimeter (poster-size, up to 152 px),
  the loader's count, altitudes, coordinates, labels. Numbers are written `8,611 m` with a
  non-breaking space whatever the browser's locale (`src/lib/format.js`).

## Space and shape

Utopia fluid space tokens `--space-xs … --space-3xl`; gutter `--gutter`; wrapper 80rem. Controls are
pills (99px radius); panels and cards 4px (bottom sheets on phones 12px top corners). Hairlines, not
boxes, for content. Touch targets ≥ 44 px on phones (the 3D markers grow a padded target).

## Components

- **Nav:** peak name (display, uppercase) + height (mono) · Menu · Search (pill with a magnifier;
  icon-only on phones, in the menu below 420 px) · Stop animations (pill with a dot; pressed = a
  signal square; icon-only on phones) · All fourteen.
- **Reading bar:** a 2 px signal hairline across the top edge, filled by the page's scroll.
- **Hero:** the poster name behind the mountain; bottom-left `02 / 14 · range` (opens the overview)
  and the snow pill "Climb a route →" (the call to action: opens the routes); bottom-right mono side
  notes with a halo; edge arrows.
  The summit marker shows only the height here (the poster already names the peak).
- **Loader** (first load only): the peak's name, an altimeter counting up to the summit's height as
  the terrain arrives, "Skip"; when ready the count tops out and a round portal opens onto the
  mountain (a radial mask on `--hole`, 800 ms); stopped animations: it simply goes.
- **Routes menu:** numbered routes, the active one marked by a signal edge; information links; the
  neighbours.
- **Ascent:** numbered route tabs (the active one outlined in signal); one glass card at a time with
  a signal left edge; the altimeter at poster size, pinned to each card's documented altitude.
- **Explorer:** opaque panel, numbered route rows (signal edge on the active one) with eye toggles;
  layers Camps · Hazard zones · Contour map · Death Zone (signal); detail sheet with a top edge in
  the item's colour.
- **3D markers:** the dot sits on its point with the name to the right; hazard chips sit on their
  point with the name to the left; a name that would land on a more important one hides its text
  (`src/scene/Declutter.jsx`: summit, active camps, hazards, dimmed camps). Names show to 11 km.
- **Overview:** "The fourteen" as a grid of shaded-relief cards or a **list** (rank, peak, height,
  countries, first ascent, routes, deaths); a modal that traps and returns focus.
- **Numbers, History, Footer:** display heads; stats as big display values over mono labels between
  hairlines; timeline years in mono, key years (`highlight: true` in the data) in signal. The footer
  ends with outline pills (Copy link · Print fact sheet · Suggest a correction; Share on phones) and
  a small-print bar: Privacy · Terms of use · Source, and "Last updated" in mono.
- **Dialogs** (native `<dialog>`, panel colour, 14 px radius, night backdrop; full screen on phones):
  search is a combobox (mono type labels, the highlighted result marked by a signal edge like the
  active route); the correction form has 48 px fields, labels above, "required" / "optional" in
  mono, errors as a signal dot + text under the field and a summary box with a signal edge; the
  discard confirmation is a small dialog over it with a signal "Discard".
- **Consent card** (only when visit counting is set up): bottom-left panel, "Count my visit" (snow)
  and "No thanks" (outline) of equal size.
- **Toast:** a snow pill at the bottom centre, 2.6 s ("Link copied").
- **Plain pages** (privacy, terms, 404): a solid bar (brand · Back to the mountains), a 68-character
  reading column under a display head, mono "Last updated". The 404's map is the loupe in miniature:
  ghost contours in snow, the ground under the ring as night-on-paper contours, the 8,000 m line in
  signal; the ring turns signal at the summit.
- **Print:** only the fact sheet, black on white: the name in the display face, mono height, routes
  with their camps, hazards, the numbers, the history, sources and the page's address.

## Motion

One authored moment: the camera. Hero orbit (slow, drag to turn), the scroll-scrubbed flight up the
chosen route, eased fly-to poses in the explorer (a pose aims at most 3.5 km short of the summit and
keeps the camera within 10.5 km of it). UI transitions ≤ 300 ms ease-out, transforms and opacity
only.

**One clock** (`src/lib/clock.js`): GSAP's ticker owns requestAnimationFrame; Lenis (smooth wheel
scrolling, `autoRaf: false`) and the 3D (`<Canvas frameloop="never">` + `advance`) are stepped from
it. Measured: one loop, ~60 requestAnimationFrame calls a second. Programmatic scrolls go through
`jumpTo`. The explorer's stage and the scrollable overlays carry `data-lenis-prevent`.

**Stop animations** (`html[data-motion="off"]`, remembered; on from the start under
`prefers-reduced-motion`): no Lenis, no hero auto-turn or explorer auto-rotate, camera cuts instead
of eases, the scroll flight follows the scroll exactly, no pulsing markers, rings or Death Zone edge,
the loader just goes. CSS transitions take 0 s, not the common 0.01 ms: every element's
`transition-property` defaults to `all`, so a 0.01 ms duration on `*` gives every element a
transition, and a size read right after a write returns the old value (it left the poster name at a
third of its size). CSS animations jump to their end; the toast keeps its 2.6 s, without movement.

## Responsive

Breakpoint 760px. Below it: side notes hidden, the poster sits higher, the explorer panel and detail
become bottom sheets (≤ 46vh), the altimeter moves to the top right, the list view keeps rank,
peak and height, the camera pulls back ×1.7, quality tier `low`.

Phones and tablets: the 3D stage is `100lvh`, so the canvas never resizes as the browser bars slide
(iOS Safari, Android Chrome); every edge control sits inside `env(safe-area-inset-*)` (notch, home
indicator, landscape cut-outs); a landscape phone (height ≤ 500px) gets a compact nav and sheets;
touch targets are ≥ 44 px; the loupe is press-and-hold, which pauses the drag and the page scroll;
the stage blocks text selection and the iOS callout. Installable: web manifest, maskable icon,
`theme-color` night.

## Performance tiers

`high` 1024² mesh, 4K textures · `medium` 512² + 768² summit patch, 2K textures (integrated Intel,
Mali, Adreno, Apple) · `low` 320² + 384², 2K albedo only (narrow viewports, ≤ 2 cores or ≤ 2 GB).
Lighting is baked, so no tier pays for a shadow march.

Resolution is steered, not fixed (`src/scene/Resolution.jsx`): a pixel budget per tier (8.5 / 2.4 /
1.6 MP) caps the pixel ratio, then frame time moves it in 0.25 steps between 0.75 and the cap
(stepping up only while it holds 60 fps, locking after a step up that cost frames); frames taken
while a mountain loads don't count. Measured: Intel HD 4600 at 1440×900 settles at 0.75 (27 → 35
fps), a phone profile renders at 1.75× instead of 1× at 60 fps.

Nothing the GPU does may freeze a frame: shaders compile in the background before the mountain is
revealed, and textures and the full heightmap go up a band of rows per frame (1 / 2 / 4 MB for
low / medium / high). Measured on the HD 4600, first visit: main-thread long tasks during load
2,770 → ~450 ms, and a repeat visit has one (the resolution step). Memory after visiting all
fourteen: 340 → 162 MB of JS heap.

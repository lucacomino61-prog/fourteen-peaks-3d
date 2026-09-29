# DESIGN.md — The fourteen 8,000 m peaks in 3D

Recorded from the built surface (2026-09-04, updated 2026-09-29). Governs any extension of this site.

## World

Expedition cartography at night. The mountain (real terrain, real imagery, low warm sun, cold blue
shadows, valley fog) is the page; the interface annotates it the way an expedition map or an
altimeter would: hairlines, monospaced measurements, one warm accent. Nothing is framed in cards
except the two floating instruments (ascent card, explorer panel) that must sit on top of the 3D.

Mode: **Experience** (the 3D leads) with **Read** duties (routes, hazards, history).

## Colour

| token | value | role |
| --- | --- | --- |
| `--bg-0` | `#07090f` | page ground, sky bottom |
| `--bg-1..3` | `#0b0e17`, `#10141f`, `#161b28` | surfaces, 5–8% steps |
| `--line` / `--line-strong` | `rgba(190,205,235,.14 / .28)` | hairlines, borders |
| `--text` / `--text-2` / `--text-3` | `#e8ebf2` / `#a9b1c3` / `#6f7890` | body / secondary / labels |
| `--accent` / `--accent-2` | `#ff6a3d` / `#ffb08f` | warm orange: primary action, active state, altimeter dot, key years |
| `--danger` / `--warn` | `#ff3b3b` / `#ffb64d` | hazard severity 5 / 3–4, Death Zone band |
| route colours | set per route in `src/data/<id>.js` | the only other chroma on the page; used identically in 3D lines, markers, list swatches and section bars |

Single theme: dark, locked. The fixed stage carries a radial sky gradient; content sections after the
explorer sit on `--bg-0` while the stage dims to 35%. Small text over the terrain (hero index and
side notes) uses `--text-2`, never `--text-3`, with the markers' dark halo: it sits on bright snow.

## Type

Self-hosted variable fonts (`@fontsource-variable`).

- Display: **Bricolage Grotesque** (optical size axis, weights 300–600): nav brand, section heads
  at `--step-5` weight 400, menu and card titles.
- UI / body: **Archivo** 400–600, body `--step-0`, line-height 1.55, measure ≤ 60ch.
- Data: **JetBrains Mono** for altitudes, coordinates, altimeter, small labels only (never as a
  "technical" costume for prose).
- Fluid scale `--step--1 … --step-5` (Utopia 1.2→1.25); no kickers/eyebrows above headings.

## Space and shape

Utopia fluid space tokens `--space-xs … --space-3xl`; sections at `--space-3xl`; gutter
`--gutter`; wrapper 80rem. One radius: 4px (bottom sheets on mobile: 12px top corners).
Hairline dividers (`--line`), never boxed cards for content.

## Components

- **Buttons**: 44px, radius 4, primary = accent fill with near-black text; ghost = hairline + blurred
  dark fill; press `scale(.97)` 160ms ease-out.
- **Ascent card**: floating instrument bottom-left, blurred dark glass, altitude in mono + title +
  copy + hazard line; only one active; fade/rise 320–420ms.
- **Altimeter**: bottom-right mono readout with vertical rail, 8,000 m tick in red. It follows the
  ground between stops and shows each card's documented altitude at the stop (the elevation model
  rounds off summits, so its raw heights run low near the top).
- **Explorer panel**: opaque dark (no backdrop blur; Chrome/WebGL paint bug), route rows with colour
  swatch + eye toggle, layer toggles (accent when on, danger for Death Zone).
- **Detail sheet**: bottom-right, 2px top border in the item's colour.
- **3D markers**: the dot sits on the point, over its 3D sphere, with the label to the right and a
  heavy text shadow; hidden when terrain occludes the point or it is more than 11 km away (where
  the terrain starts to dissolve); non-active routes' camp labels dimmed in the explorer.
- **Hazard zones**: pulsing rings draped on the terrain, colour by severity; the `!` chip sits on
  the zone's centre with the name to its left, so a hazard at a camp never covers the camp's label.
- **Label placement**: a name that would land on a more important one hides its text and keeps its
  dot or chip (summit, then the active route's camps, then hazards, then dimmed camps).
- **History**: key years (first ascent and what defines each mountain) marked in the accent, set
  per entry with `highlight: true`.

## Motion

One authored moment: the camera. Hero orbit (slow, drag to turn), scroll-scrubbed flight up the
chosen route, eased fly-to poses in the explorer (1.6s cubic). A route's pose aims at most 3.5 km
short of the summit and keeps the camera within 10.5 km of it, so the summit stays in the frame
and out of the distance dissolve as the explorer orbits. UI transitions ≤ 420ms ease-out,
transforms and opacity only. `prefers-reduced-motion` collapses UI transitions to 1ms; the scroll
flight remains (it is the content), with `scroll-behavior: auto`.

## Mountain switcher

The hero is a product page for one peak at a time: edge arrows (48 px ghost circles, keyboard
left/right), a mono index line (`01 / 14 · range`) that opens the overview, and "Routes and
information"; "Next: <peak>" sits in the side notes. Switching resets scroll, route and selection;
the 3D stage dims to 25% while the new terrain loads and the shader program is reused, so there
is no recompile.

## Overview grid

`All fourteen` (nav, and the hero index) opens a full-screen overlay: cards ranked by height with
shaded-relief thumbnails, name, height, countries; the current peak outlined in the accent. Two
columns on phones, auto-fill 17rem columns on desktop. Escape or the close button dismisses it.

## Responsive

Breakpoint 760px. Below it: nav links hidden, hero side notes hidden, explorer panel and detail
become bottom sheets (≤ 46vh), camera pulls back ×1.7 and aims lower so the mountain sits above
the sheet, quality tier `low` (320-segment mesh, 2K base texture only).

## Performance tiers

`high` 1024² mesh, 4K textures, DPR ≤ 1.75 · `medium` 512² + 768² summit patch, 2K base and
4K summit layer, DPR 1 (integrated Intel, Mali, Adreno) · `low` 320², 2K base only (narrow
viewports, ≤ 2 cores or ≤ 2 GB). Lighting is baked, so no tier pays for a shadow march.

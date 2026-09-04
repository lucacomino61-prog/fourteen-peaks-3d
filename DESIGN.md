# DESIGN.md — K2 & Everest in 3D

Recorded from the built surface (2026-09-04). Governs any extension of this site.

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
| `--accent` / `--accent-2` | `#ff6a3d` / `#ffb08f` | Abruzzi orange: primary action, active state, altimeter dot |
| `--danger` / `--warn` | `#ff3b3b` / `#ffb64d` | hazard severity 5 / 3–4, Death Zone band |
| route colours | Abruzzi `#ff6a3d`, Česen `#ffc14d`, North `#5fd3ff`, Magic `#c77dff`, West `#7dffb3` | the only other chroma on the page; used identically in 3D lines, markers, list swatches and section bars |

Single theme: dark, locked. The fixed stage carries a radial sky gradient; content sections after the
explorer sit on `--bg-0` while the stage dims to 35%.

## Type

- Display: **Bricolage Grotesque** (opsz 12–96, weights 300–600). Hero "K2" at `--step-hero`
  weight 300, tracking −0.045em, line-height 0.85. Section heads at `--step-5` weight 400.
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
- **Altimeter**: bottom-right mono readout with vertical rail, 8,000 m tick in red.
- **Explorer panel**: opaque dark (no backdrop blur; Chrome/WebGL paint bug), route rows with colour
  swatch + eye toggle, layer toggles (accent when on, danger for Death Zone).
- **Detail sheet**: bottom-right, 2px top border in the item's colour.
- **3D markers**: dot + label with heavy text shadow; hidden when terrain occludes the point or the
  camera is far; non-active routes' camp labels dimmed in the explorer.
- **Hazard zones**: pulsing rings draped on the terrain, colour by severity, `!` chip label.

## Motion

One authored moment: the camera. Hero orbit (slow), scroll-scrubbed flight up the Abruzzi Spur,
eased fly-to poses in the explorer (1.6s cubic). UI transitions ≤ 420ms ease-out, transforms and
opacity only. `prefers-reduced-motion` collapses UI transitions to 1ms; the scroll flight remains
(it is the content), with `scroll-behavior: auto`.

## Mountain switcher

The hero is a product page for one peak at a time: edge arrows (48 px ghost circles, keyboard
left/right), a mono index line (`01 / 02 · range`), and a "Next: <peak>" ghost button. Switching
resets scroll, route and selection; the 3D stage dims to 25% while the new terrain loads and the
shader program is reused so there is no recompile. Long peak names use a smaller hero size token.

## Overview grid

`All fourteen` (nav, and the hero index) opens a full-screen overlay: cards ranked by height with
shaded-relief thumbnails, name, height, countries; the current peak outlined in the accent. Two
columns on phones, auto-fill 17rem columns on desktop. Escape or the close button dismisses it.

## Responsive

Breakpoint 760px. Below it: nav links hidden, hero side notes hidden, explorer panel and detail
become bottom sheets (≤ 46vh), camera pulls back ×1.7 and aims lower so the mountain sits above
the sheet, quality tier `low` (320-segment mesh, no shadow march).

## Performance tiers

`high` 1024² mesh, 4K textures, DPR ≤ 1.75 · `medium` 512² + 768² summit patch, 2K base and
4K summit layer, DPR 1 (integrated Intel, Mali, Adreno) · `low` 320², 2K base only (narrow
viewports, ≤ 2 cores or ≤ 2 GB). Lighting is baked, so no tier pays for a shadow march.

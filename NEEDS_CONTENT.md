# Before launch

What only the owner can decide or supply. The site builds and works without any of it; see
`.env.example` for how each setting is passed to the build.

| Item | Why | Where |
| --- | --- | --- |
| The site's address | Canonical links, link previews and the sitemap need it; without it they point at `https://fourteen-peaks.example`. | `SITE_URL` at build time |
| Visit counting | Off until a cookieless service is chosen (Plausible or Umami) and its site id set; the consent card appears only then. | `VITE_ANALYTICS`, `VITE_ANALYTICS_SRC`, `VITE_ANALYTICS_SITE` |
| Where corrections go | Without a form service, "Suggest a correction" opens a prefilled public issue on GitHub (the visitor needs a GitHub account). A form service (Formspree, Web3Forms …) takes them privately, with an optional email. | `VITE_FORM_ENDPOINT` |
| A contact address | The privacy page points to the public repository for questions. A direct address may be wanted; none is invented here. | `privacy/index.html` |
| A legal read of the privacy and terms pages | Written plainly from what the site actually does; not checked by a lawyer, and no governing law is named. | `privacy/index.html`, `terms/index.html` |
| The Esri imagery | The satellite textures derive from Esri World Imagery and are published with the site; whether that use is covered is the owner's call (noted in LICENSE). | `public/terrain/*/albedo*.webp`, `detail*.webp` |
| The summit weather's terms | Open-Meteo's free API is for non-commercial use only (under 10,000 calls a day, counted per caller); its data is CC BY 4.0 and credited wherever it shows. If the site ever earns money (ads, sales, a paid tier), it needs Open-Meteo's paid plan, or the weather taken out. | `src/lib/weather.js` |

After changing the site's look, render the link previews again: `npm run build && npm run og`.
Before publishing: `npm run build && npm run check -- --external` (every link on every page, and
the correction form).

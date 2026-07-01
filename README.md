# Stores — Sales Dashboard (PWA)

A mobile-first dashboard UI recreated in plain HTML/CSS/JS as an installable
**Progressive Web App**, so it can be added to a phone's home screen and run
full-screen like a native app.

## Screens

| File | Screen |
| --- | --- |
| `index.html` | Home / dashboard (greeting, month sales, sales targets, tiles) |
| `sales-analyzing.html` | Sales Analyzing (purchase orders, gross & net profit) |
| `your-sales.html` | Your Sales (yearly chart + averages) |

The bottom tab bar links the screens together.

## Run locally

It's just static files — serve the folder with any static server:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Then, in the phone browser, use **Share → Add to Home Screen** (iOS) or the
browser's **Install app** prompt (Android/Chrome) to add it to the home screen.

> A service worker (`service-worker.js`) caches the pages so the installed app
> also works offline.

## Design system

Everything visual lives in `assets/css/style.css`. Reuse these building blocks
for new pages instead of writing new CSS.

**Design tokens** (CSS variables in `:root`):

- Colors: `--bg`, `--card`, `--lime`, `--blue-1/2/3`, `--text`, `--text-dim` …
- Radii: `--radius-xl/lg/md/sm`
- Layout: `--app-max` (phone width), `--pad`

**Reusable components / classes:**

- `.app` — the phone-shaped shell (full-bleed on phones, framed on desktop)
- `.statusbar` — faux iOS status bar
- `.topbar`, `.icon-btn`, `.avatar` — page headers
- `.card`, `.card-hero`, `.rings` — surfaces (dark, blue gradient, decorative rings)
- `.metric`, `.eyebrow`, `.subtle` — money/metric typography
- `.months` / `.month` — month selector pills (`.active`, `.dashed`)
- `.progress` — sales-target progress bar (set `--value`)
- `.tiles` / `.tile` — 2-up navigation tiles
- `.profit-blue`, `.profit-lime` — colored profit cards
- `.mini-grid` / `.mini` — small stat cards
- `.segment` — All/Year/Month/Week segmented control
- `.chart-card` — chart container (SVG area chart inside)
- `.stat-row` — labeled figures on a colored card
- `.tabbar` — bottom navigation

## Adding a new page

1. Copy an existing HTML file (e.g. `sales-analyzing.html`) as a template — it
   already has the status bar, PWA `<head>` tags, and bottom nav wired up.
2. Build the body from the components above.
3. Add the new file to the `ASSETS` list in `service-worker.js` and bump
   `CACHE_VERSION` so installed apps pick it up.
4. Link to it from the tab bar or a tile.

## Icons

`assets/icons/icon.svg` is the master icon. The PNG sizes (`icon-180/192/512`
and `icon-maskable-512`) are generated from it and referenced by
`manifest.webmanifest` and the `apple-touch-icon` link.

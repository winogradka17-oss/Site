# Site

Installable **Progressive Web Apps**, all built in plain HTML/CSS/JS in the
shared dark + lime design language:

1. **Stores — Sales Dashboard** (root) — the design template.
2. **Зарплата** (`/zarplata/`) — a real earnings tracker, redesigned in this
   style. See [`zarplata/`](zarplata/) and the section at the bottom.
3. **CS2 Pack Opening** (`cs2-packs.html`) — a FUT-style card pack-opening game
   for CS2 pros. See the section below.

---

# CS2 Pack Opening (`cs2-packs.html`)

A Counter-Strike 2 twist on FIFA / EA FC **Ultimate Team pack openings**. Spend
coins on crates, watch the walkout reveal animation, and collect FUT-style
player cards for real CS2 pros across four rarities.

Open `cs2-packs.html` directly (it installs as its own app).

## What's in it

- **Four card rarities** recreated in pure CSS to match the supplied designs:
  **Bronze**, **Silver**, **Gold** and the ivory **Icon**. Each card has the
  shield frame, rating + role (AWP / RIF / ENT / IGL / SUP / LUR), player
  silhouette, name banner, nation flag, team shield and six CS2 stats
  (**FIR · UTL · SNP · IMP · CLT · OPN**).
- **The walkout reveal** — tap a crate to open: screen flash, a rising beam of
  light tinted by the pull's rarity, rotating "walkout" rays for Gold/Icon,
  sparkle particles, a 3-D card flip and stats that count up. Rarity-tuned
  WebAudio blips (toggle with the speaker button, no audio files).
- **Coins economy** — four crates (`Starter / Prime / Elite / Legends Vault`)
  with different costs and drop odds. Quick-sell duplicates for coins, or claim
  a small top-up if you go broke.
- **My Club** — every pull is saved (localStorage), deduplicated with a copy
  count, sorted by rating, with totals and a best-card stat. Tap any card for a
  detail view.

The player pool, drop odds and stat model all live in `assets/js/packs.js`;
all visuals (cards + animation) live in `assets/css/packs.css`.

---

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

---

# Зарплата — earnings tracker (`/zarplata/`)

A personal earnings tracker, **redesigned** from an older single-file app into
the modern dark + lime design language of this repo. All functionality and data
are preserved — the redesign is purely the visual/UX layer.

Open `zarplata/index.html`. On a phone: **Поделиться → На экран «Домой»** (iOS)
or **Install app** (Android/Chrome) to install it as its own app (its own icon,
name and offline scope, separate from the dashboard).

## Features (unchanged from the original)

- **Дни** — per-day earnings: a hero total card, per-system tags, record list,
  swipe/arrows to move between days, "repeat previous day".
- **Журнал** — searchable log of every record, grouped by date with daily totals.
- **Статистика** — monthly goal progress, distribution donut (by pay system),
  averages & month forecast, 6-month dynamics bars, all-time and by-year totals.
- **Ставки** — pay rates (hourly / per-shift / piece-rate for «Доска» &
  «Переклейка»), monthly goal, and JSON backup (export / import).
- **Add / edit** flow in a bottom sheet with a live sum preview.

## Data & compatibility

- Everything is stored **on-device** in `localStorage`
  (`zp_rec_v4`, `zp_rate_v4`, `zp_goal_v4`).
- The record model is **identical** to the original, so existing data keeps
  working after the redesign. Rates are stamped per-record, so changing a rate
  never rewrites past earnings.
- The app also runs as a standalone `file://` page; the service worker
  (`sw.js`) only adds offline caching when hosted over http(s).

## What changed in the redesign

- New type system (Plus Jakarta Sans), tokens and spacing matching the dashboard.
- Day total turned into a gradient **hero card** with lime glow + ring motif.
- Records, stats and the goal/donut/bars restyled as large rounded cards.
- Modern bottom tab bar (icon + label + active lime dot), redesigned FAB.
- Reworked bottom sheet (rounded, lime stepper, colored option tiles, live sum).
- New app icon (`icon.svg` + generated PNG sizes) with a ₽ + rising-bars mark.

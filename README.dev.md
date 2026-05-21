# lufetah/lufetah — self-updating profile README

The file GitHub shows on the profile is **`README.md`**, which is **generated** — don't
hand-edit it. Edit the source, run the build (or just push), and a GitHub Action keeps
the numbers fresh from real GitHub activity.

## How it renders on GitHub
GitHub strips `<style>`, JS, and inline `<svg>` from markdown. The workaround:
the whole page is a committed **`assets/profile.svg`** referenced as an `<img>`.
In that sandboxed image context:
- **fonts work** — Instrument Serif is embedded as a base64 data-URI `@font-face`
  inside the SVG (external font URLs are blocked, data URIs are not);
- **animations work** — the pulsing chart peak / live dots are SMIL `<animate>`;
- **links don't** — so the **Connect** row is separate clickable badge images
  (`assets/connect-*.svg`) wrapped in markdown links.

## Customize
Everything you'd want to change is content, in **`src/config.mjs`**: name, meta row,
tagline, manifesto, the **Currently** rows (fill in the empty `value`s), **Connect**
links, footer. Re-run the build to apply.

## Commands
```bash
npm run build      # regenerate README.md + assets/*.svg (placeholder data w/o a token)
GITHUB_TOKEN=$(gh auth token) npm run build   # …with REAL data locally
npm run preview    # serve at http://localhost:4173 to eyeball the SVGs
npm run fonts      # re-vendor the font subset (only if you add new glyphs/chars)
```

## Live data
`src/github.mjs` pulls public data via the GitHub GraphQL API (`user(login:…)`),
so the Action's built-in `GITHUB_TOKEN` is enough — no PAT needed.

Stat semantics (edit `src/github.mjs` to change):
- **Contributions** = total contributions in the last year (the big first stat).
  (Public-repo count is still fetched as `stats.shipped` if you'd rather show that.)
- **Longest Streak** = longest run of consecutive days with ≥1 contribution (last year).
- **Avg Commits** = last-year total contributions ÷ 52.
- **Activity chart** = weekly contribution totals, last 26 weeks; peak callout = the max week.
- **YoY pill** = this 26-week window vs. the same window a year earlier; **hidden when
  there's no prior-year data** (new accounts).

## Automation
`.github/workflows/profile.yml` runs daily (06:00 UTC), on manual dispatch, and on
pushes that touch `src/**` or `scripts/**`. It regenerates and commits `README.md` +
`assets/*.svg`. The push trigger ignores those output paths (and the commit is
`[skip ci]`), so the bot never triggers itself.

## File map
```
src/config.mjs      ← edit me (all content)
src/theme.mjs       design tokens (colors, fonts)
src/github.mjs      data fetch + stat derivation
src/fonts.mjs       embeds the vendored font as base64
src/svg/page.mjs    renders the whole profile page SVG
src/svg/badges.mjs  renders the clickable connect badges
scripts/generate.mjs   orchestrator → writes README.md + assets/
scripts/fetch-fonts.mjs vendors the Instrument Serif subset
scripts/serve.mjs   local static preview server
assets/             generated SVGs + vendored font (committed)
```

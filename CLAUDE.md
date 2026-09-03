# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A small static-data pipeline for the CCNC (Central Cities Navigation Center) public performance dashboard, embedded via Squarespace Code Blocks. There is no build system, package.json, or test suite — this is intentionally minimal: one Node script, one GitHub Actions workflow, and three standalone HTML files meant to be pasted directly into Squarespace.

```
Monday.com API → GitHub Actions (daily, 8am UTC) → data.json → GitHub Pages → Squarespace dashboard
```

## Commands

There is no `npm install`/build/lint/test step for this repo. The only "run" path is the GitHub Actions workflow itself:

- Manual trigger: GitHub → Actions tab → "Update CCNC Dashboard Data" → Run workflow (or `gh workflow run update-data.yml`)
- Local dry run of the fetch script: `MONDAY_TOKEN=<token> node fetch-data.js` (requires `node-fetch@2`, e.g. `npm install node-fetch@2` first — there's no lockfile committed)
- HTML files (`squarespace-code-block-*.html`) have no build step; edit and paste the raw contents directly into a Squarespace Code Block to test/deploy.

## Architecture

### `fetch-data.js`
Queries the Monday.com GraphQL API (`https://api.monday.com/v2`) for a hardcoded list of 10 board IDs (`BOARD_IDS`), using the `MONDAY_TOKEN` GitHub secret (scoped `boards:read`). It writes the raw, mostly-unprocessed GraphQL response straight to `data.json` (plus a `last_updated` timestamp) — it does **not** reshape or aggregate the data. All interpretation of columns/items happens client-side in the dashboard HTML.

### `.github/workflows/update-data.yml`
Runs daily at 8am UTC (and on `workflow_dispatch`), calls `fetch-data.js`, deploys the repo root to GitHub Pages (`upload-pages-artifact` / `deploy-pages`), then commits an updated `.github/status/last-run.txt` timestamp back to the repo. Most commit history in this repo is these automated "Record scheduled run timestamp" commits — that's expected noise, not a signal of stale work.

### `squarespace-code-block-dashboard.html`
The only one of the three HTML files that's dynamic. It fetches `https://ggcity.github.io/ccnc-dashboard-data/data.json` at runtime and renders charts with Chart.js (loaded from cdnjs). All logic lives in one inline `<script>` (self-contained IIFE, no build step, ES5-leaning style for broad browser support):

- `parse(boards)` (around line 454) is the critical piece: it indexes `json.data.boards` by board ID into a `B` map, then pulls specific items/columns out of each board **by hardcoded Monday.com board ID and column ID** (e.g. `B['10074819030']`, `col(i, 'numeric_mktwg5hy')`). These IDs are Monday.com-internal and opaque — if a board or column is restructured in Monday.com, both this file's `parse()` and `fetch-data.js`'s `BOARD_IDS` array must be updated together, and the mapping of which board ID → which section of the dashboard is only documented in `parse()` itself (cross-reference against the board table in `README.md`).
- Rendering is manual DOM/HTML-string building (`stat()`, `card()`, `leg()`, `srData()`) rather than a templating library, with matching `sr-only` accessible data lists alongside every chart (WCAG 1.1.1) — preserve this pairing when adding new charts.
- Tabs use a hand-rolled WAI-ARIA APG roving-tabindex pattern (`switchTab`/`wireTabs`); charts are destroyed and redrawn on tab switch and resize (`destroyCharts`, `charts` array) since Chart.js canvases don't resize well when hidden.
- Respects `prefers-reduced-motion` for chart animations.
- Colors are chosen and commented for WCAG contrast ratios (e.g. `C1 = '#e8630a' /* orange — 3.4:1 */`) — keep contrast annotations in sync if palette values change.

### `squarespace-code-block-pit-count.html` and `squarespace-code-block-success-stories.html`
Static content blocks (no `data.json` fetch, no Chart.js) — styling/copy only, scoped under `.ccnc` / `.ccnc-wrap` classes to avoid leaking styles into the rest of the Squarespace site. Version/changelog notes for these are kept as HTML comments at the top of the file (e.g. pit-count.html's `v6` accessibility changelog) — follow that convention when making notable revisions.

## Security model

- `MONDAY_TOKEN` lives only in GitHub Actions Secrets, scoped `boards:read`, never exposed client-side.
- `data.json` is public (served via GitHub Pages) and should only ever contain data already shown on the public dashboard — don't fetch or persist any board/column not meant for public display.

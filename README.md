# CCNC Dashboard Data

Automated data pipeline for the **Central Cities Navigation Center (CCNC) Performance Dashboard**, a public-facing transparency dashboard embedded on the SquareSpace website of CCNC.

## Overview

This repository uses GitHub Actions to fetch live performance data from Monday.com once daily and publish it as a static JSON file via GitHub Pages. The JSON is consumed by a Squarespace code block that renders it as interactive charts — with no API token ever exposed to the browser.

## How it works

```
Monday.com API → GitHub Actions (daily) → data.json → GitHub Pages → Squarespace dashboard
```

1. A scheduled GitHub Action runs every day at 8am UTC
2. It calls the Monday.com GraphQL API (`https://api.monday.com/v2`) using a scoped `boards:read` OAuth token stored as a GitHub secret
3. It fetches data from 10 specific CCNC boards
4. The resulting `data.json` is deployed to GitHub Pages
5. The Squarespace embed fetches from `https://ggcity.github.io/ccnc-dashboard-data/data.json`

## Data source

**Platform:** Monday.com (City of Garden Grove account)
**API:** Monday.com GraphQL API v2
**Scope:** `boards:read` — read only, no write access

### Boards included

| Board | Description |
|---|---|
| Current Client Count Data | Live bed count per city |
| Client Breakdown | Males, females, pets — current and total |
| Client Referrals to Services | Medical, income, housing, recovery referrals |
| Client Income | Sources of income distribution |
| Client Housing Search Status | Housing navigation pipeline |
| Housing Exits | Housed, family reunification, 90-day rehab |
| Client Age | Age distribution of current residents |
| Senior Data | Senior (55+) counts by quarter |
| Veteran Data | Veteran counts by quarter |
| Intake & Exit Data | Cumulative intakes and exits by city |

## Files

| File | Description |
|---|---|
| `fetch-data.js` | Node.js script that calls the Monday.com API and writes `data.json` |
| `.github/workflows/update-data.yml` | GitHub Actions workflow — runs daily and on manual trigger |
| `squarespace-code-block.html` | The dashboard embed — paste contents into a Squarespace Code Block |

## Security

- The Monday.com API token is stored exclusively in GitHub Actions Secrets (`MONDAY_TOKEN`) and is never exposed to the browser
- The token is scoped to `boards:read` only — it cannot write, modify, or delete any data
- The published `data.json` contains only the data already displayed publicly on the dashboard

## Manual trigger

To force a data refresh outside the daily schedule:

1. Go to the **Actions** tab
2. Click **Update CCNC Dashboard Data**
3. Click **Run workflow**

## API Token Owner

**Nikita Smelkov** — City of Garden Grove
nikitas@ggcity.org

## Partners

- Garden Grove
- Westminster
- Fountain Valley

Developed in partnership with the City of Westminster, City of Fountain Valley, and the County of Orange as part of the Central Cities Navigation Center initiative.

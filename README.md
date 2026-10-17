# TinkerHub website redesign

A redesign of [tinkerhub.org](https://tinkerhub.org): a free, student-run learning community in Kerala where students learn tech by building real projects together.

## Pages

| File | Page |
|---|---|
| `index.html` | Home: 3D hero, 3D community story, student projects, numbers, the five tracks, this week's events, stories, why give, get involved |
| `programs.html` | The five tracks of TinkerHub's action plan, with a 3D workbench |
| `events-community.html` | Events and opportunities filtered by track, plus the campus finder and 3D campus network |
| `impact.html` | Impact stories with charts and a 3D map of Kerala |
| `major-events.html` | Records for Useless Projects, Tink-Her-Hack and LAYOVER |
| `reports.html` | Newsletter (Kolaambi) and publication archive |
| `partner.html` | For government, CSR teams and donors |
| `docs/site-standard.html` | Internal design and content standard (not linked from the site) |

## Run it locally

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish with GitHub Pages

Settings → Pages → Deploy from a branch → `main` / root. The `.nojekyll` file is included.

## How it is built

- Each page holds its markup in a `<template id="page">` with `{{holes}}`, `<sc-for>` loops and `<sc-if>` conditions, plus a small `Component` class with the page's data and behaviour.
- `js/tinker-runtime.js` renders the template with [Preact](https://preactjs.com) and re-renders when the component calls `setState`.
- 3D scenes use [Three.js](https://threejs.org) r149 (`vendor/three.min.js`). They load lazily, pause off-screen, respect reduced-motion settings and fall back to text if WebGL is unavailable.
- Fonts: Bricolage Grotesque and Instrument Sans from Google Fonts.

## Data

Numbers, events, campuses and project examples come from the TinkerHub platform database (via Metabase), snapshot taken 17 October 2026. Only aggregate figures and public information (event names, college names, project titles) are included; no personal data. Newsletter links point to the Kolaambi archive on Substack.

Events and opportunities are listed in the page scripts; past items move to "Completed" or "Closed" automatically by date. Update them from the platform before each release, or connect a content source.

## Before going live

- Confirm the partnerships contact email for `partner.html`.
- Check the "Build TinkerSpace Calicut" fundraiser wording on the home page.
- Replace the text logo with the official TinkerHub logo.

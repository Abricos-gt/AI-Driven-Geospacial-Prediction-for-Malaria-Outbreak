# Malaria Outbreak Prediction Platform — Frontend

An AI-assisted geospatial dashboard that equips health responders with real-time insight into malaria risk, whether they’re coordinating from a national command center or deploying in low-bandwidth field sites. Built with Vue 3, Leaflet, and a minimal UI stack for speed, clarity, and resilience.

---

## What Makes This Frontend Different

- **Decision-ready intelligence** – Risk heatmaps, factor breakdowns, and historical trends converge in a single, easy-to-scan view.
- **Field-first experience** – Mobile-friendly layout, large touch targets, dark mode, and graceful offline fallbacks.
- **Transparent AI outputs** – Layer-specific legends and factor bars explain why a region is flagged as high risk.
- **Low-bandwidth by design** – Tiny dependency footprint, efficient map rendering, and mock-mode data to keep the UI responsive when networks lag.

---

## System Overview

```
src/
├── App.vue                  # Main dashboard & layout
├── components/
│   ├── FiltersPanel.vue       # Date/region filters with refresh action
│   ├── StatCards.vue          # Snapshot of alerts, coverage, monitored sites
│   ├── MalariaMap.vue         # Leaflet map with risk heatmap + overlays
│   ├── MapLegend.vue          # Contextual legend per layer
│   ├── LayerControls.vue      # Quick toggle for risk/environment layers
│   ├── RiskSummary.vue        # Overall risk, factor contributions, metadata
│   ├── HistoricalChart.vue    # 7/30/90/365-day outbreak trends
│   └── OfflineNotice.vue      # Demo-mode banner for offline training
├── data/
│   └── mockData.js           # Curated mock payloads for frontend-only mode
├── services/
│   └── api.js                # Axios client + mock fallbacks + timeout handling
└── main.js                  # Vue bootstrap
```

---

## Getting Started

### Requirements
- Node.js ≥ 14
- npm or yarn

### Install & Run
```bash
cd frontend/project
npm install
npm run serve
```
Dashboard is available at **http://localhost:8080**.

### Environment Variables
1. Copy `.env.example` → `.env`
2. Adjust values as needed:
   ```
   VUE_APP_API_URL=http://localhost:5000/api
   VUE_APP_USE_MOCKS=true
   ```
3. Leave `VUE_APP_USE_MOCKS=true` to explore the UI with built-in demo data; set it to `false` once your backend is running.

---

## Operating Modes

### Demo / Training Mode (default)
- No backend required — every API call transparently falls back to `src/data/mockData.js`
- UI surfaces a “Demo mode” banner so teams know data is simulated
- Perfect for stakeholder demos, UX reviews, and environments with unreliable connectivity

### Live Data Mode
- Point `VUE_APP_API_URL` to your real API
- Supported endpoints (see `src/services/api.js` for schemas):
  - `GET /api/predictions/risk` – location-specific risk snapshot (`lat`, `lng`, `date`, `region`)
  - `GET /api/predictions/heatmap` – risk intensity for current map bounds (`north`, `south`, `east`, `west`, `zoom`)
  - `GET /api/predictions/summary` – aggregated stats per view/region/date
  - `GET /api/layers/geospatial` – temperature/rainfall/humidity/population layers
  - `GET /api/data/historical` – historical outbreaks (`region`, `startDate`, `endDate`, `aggregation`)

---

## Feature Deep Dive

- **MalariaMap.vue**  
  Leaflet-powered base map with heatmap circles, selectable regions, fullscreen mode, and instant layer switching.

- **FiltersPanel + StatCards**  
  Mission controls for forecast date & focus region, with refresh states and quick stats on alerts, community coverage, and data completeness.

- **RiskSummary.vue**  
  Clear risk tier badge, percentage score, contributing factors, affected areas, confidence score, and last-update timestamp.

- **HistoricalChart.vue**  
  CSS-only bar chart (no heavy chart libraries) with rolling totals and averages to highlight acceleration/decline.

- **MapLegend + OfflineNotice**  
  Compact legend that adapts to the selected layer and a banner that signals when mock/demo data is in use.

- **Dark Mode & Accessibility**  
  Toggle-friendly theme, semantic landmarks, ARIA labels, keyboard focus styles, and reduced-motion support.

---

## Performance & Reliability Principles

- **Minimal dependencies**: Vue 3, Axios, Leaflet — nothing more unless it improves mission-critical UX.
- **Async/await + timeout**: all calls bubble up meaningful errors and include slow-network safeguards.
- **LF line endings + ESLint (Airbnb + Vue A11y)** guarantee consistent cross-platform formatting.
- **Mock data safety net** keeps the interface usable when no backend or internet is available.

Run lint anytime:
```bash
npm run lint
```

Build for deployment:
```bash
npm run build
```
Outputs a production-ready `dist/` directory.

---

## Roadmap Ideas

- Integrate authentication/role-based views (HQ vs. field teams)
- Export map snapshots & PDF briefs for rapid coordination
- Hook into SMS/WhatsApp alerting once backend is live
- Support additional layers (vector control coverage, mobility, supply chain)

---

## Contribution Guidelines

1. Champion performance: avoid heavy libraries unless indispensable.
2. Design for the field: test on small screens, touch inputs, and spotty networks.
3. Double-check accessibility (`npm run lint` catches most issues).
4. Document any new endpoints, env vars, or user workflows in this README.
5. Keep mock mode updated so the UI remains demo-ready at all times.

Together we can help frontline teams respond faster, smarter, and more confidently to malaria threats. 💛

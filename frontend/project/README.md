# Malaria Outbreak Prediction Platform - Frontend

AI-driven geospatial malaria outbreak prediction and visualization platform built with Vue 3.

## Features

- 🗺️ **Interactive Geospatial Maps** - Leaflet-based map visualization with multiple layer support
- 🎯 **Mission Filters & Stats** - Date/region filters, proactive alerts, and status cards for field teams
- 📊 **Risk Prediction Visualization** - Real-time heatmap display of malaria outbreak risk
- 📈 **Historical Data Charts** - Trend analysis of past outbreak data
- 🌡️ **Multi-Layer Support** - Temperature, rainfall, humidity, and population density layers
- 📱 **Mobile-First Design** - Optimized for low-resource and mobile environments
- ♿ **Accessibility** - ARIA labels, keyboard navigation, and screen reader support
- ⚡ **Lightweight** - Minimal dependencies for fast loading in low-internet regions

## Project Structure

```
src/
├── components/
│   ├── FiltersPanel.vue      # Date/region filters + refresh
│   ├── StatCards.vue         # Quick alert/coverage metrics
│   ├── MalariaMap.vue        # Interactive map (Leaflet)
│   ├── MapLegend.vue         # Dynamic legend per layer
│   ├── LayerControls.vue     # Layer selection controls
│   ├── RiskSummary.vue       # Risk prediction summary display
│   ├── HistoricalChart.vue   # Historical outbreak trend chart
│   └── OfflineNotice.vue     # Mock/demo mode banner
├── data/
│   └── mockData.js          # Mock responses for frontend-only mode
├── services/
│   └── api.js               # API service layer with fallback logic
├── App.vue                  # Main dashboard component
└── main.js                 # Application entry point
```

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (optional for demo mode):
   - Duplicate `.env.example` → `.env`
   - Default contents:
     ```
     VUE_APP_API_URL=http://localhost:5000/api
     VUE_APP_USE_MOCKS=true
     ```
   - Set `VUE_APP_USE_MOCKS=false` once your backend is ready.

3. Start development server:
```bash
npm run serve
```

The app will be available at `http://localhost:8080`

## API Integration

The frontend is API-first but can operate entirely in “demo mode” using local mock data.

### Frontend-only / Mock Mode
- Enabled when `VUE_APP_USE_MOCKS` is omitted or set to `true`
- API calls automatically fall back to curated samples inside `src/data/mockData.js`
- The UI shows a “Demo mode” banner so field teams know data is simulated
- Ideal for design reviews, usability testing, or environments without network connectivity

### Expected Backend Endpoints

### Endpoints

- `GET /api/predictions/risk` - Get risk prediction for a location
  - Query params: `lat`, `lng`, `date`, `region`
  
- `GET /api/predictions/heatmap` - Get heatmap data for map bounds
  - Query params: `north`, `south`, `east`, `west`, `zoom`
  
- `GET /api/predictions/summary` - Get prediction summary
  - Query params: `date`, `bounds`, `region`
  
- `GET /api/layers/geospatial` - Get geospatial layer data
  - Query params: `layer` (temperature|rainfall|humidity|population), `north`, `south`, `east`, `west`, `date`
  
- `GET /api/data/historical` - Get historical outbreak data
  - Query params: `region`, `startDate`, `endDate`, `aggregation`

### Response Formats

See `src/services/api.js` for expected response formats. The API service includes error handling and data transformation.

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory, optimized and minified for deployment.

## Key Features Explained

### Map Component
- Uses Leaflet for lightweight mapping
- Supports multiple base layers (OpenStreetMap by default)
- Dynamic layer switching (risk, temperature, rainfall, humidity, population)
- Click-to-query functionality for location-specific predictions

### Layer Controls
- Simple, accessible button interface
- Visual indicators for active layer
- Mobile-responsive grid layout

### Risk Summary
- Overall risk level with color-coded display
- Risk factor breakdown with progress bars
- Statistics and metadata display
- Real-time updates on location click

### Historical Chart
- Custom CSS-based bar chart (no heavy charting library)
- Time period selection (7, 30, 90, 365 days)
- Summary statistics (total, average, peak cases)
- Mobile-optimized layout

## Performance Optimizations

- Minimal dependencies (only Leaflet and Axios)
- Lazy loading of map data based on viewport
- Debounced API calls to prevent excessive requests
- Lightweight CSS animations
- Optimized for low-bandwidth connections

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Graceful degradation for older browsers

## Development

### Linting
```bash
npm run lint
```

### Project Configuration
- Vue CLI configuration: `vue.config.js`
- Babel configuration: `babel.config.js`
- ESLint configuration: `.eslintrc.js`

## Notes for Low-Resource Environments

- All map tiles use free OpenStreetMap (no API key required)
- API calls have 30-second timeout for slow connections
- Error messages are user-friendly and actionable
- Loading states provide clear feedback
- Minimal JavaScript bundle size

## Contributing

When adding new features:
1. Keep dependencies minimal
2. Ensure mobile responsiveness
3. Add proper error handling
4. Include accessibility attributes
5. Test on slow connections

## License

See main project LICENSE file.

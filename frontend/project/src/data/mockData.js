/**
 * Local mock data used while backend APIs are unavailable.
 * Keeps the UI functional and demoable in frontend-only mode.
 */

export const mockPredictionSummary = {
  overallRisk: 'high',
  overallRiskValue: 0.78,
  overallRiskLabel: 'High',
  factors: [
    { name: 'Temperature', value: 72 },
    { name: 'Rainfall', value: 81 },
    { name: 'Humidity', value: 64 },
    { name: 'Population', value: 55 },
  ],
  affectedAreas: 14,
  confidence: 86,
  lastUpdated: new Date().toISOString(),
};

export const mockRiskPrediction = (overrides = {}) => ({
  riskLevel: 0.68,
  factors: {
    temperature: 0.7,
    rainfall: 0.8,
    humidity: 0.6,
    population: 0.55,
  },
  affectedAreas: 8,
  confidence: 0.82,
  lastUpdated: new Date().toISOString(),
  ...overrides,
});

export const mockHistoricalData = Array.from({ length: 30 }).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - index));
  return {
    date: date.toISOString().split('T')[0],
    cases: Math.floor(50 + Math.random() * 120),
  };
});

export const mockHeatmapData = {
  points: [
    { lat: 0.3476, lng: 32.5825, risk: 0.9 },
    { lat: -1.2921, lng: 36.8219, risk: 0.75 },
    { lat: 6.5244, lng: 3.3792, risk: 0.65 },
    { lat: 12.6392, lng: -8.0029, risk: 0.55 },
    { lat: -6.7924, lng: 39.2083, risk: 0.8 },
  ],
};

const geoJsonTemplate = (valueGenerator) => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { value: valueGenerator() },
      geometry: {
        type: 'Polygon',
        coordinates: [[[32, -1], [34, -1], [34, 1], [32, 1], [32, -1]]],
      },
    },
    {
      type: 'Feature',
      properties: { value: valueGenerator() },
      geometry: {
        type: 'Polygon',
        coordinates: [[[36, -3], [38, -3], [38, -1], [36, -1], [36, -3]]],
      },
    },
  ],
});

export const mockGeospatialLayers = {
  temperature: { geojson: geoJsonTemplate(() => 24 + Math.random() * 6) },
  rainfall: { geojson: geoJsonTemplate(() => 80 + Math.random() * 120) },
  humidity: { geojson: geoJsonTemplate(() => 55 + Math.random() * 30) },
  population: { geojson: geoJsonTemplate(() => 200 + Math.random() * 900) },
};

export const mockStatsCards = [
  {
    id: 'alerts',
    label: 'Active Alerts',
    value: 12,
    trend: '+3 this week',
    status: 'warning',
  },
  {
    id: 'communities',
    label: 'Communities Monitored',
    value: 48,
    trend: '+5 new',
    status: 'info',
  },
  {
    id: 'coverage',
    label: 'Data Coverage',
    value: '87%',
    trend: 'Stable',
    status: 'success',
  },
];

export const mockRegions = [
  { id: 'ssa', label: 'Sub-Saharan Africa' },
  { id: 'lake-victoria', label: 'Lake Victoria Basin' },
  { id: 'sahel', label: 'Sahel Corridor' },
  { id: 'mekong', label: 'Greater Mekong' },
];

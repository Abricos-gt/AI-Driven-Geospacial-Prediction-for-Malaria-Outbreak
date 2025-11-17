<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div>
          <h1 class="app-title">Malaria Outbreak Prediction</h1>
          <p class="app-subtitle">AI-driven geospatial risk analysis</p>
        </div>
        <div class="header-actions">
          <button class="header-action-btn" @click="toggleTheme">
            {{ prefersDarkMode ? 'Light View' : 'Night View' }}
          </button>
          <button class="header-action-btn ghost" @click="openExport">
            Export Snapshot
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="left-column">
        <OfflineNotice :visible="showMockNotice" />

        <StatCards :stats="statCards" />

        <FiltersPanel
          :selected-date="selectedDate"
          :selected-region="selectedRegion"
          :regions="regions"
          :loading="summaryLoading"
          @update:date="updateDate"
          @update:region="updateRegion"
          @refresh="loadSummaryData"
        />

        <LayerControls
          :active-layer="activeLayer"
          @layer-change="handleLayerChange"
        />

        <RiskSummary
          :summary="riskSummary"
          :loading="summaryLoading"
          :error="summaryError"
        />

        <div class="field-tip-card">
          <h4>Field Readiness Tip</h4>
          <p>
            Prioritize community outreach in high-risk clusters within 48 hours.
            Ensure rapid diagnostic kits accompany each mobile team.
          </p>
        </div>

        <HistoricalChart :region="selectedRegion" />
      </div>

      <section class="map-section" aria-label="Geospatial map visualization">
        <MalariaMap
          :center="mapCenter"
          :zoom="mapZoom"
          :active-layer="activeLayer"
          :selected-date="selectedDate"
          :selected-location="selectedLocation"
          @location-click="handleLocationClick"
          @bounds-changed="handleBoundsChanged"
        />
        <MapLegend :active-layer="activeLayer" />
      </section>
    </main>

    <footer class="app-footer">
      <p>Malaria Outbreak Prediction Platform &copy; {{ currentYear }}</p>
    </footer>
  </div>
</template>

<script>
import { mockRegions, mockStatsCards } from '@/data/mockData';
import HistoricalChart from './components/HistoricalChart.vue';
import LayerControls from './components/LayerControls.vue';
import MalariaMap from './components/MalariaMap.vue';
import MapLegend from './components/MapLegend.vue';
import OfflineNotice from './components/OfflineNotice.vue';
import RiskSummary from './components/RiskSummary.vue';
import FiltersPanel from './components/FiltersPanel.vue';
import StatCards from './components/StatCards.vue';
import { getRiskPrediction, getPredictionSummary } from './services/api';

export default {
  name: 'App',
  components: {
    FiltersPanel,
    StatCards,
    LayerControls,
    MalariaMap,
    RiskSummary,
    MapLegend,
    OfflineNotice,
    HistoricalChart,
  },
  data() {
    return {
      // Map configuration
      mapCenter: [0, 0], // Default center - adjust based on target region
      mapZoom: 6,
      activeLayer: 'risk',
      selectedDate: new Date().toISOString().split('T')[0],
      selectedRegion: null,
      selectedLocation: null,
      regions: mockRegions,

      // Risk summary data
      riskSummary: null,
      summaryLoading: false,
      summaryError: null,
      statCards: mockStatsCards,

      // Current year for footer
      currentYear: new Date().getFullYear(),
      prefersDarkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
      showMockNotice: process.env.VUE_APP_USE_MOCKS !== 'false',
    };
  },
  mounted() {
    // Try to get user's location for better initial map center
    this.getUserLocation();
    // Load initial summary data
    this.loadSummaryData();
    if (this.prefersDarkMode) {
      document.body.classList.add('theme-dark');
    }
  },
  methods: {
    /**
     * Handle layer change from LayerControls
     */
    handleLayerChange(layerId) {
      this.activeLayer = layerId;
      // Optionally reload summary when switching layers
      if (layerId === 'risk') {
        this.loadSummaryData();
      }
    },

    /**
     * Handle location click on map
     */
    async handleLocationClick(location) {
      try {
        this.summaryLoading = true;
        this.summaryError = null;
        this.selectedLocation = location;

        // Get risk prediction for clicked location
        const prediction = await getRiskPrediction({
          lat: location.lat,
          lng: location.lng,
          date: this.selectedDate,
        });

        // Update risk summary with location-specific data
        this.riskSummary = this.formatPredictionData(prediction);
        this.summaryLoading = false;
      } catch (err) {
        this.summaryError = err.isNetworkError
          ? err.message
          : 'Failed to load prediction data. Please try again.';
        this.summaryLoading = false;
        console.error('Location click error:', err);
      }
    },

    /**
     * Handle map bounds change
     */
    handleBoundsChanged(bounds) {
      // Optionally reload summary data for new bounds
      // This can be throttled to avoid too many API calls
      if (this.activeLayer === 'risk') {
        this.loadSummaryData(bounds);
      }
    },

    /**
     * Load summary data for current view
     */
    async loadSummaryData(bounds = null) {
      try {
        this.summaryLoading = true;
        this.summaryError = null;

        const params = {
          date: this.selectedDate,
        };

        if (bounds) {
          params.bounds = bounds;
        }

        if (this.selectedRegion) {
          params.region = this.selectedRegion;
        }

        const summary = await getPredictionSummary(params);
        this.riskSummary = this.formatSummaryData(summary);
        this.updateStatCards();
        this.summaryLoading = false;
      } catch (err) {
        // Don't show error if it's just initial load
        if (this.riskSummary) {
          this.summaryError = err.isNetworkError
            ? err.message
            : 'Failed to load summary data. Please try again.';
        }
        this.summaryLoading = false;
        console.error('Summary loading error:', err);
      }
    },

    /**
     * Format prediction data for RiskSummary component
     */
    formatPredictionData(prediction) {
      // Transform API response to component format
      // Adjust based on your actual API response structure
      return {
        overallRisk: prediction.riskLevel || 'medium',
        overallRiskLabel: this.getRiskLabel(prediction.riskLevel || 0.5),
        overallRiskPercentage: Math.round((prediction.riskLevel || 0.5) * 100),
        factors: [
          {
            name: 'Temperature',
            value: Math.round((prediction.factors?.temperature || 0) * 100),
          },
          {
            name: 'Rainfall',
            value: Math.round((prediction.factors?.rainfall || 0) * 100),
          },
          {
            name: 'Humidity',
            value: Math.round((prediction.factors?.humidity || 0) * 100),
          },
          {
            name: 'Population',
            value: Math.round((prediction.factors?.population || 0) * 100),
          },
        ],
        affectedAreas: prediction.affectedAreas || 'N/A',
        confidence: Math.round((prediction.confidence || 0) * 100),
        lastUpdated: prediction.lastUpdated || new Date().toISOString(),
      };
    },

    /**
     * Format summary data for RiskSummary component
     */
    formatSummaryData(summary) {
      // Transform API response to component format
      return {
        overallRisk: summary.overallRisk || 'medium',
        overallRiskLabel: this.getRiskLabel(summary.overallRiskValue || 0.5),
        overallRiskPercentage: Math.round((summary.overallRiskValue || 0.5) * 100),
        factors: summary.factors || [],
        affectedAreas: summary.affectedAreas || 'N/A',
        confidence: Math.round((summary.confidence || 0) * 100),
        lastUpdated: summary.lastUpdated || new Date().toISOString(),
      };
    },

    /**
     * Get risk label from risk value
     */
    getRiskLabel(riskValue) {
      if (riskValue < 0.25) return 'Low';
      if (riskValue < 0.5) return 'Medium';
      if (riskValue < 0.75) return 'High';
      return 'Very High';
    },

    /**
     * Get user's location for better initial map center
     */
    getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.mapCenter = [position.coords.latitude, position.coords.longitude];
            this.mapZoom = 8;
          },
          () => {
            // Default to a common malaria-prone region if geolocation fails
            // Adjust coordinates based on your target region
            this.mapCenter = [0, 0]; // Example: Sub-Saharan Africa region
          },
        );
      }
    },

    updateDate(date) {
      this.selectedDate = date;
      this.loadSummaryData();
    },

    updateRegion(region) {
      this.selectedRegion = region;
      this.loadSummaryData();
    },

    updateStatCards() {
      if (!this.riskSummary) return;
      this.statCards = mockStatsCards.map((card) => {
        if (card.id === 'alerts') {
          return {
            ...card,
            value: Math.max(3, Math.round(this.riskSummary.overallRiskPercentage / 7)),
            trend: 'Updated just now',
          };
        }
        if (card.id === 'coverage') {
          return {
            ...card,
            value: `${Math.min(99, this.riskSummary.confidence)}%`,
            trend: 'Model confidence',
          };
        }
        return card;
      });
    },

    toggleTheme() {
      this.prefersDarkMode = !this.prefersDarkMode;
      document.body.classList.toggle('theme-dark', this.prefersDarkMode);
    },

    openExport() {
      console.info('Snapshot export will be available once backend storage is connected.');
    },
  },
};
</script>

<style>
/* Global reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f5f5f5;
  color: #2c3e50;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* App container */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.app-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.header-action-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  padding: 0.45rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: opacity 0.2s;
}

.header-action-btn.ghost {
  background: transparent;
}

.header-action-btn:hover {
  opacity: 0.85;
}

/* Main content area */
.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.25rem;
  padding: 1.2rem;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 210px);
}

/* Map section */
.map-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 500px;
  position: relative;
}

.field-tip-card {
  background: linear-gradient(135deg, #fdfbfb, #ebedee);
  border-radius: 10px;
  padding: 1rem;
  color: #2d3436;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.field-tip-card h4 {
  margin: 0 0 0.4rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.field-tip-card p {
  font-size: 0.82rem;
  line-height: 1.4;
  margin: 0;
}

/* Footer */
.app-footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.85rem;
  margin-top: auto;
}

/* Dark theme */
body.theme-dark {
  background: #0b1526;
  color: #ecf0f1;
}

body.theme-dark .app-header {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
}

body.theme-dark .map-section,
body.theme-dark .filters-panel,
body.theme-dark .risk-summary,
body.theme-dark .historical-chart,
body.theme-dark .layer-controls,
body.theme-dark .stat-card {
  background: #14253b;
  color: #f5f7fa;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}

body.theme-dark .field-tip-card {
  background: linear-gradient(135deg, #1e1e2f, #131528);
  color: #f8fafc;
}

/* Mobile responsiveness */
@media (max-width: 1024px) {
  .app-main {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .left-column {
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .app-title {
    font-size: 1.25rem;
  }

  .app-subtitle {
    font-size: 0.85rem;
  }

  .map-section {
    min-height: 400px;
    order: -1;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0.75rem;
  }

  .app-title {
    font-size: 1.1rem;
  }

  .app-main {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .left-column {
    grid-template-columns: 1fr;
  }

  .map-section {
    min-height: 300px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus styles for keyboard navigation */
button:focus,
select:focus,
a:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}
</style>

<template>
  <div id="app" class="app-container">
    <!-- Header -->
    <header class="app-header" role="banner">
      <div class="header-content">
        <h1 class="app-title">Malaria Outbreak Prediction</h1>
        <p class="app-subtitle">AI-driven geospatial risk analysis</p>
      </div>
    </header>

    <!-- Main content -->
    <main class="app-main" role="main">
      <!-- Left sidebar - Controls and Summary -->
      <aside class="sidebar" role="complementary">
        <!-- Layer Controls -->
        <LayerControls
          :active-layer="activeLayer"
          @layer-change="handleLayerChange"
        />

        <!-- Risk Summary -->
        <RiskSummary
          :summary="riskSummary"
          :loading="summaryLoading"
          :error="summaryError"
        />

        <!-- Historical Chart -->
        <HistoricalChart
          :region="selectedRegion"
        />
      </aside>

      <!-- Map Section -->
      <section class="map-section" aria-label="Geospatial map visualization">
        <MalariaMap
          :center="mapCenter"
          :zoom="mapZoom"
          :active-layer="activeLayer"
          :selected-date="selectedDate"
          @location-click="handleLocationClick"
          @bounds-changed="handleBoundsChanged"
        />
      </section>
    </main>

    <!-- Footer -->
    <footer class="app-footer" role="contentinfo">
      <p>Malaria Outbreak Prediction Platform &copy; {{ currentYear }}</p>
    </footer>
  </div>
</template>

<script>
import LayerControls from './components/LayerControls.vue';
import MalariaMap from './components/MalariaMap.vue';
import RiskSummary from './components/RiskSummary.vue';
import HistoricalChart from './components/HistoricalChart.vue';
import { getRiskPrediction, getPredictionSummary } from './services/api';

export default {
  name: 'App',
  components: {
    LayerControls,
    MalariaMap,
    RiskSummary,
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

      // Risk summary data
      riskSummary: null,
      summaryLoading: false,
      summaryError: null,

      // Current year for footer
      currentYear: new Date().getFullYear(),
    };
  },
  mounted() {
    // Try to get user's location for better initial map center
    this.getUserLocation();
    // Load initial summary data
    this.loadSummaryData();
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
  max-width: 1400px;
  margin: 0 auto;
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

/* Main content area */
.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1rem;
  padding: 1rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

/* Map section */
.map-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 500px;
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

/* Mobile responsiveness */
@media (max-width: 1024px) {
  .app-main {
    grid-template-columns: 300px 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
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

  .app-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .sidebar {
    max-height: none;
    overflow-y: visible;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.75rem;
  }

  .map-section {
    min-height: 400px;
    order: -1; /* Map appears first on mobile */
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

  .sidebar {
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

<template>
  <div class="malaria-map-container">
    <!-- Loading overlay -->
    <div v-if="loading" class="map-loading" role="status" aria-label="Loading map">
      <div class="spinner"></div>
      <p>Loading map data...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="map-error" role="alert">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="retry-btn">Retry</button>
    </div>

    <!-- Map container -->
    <div
      ref="mapContainer"
      class="map"
      :class="{ 'map-loading-state': loading }"
    ></div>

    <!-- Map controls overlay -->
    <div class="map-controls">
      <button
        @click="toggleFullscreen"
        class="control-btn"
        :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
      >
        {{ isFullscreen ? '⤓' : '⤢' }}
      </button>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRiskHeatmap, getGeospatialLayer } from '@/services/api';

// Fix for default marker icons in webpack
// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default {
  name: 'MalariaMap',
  props: {
    // Center coordinates [lat, lng]
    center: {
      type: Array,
      default: () => [0, 0],
    },
    // Initial zoom level
    zoom: {
      type: Number,
      default: 6,
    },
    // Active layer to display
    activeLayer: {
      type: String,
      default: 'risk', // 'risk' | 'temperature' | 'rainfall' | 'humidity' | 'population'
    },
    // Date for time-based data
    selectedDate: {
      type: String,
      default: null,
    },
    // Selected location marker
    selectedLocation: {
      type: Object,
      default: null,
    },
  },
  emits: ['map-ready', 'location-click', 'bounds-changed'],
  data() {
    return {
      map: null,
      loading: false,
      error: null,
      isFullscreen: false,
      heatmapLayer: null,
      activeOverlayLayer: null,
      layers: {
        risk: null,
        temperature: null,
        rainfall: null,
        humidity: null,
        population: null,
      },
      selectedMarker: null,
    };
  },
  mounted() {
    this.initMap();
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
  watch: {
    activeLayer() {
      this.updateActiveLayer();
    },
    selectedDate() {
      this.refreshLayerData();
    },
    selectedLocation: {
      immediate: false,
      handler(newLocation) {
        this.updateSelectedMarker(newLocation);
      },
    },
  },
  methods: {
    /**
     * Initialize Leaflet map
     */
    initMap() {
      try {
        this.loading = true;
        this.error = null;

        // Create map instance
        this.map = L.map(this.$refs.mapContainer, {
          center: this.center,
          zoom: this.zoom,
          zoomControl: true,
          attributionControl: true,
        });

        // Add base tile layer (OpenStreetMap - free and lightweight)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(this.map);

        // Listen to map events
        this.map.on('moveend', this.onBoundsChanged);
        this.map.on('zoomend', this.onBoundsChanged);
        this.map.on('click', this.onMapClick);

        // Load initial data
        this.loadMapData();

        this.$emit('map-ready', this.map);
        this.loading = false;
      } catch (err) {
        this.error = 'Failed to initialize map. Please refresh the page.';
        this.loading = false;
        console.error('Map initialization error:', err);
      }
    },

    /**
     * Load map data based on current view and active layer
     */
    async loadMapData() {
      if (!this.map) return;

      try {
        this.loading = true;
        this.error = null;

        const bounds = this.map.getBounds();
        const zoom = this.map.getZoom();

        if (this.activeLayer === 'risk') {
          await this.loadRiskHeatmap(bounds, zoom);
        } else {
          await this.loadGeospatialLayer(this.activeLayer, bounds);
        }

        this.loading = false;
      } catch (err) {
        this.error = err.isNetworkError
          ? err.message
          : 'Failed to load map data. Please try again.';
        this.loading = false;
        console.error('Map data loading error:', err);
      }
    },

    /**
     * Load risk heatmap data
     */
    async loadRiskHeatmap(bounds, zoom) {
      const boundsData = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };

      const data = await getRiskHeatmap(boundsData, zoom);

      // Remove existing heatmap layer
      if (this.heatmapLayer) {
        this.map.removeLayer(this.heatmapLayer);
      }

      // Create heatmap layer from data
      // Assuming data format: { points: [{ lat, lng, risk }] }
      if (data && data.points) {
        const heatmapPoints = data.points.map((point) => [
          point.lat,
          point.lng,
          point.risk || 0,
        ]);

        // Create circle markers for heatmap visualization
        // In production, consider using a proper heatmap library like Leaflet.heat
        this.heatmapLayer = L.layerGroup();

        heatmapPoints.forEach(([lat, lng, risk]) => {
          const color = this.getRiskColor(risk);
          const radius = Math.max(5, risk * 20);

          L.circleMarker([lat, lng], {
            radius,
            fillColor: color,
            color: '#fff',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6,
          }).addTo(this.heatmapLayer);
        });

        this.heatmapLayer.addTo(this.map);
        this.layers.risk = this.heatmapLayer;
      }
    },

    /**
     * Load geospatial layer (temperature, rainfall, etc.)
     */
    async loadGeospatialLayer(layerType, bounds) {
      const boundsData = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };

      const data = await getGeospatialLayer(layerType, boundsData, this.selectedDate);

      // Remove existing overlay layer
      if (this.activeOverlayLayer) {
        this.map.removeLayer(this.activeOverlayLayer);
      }

      // Add new layer based on data format
      if (data && data.geojson) {
        // If GeoJSON format
        this.activeOverlayLayer = L.geoJSON(data.geojson, {
          style: (feature) => this.getLayerStyle(feature, layerType),
        }).addTo(this.map);
      } else if (data && data.tileUrl) {
        // If tile layer format
        this.activeOverlayLayer = L.tileLayer(data.tileUrl, {
          opacity: 0.7,
        }).addTo(this.map);
      }
    },

    /**
     * Get color based on risk level (0-1)
     */
    getRiskColor(risk) {
      if (risk < 0.2) return '#2ecc71'; // Low - green
      if (risk < 0.4) return '#f39c12'; // Medium-low - orange
      if (risk < 0.6) return '#e67e22'; // Medium - dark orange
      if (risk < 0.8) return '#e74c3c'; // High - red
      return '#8e44ad'; // Very high - purple
    },

    /**
     * Get style for geospatial layer features
     */
    getLayerStyle(feature, layerType) {
      const value = feature.properties?.value || 0;
      let color = '#3498db';

      if (layerType === 'temperature') {
        // Temperature color scale (blue to red)
        const temp = value;
        if (temp < 20) color = '#3498db';
        else if (temp < 25) color = '#2ecc71';
        else if (temp < 30) color = '#f39c12';
        else color = '#e74c3c';
      } else if (layerType === 'rainfall') {
        // Rainfall color scale (brown to blue)
        const rain = value;
        if (rain < 50) color = '#8b4513';
        else if (rain < 100) color = '#d4a574';
        else if (rain < 200) color = '#3498db';
        else color = '#2980b9';
      } else if (layerType === 'humidity') {
        // Humidity color scale (yellow to blue)
        const humidity = value;
        if (humidity < 40) color = '#f1c40f';
        else if (humidity < 60) color = '#2ecc71';
        else if (humidity < 80) color = '#3498db';
        else color = '#2980b9';
      } else if (layerType === 'population') {
        // Population density color scale
        const density = value;
        if (density < 100) color = '#ecf0f1';
        else if (density < 500) color = '#95a5a6';
        else if (density < 1000) color = '#34495e';
        else color = '#2c3e50';
      }

      return {
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 0.7,
        fillOpacity: 0.5,
      };
    },

    /**
     * Update active layer display
     */
    async updateActiveLayer() {
      // Remove all layers
      Object.values(this.layers).forEach((layer) => {
        if (layer) this.map.removeLayer(layer);
      });

      if (this.activeOverlayLayer) {
        this.map.removeLayer(this.activeOverlayLayer);
        this.activeOverlayLayer = null;
      }

      // Load new layer
      await this.loadMapData();
    },

    /**
     * Refresh layer data when date changes
     */
    async refreshLayerData() {
      if (this.activeLayer !== 'risk') {
        await this.loadMapData();
      }
    },

    /**
     * Handle map bounds change
     */
    onBoundsChanged() {
      const bounds = this.map.getBounds();
      this.$emit('bounds-changed', {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },

    /**
     * Handle map click
     */
    onMapClick(e) {
      this.$emit('location-click', {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
      this.updateSelectedMarker(e.latlng);
    },

    /**
     * Retry loading map data
     */
    retryLoad() {
      this.error = null;
      this.loadMapData();
    },

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
      const container = this.$el;
      if (!this.isFullscreen) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        }
        this.isFullscreen = true;
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        this.isFullscreen = false;
      }
    },

    /**
     * Update selected location marker
     */
    updateSelectedMarker(location) {
      if (!this.map) return;
      if (this.selectedMarker) {
        this.map.removeLayer(this.selectedMarker);
        this.selectedMarker = null;
      }
      if (location?.lat && location?.lng) {
        this.selectedMarker = L.marker([location.lat, location.lng]).addTo(this.map);
      }
    },
  },
};
</script>

<style scoped>
.malaria-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: #f0f0f0;
}

.map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-loading-state {
  opacity: 0.6;
  pointer-events: none;
}

.map-loading,
.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  text-align: center;
  max-width: 90%;
}

.map-error {
  color: #e74c3c;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-btn:hover {
  background: #2980b9;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background 0.2s;
}

.control-btn:hover {
  background: #f8f8f8;
}

.control-btn:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .malaria-map-container {
    min-height: 300px;
  }

  .map {
    min-height: 300px;
  }

  .map-controls {
    top: 5px;
    right: 5px;
  }

  .control-btn {
    padding: 0.4rem;
    font-size: 1rem;
  }
}
</style>

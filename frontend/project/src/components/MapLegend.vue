<template>
  <div class="map-legend">
    <span class="legend-title">Legend · {{ legendTitle }}</span>
    <div class="legend-items">
      <div
        v-for="item in legendItems"
        :key="item.label"
        class="legend-item"
      >
        <span
          class="legend-swatch"
          :style="{ background: item.color }"
        ></span>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
const baseLegends = {
  risk: {
    title: 'Risk Level',
    items: [
      { label: 'Very High', color: '#8e44ad' },
      { label: 'High', color: '#e74c3c' },
      { label: 'Medium', color: '#f39c12' },
      { label: 'Low', color: '#2ecc71' },
    ],
  },
  temperature: {
    title: 'Temperature °C',
    items: [
      { label: '≥ 32', color: '#e74c3c' },
      { label: '28 - 31', color: '#e67e22' },
      { label: '24 - 27', color: '#2ecc71' },
      { label: '≤ 23', color: '#3498db' },
    ],
  },
  rainfall: {
    title: 'Rainfall (mm)',
    items: [
      { label: '≥ 200', color: '#2980b9' },
      { label: '100 - 199', color: '#3498db' },
      { label: '50 - 99', color: '#d4a574' },
      { label: '≤ 49', color: '#8b4513' },
    ],
  },
  humidity: {
    title: 'Humidity %',
    items: [
      { label: '≥ 80', color: '#2980b9' },
      { label: '60 - 79', color: '#3498db' },
      { label: '40 - 59', color: '#2ecc71' },
      { label: '≤ 39', color: '#f1c40f' },
    ],
  },
  population: {
    title: 'Population / km²',
    items: [
      { label: '≥ 1000', color: '#2c3e50' },
      { label: '500 - 999', color: '#34495e' },
      { label: '100 - 499', color: '#95a5a6' },
      { label: '≤ 99', color: '#ecf0f1' },
    ],
  },
};

export default {
  name: 'MapLegend',
  props: {
    activeLayer: {
      type: String,
      default: 'risk',
    },
  },
  computed: {
    legendConfig() {
      return baseLegends[this.activeLayer] || baseLegends.risk;
    },
    legendItems() {
      return this.legendConfig.items;
    },
    legendTitle() {
      return this.legendConfig.title;
    },
  },
};
</script>

<style scoped>
.map-legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  min-width: 170px;
  font-size: 0.8rem;
  pointer-events: none;
}

.legend-title {
  display: inline-block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #2c3e50;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #455a64;
}

.legend-swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .map-legend {
    font-size: 0.7rem;
    padding: 0.6rem;
  }
}
</style>

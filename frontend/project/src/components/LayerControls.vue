<template>
  <div class="layer-controls" role="group" aria-label="Map layer controls">
    <h3 class="controls-title">Map Layers</h3>
    <div class="layer-buttons">
      <button
        v-for="layer in layers"
        :key="layer.id"
        @click="selectLayer(layer.id)"
        :class="['layer-btn', { active: activeLayer === layer.id }]"
        :aria-pressed="activeLayer === layer.id"
        :aria-label="`Show ${layer.name} layer`"
      >
        <span class="layer-icon" :style="{ backgroundColor: layer.color }"></span>
        <span class="layer-name">{{ layer.name }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LayerControls',
  props: {
    activeLayer: {
      type: String,
      required: true,
    },
  },
  emits: ['layer-change'],
  data() {
    return {
      layers: [
        { id: 'risk', name: 'Risk Prediction', color: '#e74c3c' },
        { id: 'temperature', name: 'Temperature', color: '#f39c12' },
        { id: 'rainfall', name: 'Rainfall', color: '#3498db' },
        { id: 'humidity', name: 'Humidity', color: '#2ecc71' },
        { id: 'population', name: 'Population', color: '#95a5a6' },
      ],
    };
  },
  methods: {
    selectLayer(layerId) {
      if (this.activeLayer !== layerId) {
        this.$emit('layer-change', layerId);
      }
    },
  },
};
</script>

<style scoped>
.layer-controls {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.controls-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.layer-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.layer-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  font-size: 0.9rem;
}

.layer-btn:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.layer-btn.active {
  background: #e3f2fd;
  border-color: #2196f3;
  font-weight: 600;
}

.layer-btn:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.layer-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.layer-name {
  flex: 1;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .layer-controls {
    padding: 0.75rem;
  }

  .layer-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .layer-btn {
    padding: 0.6rem;
    font-size: 0.85rem;
  }
}
</style>


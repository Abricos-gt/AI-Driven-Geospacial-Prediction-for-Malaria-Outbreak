<template>
  <div class="filters-panel">
    <div class="filters-header">
      <h3>Monitoring Filters</h3>
      <button
        class="refresh-btn"
        @click="$emit('refresh')"
        :disabled="loading"
      >
        {{ loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <label class="filter-group" for="date-input">
      <span class="filter-label">Forecast Date</span>
      <input
        id="date-input"
        type="date"
        :value="selectedDate"
        @input="$emit('update:date', $event.target.value)"
        :max="today"
      >
    </label>

    <label class="filter-group" for="region-select">
      <span class="filter-label">Focus Region</span>
      <select
        id="region-select"
        :value="selectedRegion"
        @change="$emit('update:region', $event.target.value)"
      >
        <option value="">All regions</option>
        <option
          v-for="region in regions"
          :key="region.id"
          :value="region.id"
        >
          {{ region.label }}
        </option>
      </select>
    </label>

    <div class="helper-text">
      Use these filters to tailor predictions for upcoming field missions or
      rapid response planning.
    </div>
  </div>
</template>

<script>
export default {
  name: 'FiltersPanel',
  props: {
    selectedDate: {
      type: String,
      required: true,
    },
    selectedRegion: {
      type: String,
      default: '',
    },
    regions: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    today() {
      return new Date().toISOString().split('T')[0];
    },
  },
};
</script>

<style scoped>
.filters-panel {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.filters-header h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.refresh-btn {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

.refresh-btn:not([disabled]):hover {
  background: #2c82c9;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4b5d6b;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4b5d6b;
}

.filter-group input,
.filter-group select {
  border: 1px solid #d5dfe8;
  border-radius: 6px;
  padding: 0.45rem 0.6rem;
  font-size: 0.9rem;
  font-family: inherit;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: 2px solid #3498db;
  border-color: transparent;
}

.helper-text {
  font-size: 0.75rem;
  color: #7f8c8d;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .filters-panel {
    padding: 0.85rem;
  }
}
</style>

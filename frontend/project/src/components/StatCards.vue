<template>
  <div class="stat-cards">
    <article
      v-for="stat in stats"
      :key="stat.id"
      class="stat-card"
      :class="`stat-${stat.status || 'neutral'}`"
    >
      <div class="stat-label">{{ stat.label }}</div>
      <div class="stat-value">{{ stat.value }}</div>
      <div class="stat-trend">{{ stat.trend }}</div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'StatCards',
  props: {
    stats: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #7f8c8d;
}

.stat-value {
  font-size: 1.45rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-trend {
  font-size: 0.8rem;
  color: #5d6d7e;
}

.stat-warning {
  border-left: 4px solid #f39c12;
}

.stat-info {
  border-left: 4px solid #3498db;
}

.stat-success {
  border-left: 4px solid #2ecc71;
}

.stat-neutral {
  border-left: 4px solid #95a5a6;
}
</style>

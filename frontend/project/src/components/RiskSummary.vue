<template>
  <div class="risk-summary">
    <h3 class="summary-title">Risk Summary</h3>

    <!-- Loading state -->
    <div v-if="loading" class="summary-loading" role="status">
      <div class="spinner-small"></div>
      <p>Loading risk data...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="summary-error" role="alert">
      <p>{{ error }}</p>
    </div>

    <!-- Summary content -->
    <div v-else-if="summary" class="summary-content">
      <!-- Overall risk level -->
      <div class="risk-level-card" :class="`risk-${summary.overallRisk}`">
        <div class="risk-level-label">Overall Risk Level</div>
        <div class="risk-level-value">{{ summary.overallRiskLabel }}</div>
        <div class="risk-level-percentage">{{ summary.overallRiskPercentage }}%</div>
      </div>

      <!-- Risk factors -->
      <div class="risk-factors">
        <h4>Risk Factors</h4>
        <div class="factor-list">
          <div
            v-for="factor in summary.factors"
            :key="factor.name"
            class="factor-item"
          >
            <span class="factor-name">{{ factor.name }}</span>
            <div class="factor-bar">
              <div
                class="factor-bar-fill"
                :style="{
                  width: `${factor.value}%`,
                  backgroundColor: getFactorColor(factor.value),
                }"
              ></div>
            </div>
            <span class="factor-value">{{ factor.value }}%</span>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Affected Areas</span>
          <span class="stat-value">{{ summary.affectedAreas || 'N/A' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Prediction Confidence</span>
          <span class="stat-value">{{ summary.confidence || 'N/A' }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Last Updated</span>
          <span class="stat-value">{{ formatDate(summary.lastUpdated) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="summary-empty">
      <p>No risk data available. Select a location on the map.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RiskSummary',
  props: {
    summary: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
  },
  methods: {
    /**
     * Get color for risk factor value
     */
    getFactorColor(value) {
      if (value < 25) return '#2ecc71'; // Low - green
      if (value < 50) return '#f39c12'; // Medium - orange
      if (value < 75) return '#e67e22'; // High - dark orange
      return '#e74c3c'; // Very high - red
    },

    /**
     * Format date for display
     */
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } catch {
        return dateString;
      }
    },
  },
};
</script>

<style scoped>
.risk-summary {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.summary-loading,
.summary-error,
.summary-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: #7f8c8d;
}

.summary-error {
  color: #e74c3c;
}

.spinner-small {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.risk-level-card {
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1.5rem;
  color: white;
}

.risk-level-card.risk-low {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.risk-level-card.risk-medium {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.risk-level-card.risk-high {
  background: linear-gradient(135deg, #e67e22, #d35400);
}

.risk-level-card.risk-very-high {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.risk-level-label {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.risk-level-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.risk-level-percentage {
  font-size: 2rem;
  font-weight: 800;
}

.risk-factors {
  margin-bottom: 1.5rem;
}

.risk-factors h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.factor-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.factor-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
}

.factor-name {
  min-width: 100px;
  color: #34495e;
  font-weight: 500;
}

.factor-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.factor-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.factor-value {
  min-width: 40px;
  text-align: right;
  color: #7f8c8d;
  font-weight: 600;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .risk-summary {
    padding: 0.75rem;
  }

  .risk-level-card {
    padding: 1rem;
  }

  .risk-level-value {
    font-size: 1.2rem;
  }

  .risk-level-percentage {
    font-size: 1.5rem;
  }

  .summary-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .factor-name {
    min-width: 80px;
    font-size: 0.8rem;
  }
}
</style>

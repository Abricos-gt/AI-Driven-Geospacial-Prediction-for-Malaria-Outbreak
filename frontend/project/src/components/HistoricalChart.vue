<template>
  <div class="historical-chart">
    <div class="chart-header">
      <h3 class="chart-title">Historical Outbreak Trends</h3>
      <select
        v-model="selectedPeriod"
        @change="loadHistoricalData"
        class="period-select"
        aria-label="Select time period"
      >
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
        <option value="365">Last year</option>
      </select>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="chart-loading" role="status">
      <div class="spinner-small"></div>
      <p>Loading historical data...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="chart-error" role="alert">
      <p>{{ error }}</p>
      <button @click="loadHistoricalData" class="retry-btn">Retry</button>
    </div>

    <!-- Chart container -->
    <div v-else-if="chartData && chartData.length > 0" class="chart-container">
      <!-- Simple bar chart using CSS -->
      <div class="chart-bars">
        <div
          v-for="(point, index) in chartData"
          :key="index"
          class="chart-bar-wrapper"
          :title="`${point.date}: ${point.cases} cases`"
        >
          <div class="chart-bar" :style="{ height: `${getBarHeight(point.cases)}%` }">
            <span class="bar-value">{{ point.cases }}</span>
          </div>
          <div class="bar-label">{{ formatDateLabel(point.date) }}</div>
        </div>
      </div>

      <!-- Chart stats -->
      <div class="chart-stats">
        <div class="stat">
          <span class="stat-label">Total Cases</span>
          <span class="stat-value">{{ totalCases }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Average</span>
          <span class="stat-value">{{ averageCases }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Peak</span>
          <span class="stat-value">{{ peakCases }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="chart-empty">
      <p>No historical data available for the selected period.</p>
    </div>
  </div>
</template>

<script>
import { getHistoricalData } from '@/services/api';

export default {
  name: 'HistoricalChart',
  props: {
    region: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      chartData: [],
      loading: false,
      error: null,
      selectedPeriod: 30,
      maxCases: 0,
    };
  },
  computed: {
    totalCases() {
      return this.chartData.reduce((sum, point) => sum + (point.cases || 0), 0);
    },
    averageCases() {
      if (this.chartData.length === 0) return 0;
      return Math.round(this.totalCases / this.chartData.length);
    },
    peakCases() {
      if (this.chartData.length === 0) return 0;
      return Math.max(...this.chartData.map((point) => point.cases || 0));
    },
  },
  mounted() {
    this.loadHistoricalData();
  },
  watch: {
    region() {
      this.loadHistoricalData();
    },
  },
  methods: {
    /**
     * Load historical outbreak data
     */
    async loadHistoricalData() {
      try {
        this.loading = true;
        this.error = null;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - this.selectedPeriod);

        const params = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          aggregation: 'daily',
        };

        if (this.region) {
          params.region = this.region;
        }

        const data = await getHistoricalData(params);

        // Process data for chart
        // Expected format: [{ date, cases }] or { data: [{ date, cases }] }
        this.chartData = Array.isArray(data) ? data : (data.data || []);
        this.maxCases = Math.max(...this.chartData.map((p) => p.cases || 0), 1);

        this.loading = false;
      } catch (err) {
        this.error = err.isNetworkError
          ? err.message
          : 'Failed to load historical data. Please try again.';
        this.loading = false;
        console.error('Historical data loading error:', err);
      }
    },

    /**
     * Calculate bar height percentage
     */
    getBarHeight(cases) {
      if (this.maxCases === 0) return 0;
      return Math.max((cases / this.maxCases) * 100, 5); // Minimum 5% for visibility
    },

    /**
     * Format date label for display
     */
    formatDateLabel(dateString) {
      try {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return `${day} ${month}`;
      } catch {
        return dateString;
      }
    },
  },
};
</script>

<style scoped>
.historical-chart {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.period-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  background: white;
  cursor: pointer;
}

.period-select:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

.chart-loading,
.chart-error,
.chart-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #7f8c8d;
}

.chart-error {
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

.chart-container {
  min-height: 250px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.25rem;
  height: 200px;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.chart-bar {
  width: 100%;
  background: linear-gradient(to top, #e74c3c, #f39c12);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 4px;
  transition: height 0.3s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.25rem;
}

.bar-value {
  font-size: 0.7rem;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.bar-label {
  font-size: 0.65rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
  text-align: center;
  writing-mode: horizontal-tb;
  transform: rotate(-45deg);
  transform-origin: center;
  white-space: nowrap;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .chart-bars {
    height: 150px;
    gap: 0.15rem;
  }

  .bar-label {
    font-size: 0.6rem;
  }

  .chart-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>

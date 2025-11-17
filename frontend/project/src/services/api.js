/**
 * API Service Layer
 * Handles all backend API communication for malaria prediction platform
 * Uses async/await with proper error handling for low-resource environments
 */

import axios from 'axios';
import {
  mockGeospatialLayers,
  mockHeatmapData,
  mockHistoricalData,
  mockPredictionSummary,
  mockRiskPrediction,
} from '@/data/mockData';

// Base API URL - configure based on your backend
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';
const USE_MOCKS = process.env.VUE_APP_USE_MOCKS !== 'false';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for slow connections
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for logging (dev only) and error handling
 */
apiClient.interceptors.request.use(
  (config) => {
    const updatedConfig = {
      ...config,
      headers: {
        ...config.headers,
      },
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      updatedConfig.headers.Authorization = `Bearer ${token}`;
    }
    return updatedConfig;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor for global error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors gracefully
    if (!error.response) {
      const networkError = new Error('Network error. Please check your connection.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    return Promise.reject(error);
  },
);

const shouldUseMockData = (error) => (
  USE_MOCKS && (!error || error.isNetworkError || !error.response)
);

const withMockFallback = async (requestFn, mockFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (shouldUseMockData(error)) {
      return mockFn();
    }
    throw error;
  }
};

/**
 * API Methods
 */

/**
 * Get malaria risk prediction for a specific location or region
 * @param {Object} params - { lat, lng, date, region }
 * @returns {Promise} Prediction data with risk level and confidence
 */
export const getRiskPrediction = async (params) => withMockFallback(
  async () => {
    const response = await apiClient.get('/predictions/risk', { params });
    return response.data;
  },
  () => mockRiskPrediction(params),
);

/**
 * Get geospatial layer data (temperature, rainfall, humidity, population)
 * @param {string} layerType - 'temperature' | 'rainfall' | 'humidity' | 'population'
 * @param {Object} bounds - { north, south, east, west }
 * @param {string} date - ISO date string (optional)
 * @returns {Promise} Geospatial layer data (GeoJSON or tile URL)
 */
export const getGeospatialLayer = async (layerType, bounds, date = null) => withMockFallback(
  async () => {
    const params = {
      layer: layerType,
      ...bounds,
    };
    if (date) params.date = date;
    const response = await apiClient.get('/layers/geospatial', { params });
    return response.data;
  },
  () => mockGeospatialLayers[layerType] || mockGeospatialLayers.temperature,
);

/**
 * Get historical outbreak data
 * @param {Object} params - { region, startDate, endDate, aggregation }
 * @returns {Promise} Historical outbreak data array
 */
export const getHistoricalData = async (params) => withMockFallback(
  async () => {
    const response = await apiClient.get('/data/historical', { params });
    return response.data;
  },
  () => mockHistoricalData,
);

/**
 * Get current risk heatmap data for map visualization
 * @param {Object} bounds - Map bounds
 * @param {number} zoom - Map zoom level
 * @returns {Promise} Heatmap data points
 */
export const getRiskHeatmap = async (bounds, zoom) => withMockFallback(
  async () => {
    const response = await apiClient.get('/predictions/heatmap', {
      params: { ...bounds, zoom },
    });
    return response.data;
  },
  () => mockHeatmapData,
);

/**
 * Get prediction statistics and summary
 * @param {Object} params - { region, date }
 * @returns {Promise} Summary statistics
 */
export const getPredictionSummary = async (params) => withMockFallback(
  async () => {
    const response = await apiClient.get('/predictions/summary', { params });
    return response.data;
  },
  () => mockPredictionSummary,
);

export default apiClient;

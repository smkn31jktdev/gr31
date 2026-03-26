/**
 * Core Configuration Exports
 * Centralized exports for all configuration modules
 */

// API Configuration exports
export { API_CONFIG, getBackendUrl } from "./api.config";
export {
  baseUrl,
  apiVersion,
  isDevelopment,
  PROXY_ENDPOINTS,
  API_ENDPOINTS,
  toApiUrl,
  createAuthHeaders,
  API_NOTES,
} from "./api";

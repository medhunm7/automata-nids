import axios from 'axios';

/**
 * Resolves the API base URL cleanly.
 * In production (Vercel), uses VITE_API_URL (e.g. https://your-backend.onrender.com).
 * In local development, falls back to http://localhost:5000 or the local proxy.
 */
export const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    // Strip trailing slashes to prevent double slashes in paths
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nids_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // Client can handle re-authentication
    }
    return Promise.reject(error);
  }
);

export default api;

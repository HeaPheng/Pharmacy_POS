import axios from 'axios';

const API_BASE_URL = (() => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000/api`;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
})();
// Derive the Laravel root URL (without /api) for the CSRF cookie endpoint
const LARAVEL_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// Helper function to read a cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
}

// Create a pre-configured axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true, // Crucial for Sanctum cookie authentication
  withXSRFToken: true,    // Enable Axios's automatic CSRF token handling (Axios 1.6+)
});

// Track whether we've already fetched the CSRF cookie this session
let csrfCookieFetched = false;

// Request interceptor: automatically fetch CSRF cookie before mutating requests
axiosClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  const isMutating = ['post', 'put', 'patch', 'delete'].includes(method);

  if (isMutating) {
    const hasCookie = getCookie('XSRF-TOKEN');
    if (!hasCookie || !csrfCookieFetched) {
      await axios.get(`${LARAVEL_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });
      csrfCookieFetched = true;
    }

    // Explicitly set the header from the cookie to ensure compatibility
    const token = getCookie('XSRF-TOKEN');
    if (token) {
      config.headers['X-XSRF-TOKEN'] = token;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for global error handling
axiosClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  // If we get a CSRF mismatch (419), reset the flag and retry once
  if (error.response && error.response.status === 419) {
    csrfCookieFetched = false;
  }
  // Handle 401 Unauthorized (session expired)
  if (error.response && error.response.status === 401) {
    // Future: redirect to login
  }
  return Promise.reject(error);
});

export default axiosClient;

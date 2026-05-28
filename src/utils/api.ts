import axios from 'axios';

// Instantiate pre-configured Axios client
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure client interceptor to attach JWT automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('workpulse_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gracefully handle session expirations / invalid logins
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear storage only if previous auth details existed to prevent loop
      if (localStorage.getItem('workpulse_token')) {
        localStorage.removeItem('workpulse_token');
        localStorage.removeItem('workpulse_user');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

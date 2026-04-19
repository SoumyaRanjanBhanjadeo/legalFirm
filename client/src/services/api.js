import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Prevent caching for POST requests
    if (config.method === 'post') {
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Pragma'] = 'no-cache';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on login page errors
    const isLoginPage = window.location.pathname === '/login';
    
    // Handle authentication errors (only if not on login page)
    if (error.response?.status === 401 && !isLoginPage) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle forbidden errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

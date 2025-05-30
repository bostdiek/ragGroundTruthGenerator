import axios from 'axios';

/**
 * API Service
 * 
 * This file sets up the API communication with the backend.
 */

// Get API base URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with common configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Authentication Interceptor
 * 
 * This interceptor adds authentication tokens to outgoing requests.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * This interceptor handles common response errors like 401 Unauthorized.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Handle unauthorized errors (expired token, etc.)
      if (error.response.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
      
      // Add additional error handling as needed
    }
    
    return Promise.reject(error);
  }
);

export default api;

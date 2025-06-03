import axios from 'axios';

/**
 * API Service
 * 
 * This file sets up the API communication with the backend.
 */

// Get API base URL from environment variables
let defaultUrl = 'http://localhost:8000'; // Default to port 8000 to match docker-compose configuration
// Always use localhost for browser access, regardless of environment variable
const API_URL = process.env.REACT_APP_API_URL || defaultUrl;

console.log('Using API URL:', API_URL);

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
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * This interceptor handles common response errors like 401 Unauthorized.
 */
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    // Log request errors
    if (error.response) {
      console.error('API Error:', error.config?.url, error.response.status, error.response.data);
    } else if (error.request) {
      console.error('API Request Error (No Response):', error.request);
    } else {
      console.error('API Error Setup:', error.message);
    }
    
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

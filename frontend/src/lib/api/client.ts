import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * API Client Configuration
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Create axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    return Promise.reject(createApiError(error));
  }
);

/**
 * Create standardized API error from axios error
 */
export const createApiError = (error: AxiosError): ApiError => {
  const message =
    (error.response?.data as any)?.message ||
    error.message ||
    'An unexpected error occurred';
  const status = error.response?.status || 500;
  const code = (error.response?.data as any)?.code || 'UNKNOWN_ERROR';

  return {
    message,
    status,
    code,
    details: (error.response?.data as any)?.details,
    originalError: error,
  };
};

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  status: number;
  code: string;
  details?: any;
  originalError?: AxiosError;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

/**
 * Paginated response interface
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default apiClient;

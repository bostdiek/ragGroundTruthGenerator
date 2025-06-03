import api from './api';

/**
 * Authentication Service
 * 
 * This service handles authentication-related API calls.
 */

// Types
interface LoginRequest {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

interface UserInfo {
  id: string;
  username: string;
  email: string;
  full_name?: string;
}

/**
 * Get the authentication provider from environment variables
 */
const AUTH_PROVIDER = process.env.REACT_APP_AUTH_PROVIDER || 'simple';

/**
 * Authentication Service Factory
 * 
 * Factory function to create an authentication service based on the environment configuration.
 */
const createAuthService = () => {
  // Simple authentication service
  if (AUTH_PROVIDER === 'simple') {
    return {
      /**
       * Login with username and password
       * 
       * @param credentials - The login credentials
       * @returns Promise with token response
       */
      login: async (credentials: LoginRequest): Promise<TokenResponse> => {
        const response = await api.post<TokenResponse>('/auth/login', credentials);
        
        if (response.data.access_token) {
          localStorage.setItem('auth_token', response.data.access_token);
          localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        }
        
        return response.data;
      },
      
      /**
       * Get current user information
       * 
       * @returns Promise with user information
       */
      getCurrentUser: async (): Promise<UserInfo> => {
        // Try to get from localStorage first for quick access
        const cachedUser = localStorage.getItem('auth_user');
        if (cachedUser) {
          return JSON.parse(cachedUser);
        }
        
        // If not in localStorage, fetch from API
        const response = await api.get<UserInfo>('/auth/me');
        return response.data;
      },
      
      /**
       * Logout the current user
       */
      logout: (): void => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      },
      
      /**
       * Check if user is authenticated
       * 
       * @returns boolean indicating if the user is authenticated
       */
      isAuthenticated: (): boolean => {
        return !!localStorage.getItem('auth_token');
      },
    };
  }
  
  // Default to simple auth if no provider specified
  return {
    login: async (credentials: LoginRequest): Promise<TokenResponse> => {
      const response = await api.post<TokenResponse>('/auth/login', credentials);
      
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    },
    
    getCurrentUser: async (): Promise<UserInfo> => {
      const cachedUser = localStorage.getItem('auth_user');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }
      
      const response = await api.get<UserInfo>('/auth/me');
      return response.data;
    },
    
    logout: (): void => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
    
    isAuthenticated: (): boolean => {
      return !!localStorage.getItem('auth_token');
    },
  };
};

// Create and export the auth service
const AuthService = createAuthService();
export default AuthService;
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useInvalidateAllQueries } from '../../../lib/react-query';
import AuthService from '../../auth/api/auth.service';

/**
 * Authentication Context
 *
 * This context provides authentication state and methods to the application.
 */

// Types
interface UserInfo {
  id: string;
  username: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {
    /* Implementation will be provided by the context provider */
  },
  logout: () => {
    /* Implementation will be provided by the context provider */
  },
  error: null,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const invalidateAllQueries = useInvalidateAllQueries();

  /**
   * Check if user is already authenticated on component mount
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        // Clear invalid token
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Login function
   */
  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login({ username, password });
      const userData = response.user;
      setUser(userData);
    } catch (err: any) {
      console.error('Login failed:', err);

      // Set appropriate error message
      if (err.response && err.response.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Login failed. Please try again later.');
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    AuthService.logout();
    setUser(null);
    invalidateAllQueries(); // Clear all cached queries on logout
  };

  // Compute authentication state
  const isAuthenticated = !!user;

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

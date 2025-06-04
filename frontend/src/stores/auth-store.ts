import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import AuthService from '../features/auth/api/auth.service';

/**
 * User information interface
 */
interface UserInfo {
  id: string;
  username: string;
  email: string;
  full_name?: string;
}

/**
 * Auth state interface
 */
interface AuthState {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserInfo | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Auth store
 *
 * Provides global authentication state using Zustand
 * Uses persist middleware to store authentication state in localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      // Set user information
      setUser: user =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      // Set loading state
      setLoading: isLoading => set({ isLoading }),

      // Set error message
      setError: error => set({ error }),

      // Login function
      login: async (username, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await AuthService.login({ username, password });
          const userData = response.user;

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          console.error('Login failed:', err);

          let errorMessage = 'Login failed. Please try again later.';
          if (err.response && err.response.status === 401) {
            errorMessage = 'Invalid username or password';
          }

          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });

          throw err;
        }
      },

      // Logout function
      logout: () => {
        AuthService.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: 'auth-storage', // name of the item in storage
      partialize: state => ({ user: state.user }), // only store user data
    }
  )
);

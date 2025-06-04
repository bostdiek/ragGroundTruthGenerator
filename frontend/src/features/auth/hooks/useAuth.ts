/**
 * Authentication Hooks
 *
 * This file contains React Query hooks for authentication-related API calls.
 */

import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient } from '../../../lib/api/client';
import { LoginRequest, TokenResponse, UserInfo } from '../api/auth.service';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  login: () => [...authKeys.all, 'login'] as const,
};

/**
 * Hook to login with username and password
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<TokenResponse>(
        '/auth/login',
        credentials
      );

      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      }

      return response.data;
    },
  });
};

/**
 * Hook to get current user information
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      // Try to get from localStorage first for quick access
      const cachedUser = localStorage.getItem('auth_user');
      if (cachedUser) {
        return JSON.parse(cachedUser) as UserInfo;
      }

      // If not in localStorage, fetch from API
      const response = await apiClient.get<UserInfo>('/auth/me');
      return response.data;
    },
    retry: false,
    staleTime: Infinity, // User info doesn't change frequently
  });
};

/**
 * Hook to logout the current user
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return true;
    },
  });
};

/**
 * Function to check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

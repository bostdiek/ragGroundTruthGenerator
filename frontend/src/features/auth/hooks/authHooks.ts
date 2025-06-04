import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  getUserProfile,
  login,
  logout,
  refreshToken,
} from '../api/authService';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, LoginResponse, User } from '../types/authTypes';

/**
 * Hook to perform login and store credentials
 */
export function useLogin() {
  const doLogin = useAuthStore(state => state.login);
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: data => login(data),
    onSuccess: data => {
      doLogin(data);
    },
  });
}

/**
 * Hook to perform logout and clear store
 */
export function useLogout() {
  const doLogout = useAuthStore(state => state.logout);
  return useMutation<void, Error, void>({
    mutationFn: () => logout(),
    onSuccess: () => {
      doLogout();
    },
  });
}

/**
 * Hook to fetch and cache user profile
 */
export function useUser() {
  const token = useAuthStore(state => state.token);
  const setUser = useAuthStore(state => state.setUser);

  // Fetch user profile
  const query = useQuery<User, Error>({
    queryKey: ['auth', 'profile'],
    queryFn: getUserProfile,
    enabled: !!token,
  });
  // Sync to store when data arrives
  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);
  return query;
}

/**
 * Hook to refresh authentication token
 */
export function useRefreshToken() {
  const doLogin = useAuthStore(state => state.login);
  return useMutation<LoginResponse, Error, void>({
    mutationFn: () => refreshToken(),
    onSuccess: data => {
      doLogin(data);
    },
  });
}

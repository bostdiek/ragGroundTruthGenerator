import { apiClient } from '../../../lib/api/client';
import { LoginRequest, LoginResponse, User } from '../types/authTypes';

/**
 * Auth API services
 */
export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    '/auth/login',
    credentials
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const getUserProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/profile');
  return response.data;
};

export const refreshToken = async (): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/refresh');
  return response.data;
};

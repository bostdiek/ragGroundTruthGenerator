import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AuthService from '../../features/auth/api/auth.service';
import { apiClient } from '../../lib/api/client';
import { mockTokenResponse, mockUser } from '../../testing/mocks/handlers';

// Mock the API module
vi.mock('../../lib/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should make a POST request to /auth/login with credentials', async () => {
      const credentials = { username: 'testuser', password: 'password' };

      // Mock successful response
      (apiClient.post as any).mockResolvedValue({ data: mockTokenResponse });

      const result = await AuthService.login(credentials);

      // Should call API with correct endpoint and data
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);

      // Should return the token response
      expect(result).toEqual(mockTokenResponse);

      // Should store token and user in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_token',
        mockTokenResponse.access_token
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_user',
        JSON.stringify(mockTokenResponse.user)
      );
    });

    it('should throw an error for failed login', async () => {
      const credentials = { username: 'wrong', password: 'wrong' };

      // Mock failed response
      (apiClient.post as any).mockRejectedValue(new Error('Unauthorized'));

      // Should throw error
      await expect(AuthService.login(credentials)).rejects.toThrow(
        'Unauthorized'
      );

      // Should not store anything in localStorage
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage if available', async () => {
      // Set up localStorage with user data
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      const user = await AuthService.getCurrentUser();

      // Should return user from localStorage
      expect(user).toEqual(mockUser);

      // Should not make API call
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch user from API if not in localStorage', async () => {
      // Mock successful response
      (apiClient.get as any).mockResolvedValue({ data: mockUser });

      const user = await AuthService.getCurrentUser();

      // Should call API
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');

      // Should return user from API
      expect(user).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should remove user and token from localStorage', () => {
      // Set up localStorage
      localStorage.setItem('auth_token', 'token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));

      AuthService.logout();

      // Should remove items from localStorage
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists in localStorage', () => {
      localStorage.setItem('auth_token', 'token');

      const isAuthenticated = AuthService.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    it('should return false if token does not exist in localStorage', () => {
      const isAuthenticated = AuthService.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });
  });
});

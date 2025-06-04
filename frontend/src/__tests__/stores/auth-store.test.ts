import { beforeEach, describe, expect, it, vi } from 'vitest';

import AuthService from '../../features/auth/api/auth.service';
import { useAuthStore } from '../../stores/auth-store';

// Mock the AuthService
vi.mock('../../features/auth/api/auth.service', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('Auth Store', () => {
  // Reset the store before each test
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should update user on setUser', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    };
    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle login successfully', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    };
    (AuthService.login as any).mockResolvedValueOnce({ user: mockUser });

    await useAuthStore.getState().login('testuser', 'password');

    expect(AuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password',
    });
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle login failure', async () => {
    const mockError: any = new Error('Login failed');
    mockError.response = { status: 401 };
    (AuthService.login as any).mockRejectedValueOnce(mockError);

    try {
      await useAuthStore.getState().login('testuser', 'wrong-password');
      // If login doesn't throw, fail the test
      expect(true).toBe(false);
    } catch (error) {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid username or password');
    }
  });

  it('should handle logout', () => {
    // First set a user
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    };
    useAuthStore.getState().setUser(mockUser);

    // Then logout
    useAuthStore.getState().logout();

    expect(AuthService.logout).toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });
});
